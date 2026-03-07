from django.db import models
from django.utils import timezone


class LegalQuery(models.Model):
    """Model to store legal queries for analytics and improvement"""
    
    QUERY_TYPES = [
        ('case_analysis', 'Case Analysis'),
        ('general_question', 'General Question'),
        ('reasoning', 'Case Reasoning'),
    ]
    
    query_type = models.CharField(max_length=50, choices=QUERY_TYPES)
    question = models.TextField()
    response = models.TextField(blank=True, null=True)
    response_time = models.FloatField(blank=True, null=True, help_text="Response time in seconds")
    
    created_at = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    # Error tracking
    error_occurred = models.BooleanField(default=False)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Legal Query'
        verbose_name_plural = 'Legal Queries'
    
    def __str__(self):
        return f"{self.query_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class CaseExample(models.Model):
    """Model to store case examples for the Case Explorer"""
    
    CASE_TYPES = [
        ('criminal', 'Criminal'),
        ('civil', 'Civil'),
        ('family', 'Family'),
        ('corporate', 'Corporate'),
    ]
    
    title = models.CharField(max_length=500)
    case_type = models.CharField(max_length=50, choices=CASE_TYPES)
    description = models.TextField()
    outcome = models.TextField()
    relevance_score = models.IntegerField(default=0, help_text="Relevance score (0-100)")
    
    # Case details
    citation = models.CharField(max_length=200, blank=True, null=True)
    court = models.CharField(max_length=200, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-relevance_score', '-year']
        verbose_name = 'Case Example'
        verbose_name_plural = 'Case Examples'
    
    def __str__(self):
        return self.title
