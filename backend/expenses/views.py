from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from .models import Group, Expense, ExpenseSplit
from .serializers import GroupSerializer, ExpenseSerializer, UserSerializer

class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            # Simple token gen (or just return ID for MVP if tokens aren't set up yet, 
            # but let's try to be proper if possible, or just return user info)
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterAPIView(APIView):
    def post(self, request):
        username = request.data.get('email') # Use email as username
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not username or not password:
             return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=username, password=password, first_name=first_name, last_name=last_name)
        
        return Response({
            'message': 'User created successfully',
            'id': user.id,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_201_CREATED)

class UserProfileAPIView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.email = request.data.get('email', user.email)
            user.save()
            return Response({'message': 'Profile updated'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class GroupListCreateAPIView(generics.ListCreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def post(self, request, *args, **kwargs):
        name = request.data.get('name')
        user_id = request.data.get('user_id') # Explicitly passed for now

        if not name:
            return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)

        group = Group.objects.create(name=name)
        
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                group.members.add(user)
            except User.DoesNotExist:
                pass # Just create group without member if user invalid
        
        serializer = self.get_serializer(group)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class GroupRetrieveDestroyAPIView(generics.RetrieveDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class ExpenseListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        queryset = Expense.objects.all()
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset

    def post(self, request, *args, **kwargs):
        description = request.data.get('description')
        amount = float(request.data.get('amount'))
        payer_id = request.data.get('payer')
        group_id = request.data.get('group')

        try:
            payer = User.objects.get(id=payer_id)
            group = Group.objects.get(id=group_id)
        except (User.DoesNotExist, Group.DoesNotExist):
            return Response({'error': 'Invalid payer or group'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Expense
        expense = Expense.objects.create(
            description=description,
            amount=amount,
            payer=payer,
            group=group
        )

        # Split Logic
        participant_ids = request.data.get('participants', [])
        if participant_ids:
            members = User.objects.filter(id__in=participant_ids)
        else:
            members = group.members.all()

        if not members:
            # If no participants specified and no members in group, default to just the payer
            members = [payer]
        
        count = len(members) if isinstance(members, list) else members.count()
        if count > 0:
            split_amount = amount / count
            for member in members:
                ExpenseSplit.objects.create(
                    expense=expense,
                    user=member,
                    amount_owed=split_amount,
                    is_settled=(member == payer)
                )
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BalanceAPIView(APIView):
    def get(self, request, user_id):
        # Calculate how much 'user_id' owes and is owed
        # This is a simplified demo version
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        # You owe: Splits where user is 'user' and is_settled=False
        owed = ExpenseSplit.objects.filter(user=user, is_settled=False).exclude(expense__payer=user)
        total_owed = sum(split.amount_owed for split in owed)
        
        # You are owed: Expenses you paid, minus your own share (which is marked settled)
        paid_expenses = Expense.objects.filter(payer=user)
        total_owed_to_you = 0
        for exp in paid_expenses:
            # Sum of unsettled splits from OTHER users
            unsettled = exp.splits.filter(is_settled=False).exclude(user=user)
            total_owed_to_you += sum(split.amount_owed for split in unsettled)

        return Response({
            'user': user.username,
            'you_owe': total_owed,
            'owed_to_you': total_owed_to_you
        })

class SettleUpAPIView(APIView):
    def post(self, request):
        # Settle all debts with a specific user
        friend_id = request.data.get('friend_id')
        user_id = request.data.get('user_id') # In real app, get from request.user

        try:
            payer = User.objects.get(id=user_id) # The one paying back
            receiver = User.objects.get(id=friend_id) # The one being paid back
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Find all splits where I owe the receiver
        # My splits (user=me), Expense payer = receiver, Settled = False
        debts = ExpenseSplit.objects.filter(
            user=payer, 
            expense__payer=receiver, 
            is_settled=False
        )
        
        count = debts.count()
        total = sum(d.amount_owed for d in debts)
        
        # Mark all as settled
        debts.update(is_settled=True)

        return Response({
            'message': f'Settled {count} debts totaling {total}',
            'amount_settled': total
        })

class AddMemberToGroupAPIView(APIView):
    def post(self, request, group_id):
        email = request.data.get('email')
        name = request.data.get('name', '')
        
        try:
            group = Group.objects.get(id=group_id)
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email}
            )
            
            if created and name:
                parts = name.split(' ', 1)
                user.first_name = parts[0]
                if len(parts) > 1:
                    user.last_name = parts[1]
                user.set_unusable_password()
                user.save()
            elif not user.first_name and name: # Update existing placeholder if they don't have a name yet
                parts = name.split(' ', 1)
                user.first_name = parts[0]
                if len(parts) > 1:
                    user.last_name = parts[1]
                user.save()
            
            group.members.add(user)
            return Response({
                'message': f'Added {user.first_name or user.email} to group',
                'created': created
            })
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=404)

class UserProfileUpdateAPIView(APIView):
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            if 'username' in request.data:
                user.username = request.data.get('username')
            user.save()

            # Update avatar_url if provided
            avatar_url = request.data.get('avatar_url')
            if avatar_url:
                from .models import Profile
                profile, _ = Profile.objects.get_or_create(user=user)
                profile.avatar_url = avatar_url
                profile.save()

            return Response({
                'message': 'Profile updated successfully',
                'user': UserSerializer(user).data
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class MonthlyUsageAPIView(APIView):
    def get(self, request, user_id):
        # Returns spending per month for this user
        usage = Expense.objects.filter(payer_id=user_id) \
            .annotate(month=TruncMonth('date')) \
            .values('month') \
            .annotate(total=Sum('amount')) \
            .order_by('month')
            
        data = []
        for entry in usage:
            data.append({
                'month': entry['month'].strftime('%b %Y'),
                'amount': float(entry['total'])
            })
            
        return Response(data)
