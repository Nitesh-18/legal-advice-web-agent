"""
URL configuration for legal_api app
"""

from django.urls import path
from . import views

app_name = 'legal_api'

urlpatterns = [
    # Main API endpoints
    path('analyze-case/', views.analyze_case, name='analyze_case'),
    path('ask-legal-question/', views.ask_legal_question, name='ask_legal_question'),
    path('explain-reasoning/', views.explain_case_reasoning, name='explain_reasoning'),
    
    # Health and monitoring
    path('model-health/', views.model_health, name='model_health'),
    path('stats/', views.query_stats, name='query_stats'),
]
