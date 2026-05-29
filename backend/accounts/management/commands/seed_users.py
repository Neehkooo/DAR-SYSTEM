"""
Management command to create test users for development/testing.
"""
import sys
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create test users for development/testing'

    def handle(self, *args, **options):
        try:
            print("Starting seed_users command...", file=sys.stderr)
            
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
                msg = 'Created test user: rome / rome12345'
                print(msg, file=sys.stderr)
                self.stdout.write(self.style.SUCCESS(msg))
            else:
                msg = 'Test user "rome" already exists'
                print(msg, file=sys.stderr)
                self.stdout.write(self.style.WARNING(msg))

            # Create admin user
            if not User.objects.filter(username='admin').exists():
                User.objects.create_superuser(
                    username='admin',
                    password='admin12345',
                    email='admin@test.com'
                )
                msg = 'Created admin user: admin / admin12345'
                print(msg, file=sys.stderr)
                self.stdout.write(self.style.SUCCESS(msg))
            else:
                msg = 'Admin user already exists'
                print(msg, file=sys.stderr)
                self.stdout.write(self.style.WARNING(msg))
            
            print("seed_users command completed successfully", file=sys.stderr)
        except Exception as e:
            error_msg = f'Error in seed_users: {str(e)}'
            print(error_msg, file=sys.stderr)
            self.stdout.write(self.style.ERROR(error_msg))
            raise
