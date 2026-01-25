import os
import django
import sys

# Setup Django environment
sys.path.append('/Users/mac/divide-it/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from expenses.models import User, Expense, ExpenseSplit
from django.db.models import Q
from expenses.serializers import ExpenseSplitSerializer
from django.utils import timezone

def test_history(user_id):
    try:
        user = User.objects.get(id=user_id)
        
        # 1. Get Expenses where user is payer or receiver
        expenses = Expense.objects.filter(
            Q(payer=user) | Q(splits__user=user)
        ).distinct()
        
        # 2. Get Settlements where user is payer or receiver
        settled_splits = ExpenseSplit.objects.filter(
            is_settled=True,
            settled_at__isnull=False
        ).filter(
            Q(user=user) | Q(expense__payer=user)
        ).distinct()

        events = []
        
        # Add Expense Creation Events
        for exp in expenses:
            events.append({
                'id': f"exp_{exp.id}",
                'type': 'expense',
                'description': exp.description,
                'amount': float(exp.amount),
                'date': exp.date,
                'payer': exp.payer.id,
                'payer_name': f"{exp.payer.first_name} {exp.payer.last_name}".strip() or exp.payer.username,
                'group_name': exp.group.name,
                'splits': ExpenseSplitSerializer(exp.splits.all(), many=True).data
            })
            
        # Add Settlement (Payment) Events
        for split in settled_splits:
            is_receiving = split.expense.payer == user
            events.append({
                'id': f"settle_{split.id}",
                'type': 'payment',
                'description': f"Payment for {split.expense.description}",
                'amount': float(split.amount_owed),
                'date': split.settled_at,
                'from_user': split.user.username,
                'to_user': split.expense.payer.username,
                'is_receiving': is_receiving,
                'group_name': split.expense.group.name
            })

        print(f"Total events found: {len(events)}")
        
        # Sort
        events.sort(key=lambda x: x['date'], reverse=True)
        print("Successfully sorted events")
        
    except Exception as e:
        import traceback
        traceback.print_exc()

test_history(1)
