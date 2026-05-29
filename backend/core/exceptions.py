"""
Custom exception handlers for DRF to ensure JSON responses in all cases.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that ensures JSON responses even when DEBUG=False.
    Handles both DRF and Django exceptions.
    """
    # Call the default DRF exception handler first
    response = exception_handler(exc, context)
    
    # If DRF handled it, return it as-is
    if response is not None:
        return response
    
    # For unhandled exceptions, return a JSON error response
    return Response(
        {'error': 'An unexpected error occurred. Please try again.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
