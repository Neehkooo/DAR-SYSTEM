from rest_framework import viewsets, status as drf_status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import connections
from rest_framework.decorators import action
from django.http import FileResponse
from django.conf import settings
import os
import shutil

from .models import (
    NOADocument, NTPDocument, ResoDirectAcquisition, ResoSVP,
    ResoLOV, ResoEmergencySplit, ActivityLog, Signatory
)
from .serializers import (
    NOADocumentSerializer, NTPDocumentSerializer, ResoDirectAcquisitionSerializer,
    ResoSVPSerializer, ResoLOVSerializer, ResoEmergencySplitSerializer,
    ActivityLogSerializer, SignatorySerializer
)


# ─── Helper ────────────────────────────────────────────────────────────────────
def _get_user(request):
    """Read the acting user from the X-User request header (set by the frontend)."""
    return request.headers.get('X-User', 'System')


def _log(user, action, description):
    ActivityLog.objects.create(user=user, action=action, description=description)


# ─── Document ViewSets ──────────────────────────────────────────────────────────

class NOADocumentViewSet(viewsets.ModelViewSet):
    queryset = NOADocument.objects.all().order_by('-date_created')
    serializer_class = NOADocumentSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'CREATE', f'Created NOA document for {instance.name} (Activity: {instance.activity})')

    def perform_update(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'UPDATE', f'Updated NOA document for {instance.name}')

    def perform_destroy(self, instance):
        user = _get_user(self.request)
        _log(user, 'DELETE', f'Deleted NOA document for {instance.name}')
        instance.delete()


class NTPDocumentViewSet(viewsets.ModelViewSet):
    queryset = NTPDocument.objects.all().order_by('-date_created')
    serializer_class = NTPDocumentSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'CREATE', f'Created NTP document for {instance.name} (Activity: {instance.activity})')

    def perform_update(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'UPDATE', f'Updated NTP document for {instance.name}')

    def perform_destroy(self, instance):
        user = _get_user(self.request)
        _log(user, 'DELETE', f'Deleted NTP document for {instance.name}')
        instance.delete()


class ResoDirectAcquisitionViewSet(viewsets.ModelViewSet):
    queryset = ResoDirectAcquisition.objects.all().order_by('-date_created')
    serializer_class = ResoDirectAcquisitionSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'CREATE', f'Created RESO Direct Acquisition for {instance.company_name}')

    def perform_update(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'UPDATE', f'Updated RESO Direct Acquisition for {instance.company_name}')

    def perform_destroy(self, instance):
        user = _get_user(self.request)
        _log(user, 'DELETE', f'Deleted RESO Direct Acquisition for {instance.company_name}')
        instance.delete()


class ResoSVPViewSet(viewsets.ModelViewSet):
    queryset = ResoSVP.objects.all().order_by('-date_created')
    serializer_class = ResoSVPSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'CREATE', f'Created RESO SVP for {instance.company_name}')

    def perform_update(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'UPDATE', f'Updated RESO SVP for {instance.company_name}')

    def perform_destroy(self, instance):
        user = _get_user(self.request)
        _log(user, 'DELETE', f'Deleted RESO SVP for {instance.company_name}')
        instance.delete()


class ResoLOVViewSet(viewsets.ModelViewSet):
    queryset = ResoLOV.objects.all().order_by('-date_created')
    serializer_class = ResoLOVSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'CREATE', f'Created RESO LOV for {instance.company_name}')

    def perform_update(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'UPDATE', f'Updated RESO LOV for {instance.company_name}')

    def perform_destroy(self, instance):
        user = _get_user(self.request)
        _log(user, 'DELETE', f'Deleted RESO LOV for {instance.company_name}')
        instance.delete()


class ResoEmergencySplitViewSet(viewsets.ModelViewSet):
    queryset = ResoEmergencySplit.objects.all().order_by('-date_created')
    serializer_class = ResoEmergencySplitSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'CREATE', f'Created RESO Emergency Split for {instance.company_name}')

    def perform_update(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'UPDATE', f'Updated RESO Emergency Split for {instance.company_name}')

    def perform_destroy(self, instance):
        user = _get_user(self.request)
        _log(user, 'DELETE', f'Deleted RESO Emergency Split for {instance.company_name}')
        instance.delete()


