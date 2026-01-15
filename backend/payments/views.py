from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.conf import settings
import razorpay
from .models import Order
from .serializers import OrderSerializer

class OrderListAPIView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-order_date')
    serializer_class = OrderSerializer

class TransactionAPIView(APIView):
    def post(self, request):
        name = request.data.get('name')
        amount = request.data.get('amount')
        
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        payment = client.order.create({
            "amount": int(amount) * 100, # Razorpay expects amount in paise
            "currency": "INR",
            "payment_capture": "1"
        })
        
        order = Order.objects.create(
            order_product=name,
            order_amount=amount,
            order_payment_id=payment['id']
        )
        
        serializer = OrderSerializer(order)
        
        data = {
            "payment": payment,
            "order": serializer.data
        }
        
        return Response(data)

class PaymentVerificationAPIView(APIView):
    def post(self, request):
        data = request.data
        
        # Verify signature
        # Razorpay signature verification
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        try:
            # We need razorpay_order_id, razorpay_payment_id, razorpay_signature
            params_dict = {
                'razorpay_order_id': data['razorpay_order_id'],
                'razorpay_payment_id': data['razorpay_payment_id'],
                'razorpay_signature': data['razorpay_signature']
            }
            client.utility.verify_payment_signature(params_dict)
            
            # If successful, mark order as paid
            order = Order.objects.get(order_payment_id=data['razorpay_order_id'])
            order.isPaid = True
            order.save()
            
            return Response({'status': 'Payment Verified'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'status': 'Payment Verification Failed', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
