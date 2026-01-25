import os
import django
import sys

# Setup Django environment
sys.path.append('/Users/mac/divide-it/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from expenses.models import ExpenseSplit
from django.utils import timezone

splits = ExpenseSplit.objects.filter(is_settled=True)
print(f"Total settled splits: {splits.count()}")
for s in splits:
    print(f"ID: {s.id}, User: {s.user.username}, Payer: {s.expense.payer.username}, Settled At: {s.settled_at}")
