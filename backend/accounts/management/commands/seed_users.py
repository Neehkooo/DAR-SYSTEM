"""
Management command to create test users for development/testing.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create test users for development/testing'

    def handle(self, *args, **options):
        # Create test user 'rome'
        if not User.objects.filter(username='rome').exists():
            User.objects.create_user(
                username='rome',
                password='rome12345',
                first_name='Rome',
                last_name='Test',
                email='rome@test.com',
                is_active=True,
                is_staff=False,
                is_superuser=False
            )
            self.stdout.write(self.style.SUCCESS('Created test user: rome / rome12345'))
        else:
            self.stdout.write(self.style.WARNING('Test user "rome" already exists'))

        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                password='admin12345',
                email='admin@test.com'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user: admin / admin12345'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))
