"""
Django Admin configuration for legal_api
"""

from django.contrib import admin
from .models import LegalQuery, CaseExample


@admin.register(LegalQuery)
class LegalQueryAdmin(admin.ModelAdmin):
    list_display = ('query_type', 'created_at', 'response_time', 'error_occurred', 'ip_address')
    list_filter = ('query_type', 'error_occurred', 'created_at')
    search_fields = ('question', 'response', 'error_message')
    readonly_fields = ('created_at', 'response_time')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Query Information', {
            'fields': ('query_type', 'question', 'response')
        }),
        ('Metadata', {
            'fields': ('response_time', 'ip_address', 'created_at')
        }),
        ('Error Information', {
            'fields': ('error_occurred', 'error_message'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CaseExample)
class CaseExampleAdmin(admin.ModelAdmin):
    list_display = ('title', 'case_type', 'relevance_score', 'year', 'created_at')
    list_filter = ('case_type', 'year')
    search_fields = ('title', 'description', 'citation')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'case_type', 'relevance_score')
        }),
        ('Case Details', {
            'fields': ('description', 'outcome', 'citation', 'court', 'year')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
