import pytest
from django.urls import reverse
from django.contrib.auth.models import User
from expenses.models import Group, Expense, ExpenseSplit
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_mark_split_settled():
    # Create users
    payer = User.objects.create_user(username='payer', password='testpass')
    debtor = User.objects.create_user(username='debtor', password='testpass')
    # Create group and add members
    group = Group.objects.create(name='Test Group')
    group.members.add(payer, debtor)
    # Create expense paid by payer
    expense = Expense.objects.create(description='Dinner', amount=100, payer=payer, group=group)
    # Create split for debtor (unsettled)
    split = ExpenseSplit.objects.create(expense=expense, user=debtor, amount_owed=100, is_settled=False)
    client = APIClient()
    client.force_authenticate(user=debtor)
    url = reverse('split-settle', args=[split.id])
    response = client.post(url)
    assert response.status_code == 200
    split.refresh_from_db()
    assert split.is_settled is True
    assert response.data['message'] == 'Split marked as settled'