# ─── Activity Log (read-only from frontend) ────────────────────────────────────
class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all().order_by('-timestamp')
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        limit = self.request.query_params.get('limit')
        if limit is not None:
            try:
                limit_val = int(limit)
                if limit_val > 0:
                    qs = qs[:limit_val]
            except (TypeError, ValueError):
                pass
        return qs


# ─── Backup ────────────────────────────────────────────────────────────────────
import sqlite3
import io
import tempfile
import json as _json
from django.utils import timezone as _tz

# All application tables that must be verified in a valid backup file
BACKUP_TABLES = [
    'documents_noadocument',
    'documents_ntpdocument',
    'documents_resodirectacquisition',
    'documents_resosvp',
    'documents_resolov',
    'documents_resoemergencysplit',
    'documents_activitylog',
    'documents_signatory',
    'auth_user',
    'auth_group',
    'auth_user_groups',
]


def _sqlite_backup_bytes(source_path: str) -> bytes:
    """
    Use sqlite3's online-backup API to create a safe, consistent snapshot
    of the live database even while other connections may be writing to it.
    Returns the backup as raw bytes.
    """
    source = sqlite3.connect(source_path)
    buf = io.BytesIO()
    dest = sqlite3.connect(':memory:')
    source.backup(dest)
    source.close()

    # Dump in-memory copy to a temporary file, then read bytes
    with tempfile.NamedTemporaryFile(suffix='.sqlite3', delete=False) as tmp:
        tmp_path = tmp.name
    dest_file = sqlite3.connect(tmp_path)
    dest.backup(dest_file)
    dest.close()
    dest_file.close()

    with open(tmp_path, 'rb') as f:
        data = f.read()
    os.remove(tmp_path)
    return data


class BackupDownloadView(APIView):
    def get(self, request):
        db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
        if not os.path.exists(db_path):
            return Response({'error': 'Database file not found'}, status=404)

        try:
            backup_bytes = _sqlite_backup_bytes(db_path)
        except Exception as e:
            return Response({'error': f'Failed to create backup: {str(e)}'}, status=500)

        user = _get_user(request)
        _log(user, 'GENERATE', f'Downloaded database backup ({len(backup_bytes) // 1024} KB)')

        from django.http import HttpResponse
        now = _tz.now()
        filename = f'dar_backup_{now.strftime("%Y%m%d_%H%M%S")}.sqlite3'
        response = HttpResponse(backup_bytes, content_type='application/x-sqlite3')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = len(backup_bytes)
        return response


class BackupInfoView(APIView):
    """Returns row counts for all tracked tables so the frontend can display
    what is included in the backup."""
    def get(self, request):
        db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
        if not os.path.exists(db_path):
            return Response({'error': 'Database file not found'}, status=404)

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        table_counts = {}
        for table in BACKUP_TABLES:
            try:
                cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
                count = cursor.fetchone()[0]
                table_counts[table] = count
            except sqlite3.OperationalError:
                table_counts[table] = 0   # table may not exist yet in older DBs

        conn.close()

        file_size = os.path.getsize(db_path)
        return Response({
            'tables': table_counts,
            'total_rows': sum(table_counts.values()),
            'file_size_bytes': file_size,
            'file_size_kb': round(file_size / 1024, 1),
        })


