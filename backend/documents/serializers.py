from rest_framework import serializers
from .models import NOADocument, NTPDocument, ResoDirectAcquisition, ResoSVP, ResoLOV, ResoEmergencySplit, ActivityLog, Signatory

class NOADocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NOADocument
        fields = '__all__'

class NTPDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NTPDocument
        fields = '__all__'

class ResoDirectAcquisitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResoDirectAcquisition
        fields = '__all__'

class ResoSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResoSVP
        fields = '__all__'

class ResoLOVSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResoLOV
        fields = '__all__'

class ResoEmergencySplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResoEmergencySplit
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'

class SignatorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Signatory
        fields = '__all__'

