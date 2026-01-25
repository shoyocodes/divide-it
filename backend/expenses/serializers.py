from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Group, Expense, ExpenseSplit

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url']

    def get_avatar_url(self, obj):
        try:
            return obj.profile.avatar_url
        except:
            return None

class GroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Group
        fields = '__all__'

class ExpenseSplitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ExpenseSplit
        fields = ['id', 'user', 'amount_owed', 'is_settled']

class ExpenseSerializer(serializers.ModelSerializer):
    payer_name = serializers.SerializerMethodField()
    payer_details = UserSerializer(source='payer', read_only=True)
    splits = ExpenseSplitSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'description', 'amount', 'payer', 'payer_name', 'payer_details', 'group', 'date', 'splits']

    def get_payer_name(self, obj):
        user = obj.payer
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.username
