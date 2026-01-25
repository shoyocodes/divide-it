from django.urls import path
from .views import (
    GroupListCreateAPIView, GroupRetrieveDestroyAPIView, ExpenseListCreateAPIView,
    BalanceAPIView, LoginAPIView, UserProfileAPIView, RegisterAPIView,
    SettleUpAPIView, MarkSplitSettledAPIView, AddMemberToGroupAPIView, UserProfileUpdateAPIView, MonthlyUsageAPIView,
    PasswordResetRequestAPIView, PasswordResetConfirmAPIView, ExpenseRetrieveDestroyAPIView,
    UserBalanceBreakdownAPIView, HistoryAPIView
)

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('profile/<int:user_id>/', UserProfileAPIView.as_view(), name='user-profile'),
    path('profile/<int:user_id>/update/', UserProfileUpdateAPIView.as_view(), name='user-profile-update'),
    path('usage/<int:user_id>/', MonthlyUsageAPIView.as_view(), name='monthly-usage'),
    path('groups/', GroupListCreateAPIView.as_view(), name='group-list'),
    path('groups/<int:pk>/', GroupRetrieveDestroyAPIView.as_view(), name='group-detail'),
    path('groups/<int:group_id>/add_member/', AddMemberToGroupAPIView.as_view(), name='add-member'),
    path('expenses/', ExpenseListCreateAPIView.as_view(), name='expense-list'),
    path('expenses/<int:pk>/', ExpenseRetrieveDestroyAPIView.as_view(), name='expense-detail'),
    path('balance/<int:user_id>/', BalanceAPIView.as_view(), name='balance'),
    path('balance/breakdown/<int:user_id>/', UserBalanceBreakdownAPIView.as_view(), name='balance-breakdown'),
    path('settle/', SettleUpAPIView.as_view(), name='settle-up'),
    path('splits/<int:split_id>/settle/', MarkSplitSettledAPIView.as_view(), name='split-settle'),
    path('history/<int:user_id>/', HistoryAPIView.as_view(), name='history'),
    path('password-reset/', PasswordResetRequestAPIView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/', PasswordResetConfirmAPIView.as_view(), name='password-reset-confirm'),
]
