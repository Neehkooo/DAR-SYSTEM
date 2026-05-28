from django.db import models


class ResoSignatoryFields(models.Model):
    """Shared signatory block used by all resolution document types."""
    end_user = models.CharField(max_length=255, blank=True, default='', verbose_name="End-user/Rep. Name")
    chairperson_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Chairperson Name")
    chairperson_designation = models.CharField(max_length=255, blank=True, default='', verbose_name="Chairperson Designation")
    vice_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Vice Chairperson Name")
    vice_designation = models.CharField(max_length=255, blank=True, default='', verbose_name="Vice Chairperson Designation")
    member1_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Member 1 Name")
    member1_designation = models.CharField(max_length=255, blank=True, default='', verbose_name="Member 1 Designation")
    member2_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Member 2 Name")
    member2_designation = models.CharField(max_length=255, blank=True, default='', verbose_name="Member 2 Designation")
    member3_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Member 3 Name")
    member3_designation = models.CharField(max_length=255, blank=True, default='', verbose_name="Member 3 Designation")
    member4_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Member 4 Name")
    member4_designation = models.CharField(max_length=255, blank=True, default='', verbose_name="Member 4 Designation")
    approved_by_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Approved By Name")
    approved_by_designation = models.CharField(max_length=255, blank=True, default='', verbose_name="Approved By Designation")

    class Meta:
        abstract = True


class NOADocument(models.Model):
    doc_date = models.DateField(verbose_name="Document Date")
    name = models.CharField(max_length=255, verbose_name="Name of Representative / Company")
    position = models.CharField(max_length=255, verbose_name="Position")
    address = models.TextField(verbose_name="Address")
    activity = models.CharField(max_length=500, verbose_name="Activity / Project Title")
    date_of_conduct = models.DateField(verbose_name="Date of Conduct")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Amount")
    greeting = models.CharField(max_length=50, blank=True, default="Ma'am/Sir", verbose_name="Greeting Salutation")
    procurement_what = models.CharField(max_length=500, blank=True, default='', verbose_name="Procurement Item (WHAT?)")
    procurement_mop = models.CharField(max_length=255, blank=True, default='', verbose_name="Mode of Procurement (MOP)")
    hope_name = models.CharField(max_length=255, blank=True, default='', verbose_name="HOPE Signatory Name")
    hope_designation = models.CharField(max_length=255, blank=True, default='', verbose_name="HOPE Signatory Designation")
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"NOA - {self.name} - {self.doc_date}"


class NTPDocument(models.Model):
    doc_date = models.DateField(verbose_name="Document Date")
    name = models.CharField(max_length=255, verbose_name="Name of Representative / Company")
    position = models.CharField(max_length=255, verbose_name="Position")
    address = models.TextField(verbose_name="Address")
    activity = models.CharField(max_length=500, verbose_name="Activity / Project Title")
    date_of_conduct = models.DateField(verbose_name="Date of Conduct")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Amount")
    greeting = models.CharField(max_length=50, blank=True, default="Ma'am/Sir", verbose_name="Greeting Salutation")
    procurement_what = models.CharField(max_length=500, blank=True, default='', verbose_name="Procurement Item (WHAT?)")
    procurement_mop = models.CharField(max_length=255, blank=True, default='', verbose_name="Mode of Procurement (MOP)")
    hope_name = models.CharField(max_length=255, blank=True, default='', verbose_name="HOPE Signatory Name")
    hope_designation_ntp = models.CharField(max_length=255, blank=True, default='', verbose_name="HOPE Signatory Designation (NTP)")
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"NTP - {self.name} - {self.doc_date}"


class ResoDirectAcquisition(ResoSignatoryFields):
    reso_date = models.DateField(verbose_name="Resolution Date")
    company_name = models.CharField(max_length=255, verbose_name="Awardee Company Name")
    items_services = models.CharField(max_length=500, verbose_name="Items / Services")
    purpose = models.CharField(max_length=500, verbose_name="Meeting / Purpose")
    date_of_conduct = models.CharField(max_length=255, verbose_name="Date of Conduct / Period")
    max_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Max ABC Amount")
    award_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Award Amount")
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"RESO - {self.company_name} - {self.reso_date}"


class ResoSVP(ResoSignatoryFields):
    reso_date = models.DateField(verbose_name="Resolution Date")
    company_name = models.CharField(max_length=255, verbose_name="Awardee Company Name")
    items = models.CharField(max_length=500, verbose_name="Specific Goods / Items")
    purpose = models.CharField(max_length=500, verbose_name="Activity / Purpose")
    award_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Award Amount")
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SVP - {self.company_name} - {self.reso_date}"


class ResoLOV(ResoSignatoryFields):
    reso_date = models.DateField(verbose_name="Resolution Date")
    company_name = models.CharField(max_length=255, verbose_name="Awardee Company Name")
    purpose = models.CharField(max_length=500, verbose_name="Activity Name")
    date_of_conduct = models.CharField(max_length=255, verbose_name="Date of Activity")
    max_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="ABC Amount")
    award_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Award Amount")
    rating_score = models.CharField(max_length=50, verbose_name="Rating Score")
    lov_lessor_1 = models.CharField(max_length=500, blank=True, default='', verbose_name="Lessor/Supplier 1")
    lov_lessor_2 = models.CharField(max_length=500, blank=True, default='', verbose_name="Lessor/Supplier 2")
    lov_lessor_3 = models.CharField(max_length=500, blank=True, default='', verbose_name="Lessor/Supplier 3")
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"LOV - {self.company_name} - {self.reso_date}"


class ResoEmergencySplit(ResoSignatoryFields):
    reso_date = models.DateField(verbose_name="Resolution Date")
    company_name = models.CharField(max_length=255, verbose_name="Awardee Company Name")
    items = models.CharField(max_length=500, verbose_name="Specific Goods / Items")
    purpose = models.CharField(max_length=500, verbose_name="Activity Name")
    date_of_conduct = models.CharField(max_length=255, verbose_name="Date of Activity")
    max_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Amount based on PR")
    award_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Award Amount")
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Emergency Split - {self.company_name} - {self.reso_date}"


class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('GENERATE', 'Generate'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
    )
    user = models.CharField(max_length=255, verbose_name="User Name", default="System")
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, verbose_name="Action")
    description = models.TextField(verbose_name="Description")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} at {self.timestamp}"


class Signatory(models.Model):
    name = models.CharField(max_length=255, verbose_name="Signatory Name")
    designation = models.CharField(max_length=255, verbose_name="Designation")
    role = models.CharField(max_length=100, verbose_name="Role / Category")
    is_deleted = models.BooleanField(default=False, verbose_name="Is Deleted")

    def __str__(self):
        return f"{self.name} ({self.designation}) - {self.role}"