class BackupRestoreView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file_obj = request.FILES.get('backup_file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=400)

        file_name_lower = file_obj.name.lower()
        if not file_name_lower.endswith('.sqlite3') and not file_name_lower.endswith('.db'):
            return Response({'error': 'Invalid file format. Please upload a .sqlite3 or .db file'}, status=400)

        # Write uploaded file to a temp location first so we can validate it
        with tempfile.NamedTemporaryFile(suffix='.sqlite3', delete=False) as tmp:
            for chunk in file_obj.chunks():
                tmp.write(chunk)
            tmp_upload_path = tmp.name

        # Validate: confirm it is a real SQLite database with our expected tables
        try:
            conn = sqlite3.connect(tmp_upload_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables_in_file = {row[0] for row in cursor.fetchall()}
            conn.close()

            required = {'documents_noadocument', 'documents_signatory', 'auth_user'}
            missing = required - tables_in_file
            if missing:
                os.remove(tmp_upload_path)
                return Response({
                    'error': f'Uploaded file does not appear to be a valid DAR System backup. Missing tables: {", ".join(missing)}'
                }, status=400)
        except sqlite3.DatabaseError:
            os.remove(tmp_upload_path)
            return Response({'error': 'Uploaded file is not a valid SQLite database.'}, status=400)

        # Restore into the live DB using SQLite's backup API (works while Django is running)
        db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
        rollback_path = str(db_path) + '.rollback'
        if not os.path.exists(db_path):
            os.remove(tmp_upload_path)
            return Response({'error': 'Active database file not found on the server.'}, status=404)

        try:
            shutil.copy2(db_path, rollback_path)
            connections.close_all()

            live_conn = sqlite3.connect(str(db_path), timeout=30)
            upload_conn = sqlite3.connect(tmp_upload_path, timeout=30)
            try:
                upload_conn.backup(live_conn)
            finally:
                live_conn.close()
                upload_conn.close()

            connections.close_all()
            if os.path.exists(rollback_path):
                os.remove(rollback_path)
            os.remove(tmp_upload_path)

            user = _get_user(request)
            _log(user, 'UPDATE', f'Restored database from backup file: {file_obj.name} ({file_obj.size // 1024} KB)')
            return Response({
                'message': 'Database restored successfully. Please refresh the page to load the restored data.',
                'reload_required': True,
            })

        except Exception as e:
            connections.close_all()
            if os.path.exists(rollback_path):
                try:
                    shutil.copy2(rollback_path, db_path)
                except Exception:
                    pass
                os.remove(rollback_path)
            if os.path.exists(tmp_upload_path):
                os.remove(tmp_upload_path)
            return Response({'error': f'Failed to restore database: {str(e)}'}, status=500)


# ─── Dashboard Stats ───────────────────────────────────────────────────────────
class DashboardStatsView(APIView):
    def get(self, request):
        from django.utils import timezone

        now = timezone.now()
        current_year = now.year

        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        monthly_stats = {m: {
            'name': month_names[m-1],
            'NOA & NTP': 0,
            'RESO Direct Acquisition': 0,
            'RESO SVP': 0,
            'RESO LOV': 0,
            'RESO Emergency Split': 0
        } for m in range(1, 13)}

        for m in range(1, 13):
            noa_count = NOADocument.objects.filter(date_created__year=current_year, date_created__month=m).count()
            ntp_count = NTPDocument.objects.filter(date_created__year=current_year, date_created__month=m).count()
            direct_count = ResoDirectAcquisition.objects.filter(date_created__year=current_year, date_created__month=m).count()
            svp_count = ResoSVP.objects.filter(date_created__year=current_year, date_created__month=m).count()
            lov_count = ResoLOV.objects.filter(date_created__year=current_year, date_created__month=m).count()
            split_count = ResoEmergencySplit.objects.filter(date_created__year=current_year, date_created__month=m).count()

            monthly_stats[m]['NOA & NTP'] = noa_count + ntp_count
            monthly_stats[m]['RESO Direct Acquisition'] = direct_count
            monthly_stats[m]['RESO SVP'] = svp_count
            monthly_stats[m]['RESO LOV'] = lov_count
            monthly_stats[m]['RESO Emergency Split'] = split_count

        monthly_data = [monthly_stats[m] for m in range(1, 13)]

        years = list(range(2025, 2031))
        yearly_stats = {y: {
            'name': str(y),
            'NOA & NTP': 0,
            'RESO Direct Acquisition': 0,
            'RESO SVP': 0,
            'RESO LOV': 0,
            'RESO Emergency Split': 0
        } for y in years}

        for y in years:
            noa_count = NOADocument.objects.filter(date_created__year=y).count()
            ntp_count = NTPDocument.objects.filter(date_created__year=y).count()
            direct_count = ResoDirectAcquisition.objects.filter(date_created__year=y).count()
            svp_count = ResoSVP.objects.filter(date_created__year=y).count()
            lov_count = ResoLOV.objects.filter(date_created__year=y).count()
            split_count = ResoEmergencySplit.objects.filter(date_created__year=y).count()

            yearly_stats[y]['NOA & NTP'] = noa_count + ntp_count
            yearly_stats[y]['RESO Direct Acquisition'] = direct_count
            yearly_stats[y]['RESO SVP'] = svp_count
            yearly_stats[y]['RESO LOV'] = lov_count
            yearly_stats[y]['RESO Emergency Split'] = split_count

        yearly_data = [yearly_stats[y] for y in years]

        return Response({
            'monthlyData': monthly_data,
            'yearlyData': yearly_data,
            'currentYear': current_year
        })


# ─── Signatories ───────────────────────────────────────────────────────────────
class SignatoryViewSet(viewsets.ModelViewSet):
    queryset = Signatory.objects.filter(is_deleted=False)
    serializer_class = SignatorySerializer

    def get_queryset(self):
        if Signatory.objects.count() == 0:
            self.seed_defaults()
        return Signatory.objects.filter(is_deleted=False).order_by('id')

    def seed_defaults(self):
        defaults = [
            {'name': 'ATTY. GLAIZA MAE MASAOY-ONIA', 'designation': 'Chairperson', 'role': 'Chairperson'},
            {'name': 'NENITA C. MADRIAGA', 'designation': 'Vice Chairperson', 'role': 'Vice Chairperson'},
            {'name': 'ATTY. ROMIN A. CADIENTE', 'designation': 'Member', 'role': 'Member'},
            {'name': 'BEN B. RIOS', 'designation': 'Member', 'role': 'Member'},
            {'name': 'BOBBY S. BAUTISTA', 'designation': 'Member', 'role': 'Member'},
            {'name': 'BOBBY S. BALTAZAR', 'designation': 'Member', 'role': 'Member'},
            {'name': 'MARIA ANA B. FRANCISCO, CESO III', 'designation': 'Regional Director', 'role': 'HOPE'},
        ]
        for d in defaults:
            sig, created = Signatory.objects.get_or_create(name=d['name'], defaults=d)
            if not created and sig.is_deleted:
                sig.is_deleted = False
                sig.save()

    def perform_create(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'CREATE', f'Added new signatory: {instance.name} ({instance.role})')

    def perform_update(self, serializer):
        instance = serializer.save()
        user = _get_user(self.request)
        _log(user, 'UPDATE', f'Updated signatory: {instance.name} ({instance.role})')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = _get_user(request)
        instance.is_deleted = True
        instance.save()
        _log(user, 'DELETE', f'Deleted signatory: {instance.name} ({instance.role})')
        return Response(status=204)

    @action(detail=False, methods=['get'])
    def deleted(self, request):
        deleted_sigs = Signatory.objects.filter(is_deleted=True).order_by('id')
        serializer = self.get_serializer(deleted_sigs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        try:
            instance = Signatory.objects.get(pk=pk)
            instance.is_deleted = False
            instance.save()
            user = _get_user(request)
            _log(user, 'UPDATE', f'Restored signatory: {instance.name} ({instance.role})')
            return Response({'message': 'Signatory restored successfully'})
        except Signatory.DoesNotExist:
            return Response({'error': 'Signatory not found'}, status=404)

    @action(detail=False, methods=['post'])
    def restore_defaults(self, request):
        self.seed_defaults()
        user = _get_user(request)
        _log(user, 'UPDATE', 'Restored all default signatories')
        return Response({'message': 'Default signatories restored successfully'})
