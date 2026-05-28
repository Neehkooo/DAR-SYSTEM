from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NOADocumentViewSet, NTPDocumentViewSet, ResoDirectAcquisitionViewSet,
    ResoSVPViewSet, ResoLOVViewSet, ResoEmergencySplitViewSet, ActivityLogViewSet,
    BackupDownloadView, BackupRestoreView, BackupInfoView, DashboardStatsView, SignatoryViewSet
)

router = DefaultRouter()
router.register(r'noa', NOADocumentViewSet)
router.register(r'ntp', NTPDocumentViewSet)
router.register(r'reso', ResoDirectAcquisitionViewSet)
router.register(r'reso_svp', ResoSVPViewSet)
router.register(r'reso_lov', ResoLOVViewSet)
router.register(r'reso_emergency_split', ResoEmergencySplitViewSet)
router.register(r'activity_logs', ActivityLogViewSet)
router.register(r'signatories', SignatoryViewSet)

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('backup/download/', BackupDownloadView.as_view(), name='backup-download'),
    path('backup/restore/', BackupRestoreView.as_view(), name='backup-restore'),
    path('backup/info/', BackupInfoView.as_view(), name='backup-info'),
    path('', include(router.urls)),
]
