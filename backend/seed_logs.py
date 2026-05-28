import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from documents.models import ActivityLog

# Clear existing logs just in case
ActivityLog.objects.all().delete()

# Create dummy data
logs = [
    {'user': 'Admin User', 'action': 'LOGIN', 'description': 'Logged into the system successfully.'},
    {'user': 'Admin User', 'action': 'GENERATE', 'description': 'Generated RESO for LOV - "LU OVERLOAD RESTAURANT".'},
    {'user': 'Employee User', 'action': 'CREATE', 'description': 'Created new NOA Document for "ABC Corporation".'},
    {'user': 'Admin User', 'action': 'UPDATE', 'description': 'Updated Document Settings configuration.'},
    {'user': 'Employee User', 'action': 'LOGOUT', 'description': 'Logged out of the system.'}
]

for log in logs:
    ActivityLog.objects.create(**log)

print("Successfully seeded Activity Logs into the database!")
