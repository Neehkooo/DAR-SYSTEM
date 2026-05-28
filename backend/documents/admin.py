from django.contrib import admin
from .models import NOADocument, NTPDocument, ResoDirectAcquisition, ResoSVP, ResoLOV, ResoEmergencySplit, ActivityLog, Signatory

@admin.register(NOADocument)
class NOADocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'doc_date', 'activity', 'amount', 'date_created')
    search_fields = ('name', 'activity')
    list_filter = ('doc_date',)

@admin.register(NTPDocument)
class NTPDocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'doc_date', 'activity', 'amount', 'date_created')
    search_fields = ('name', 'activity')
    list_filter = ('doc_date',)

@admin.register(ResoDirectAcquisition)
class ResoDirectAcquisitionAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'reso_date', 'purpose', 'award_amount', 'date_created')
    search_fields = ('company_name', 'purpose')
    list_filter = ('reso_date',)

@admin.register(ResoSVP)
class ResoSVPAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'reso_date', 'purpose', 'award_amount', 'date_created')
    search_fields = ('company_name', 'purpose')
    list_filter = ('reso_date',)

@admin.register(ResoLOV)
class ResoLOVAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'reso_date', 'purpose', 'award_amount', 'date_created')
    search_fields = ('company_name', 'purpose')
    list_filter = ('reso_date',)

@admin.register(ResoEmergencySplit)
class ResoEmergencySplitAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'reso_date', 'purpose', 'award_amount', 'date_created')
    search_fields = ('company_name', 'purpose')
    list_filter = ('reso_date',)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'description', 'timestamp')
    search_fields = ('user', 'action', 'description')
    list_filter = ('action', 'timestamp')

@admin.register(Signatory)
class SignatoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'designation', 'role', 'is_deleted')
    search_fields = ('name', 'designation', 'role')
    list_filter = ('role', 'is_deleted')
