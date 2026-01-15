from django.urls import path
from .views import TransactionAPIView, PaymentVerificationAPIView, OrderListAPIView

urlpatterns = [
    path('create-order/', TransactionAPIView.as_view(), name='create-order'),
    path('verify-payment/', PaymentVerificationAPIView.as_view(), name='verify-payment'),
    path('orders/', OrderListAPIView.as_view(), name='order-list'),
]
