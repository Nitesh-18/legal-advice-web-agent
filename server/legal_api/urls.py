"""
URL configuration for legal_api app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'chat/sessions', views.ChatSessionViewSet, basename='chat-session')

app_name = 'legal_api'

urlpatterns = [
    # Auth
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Chat Sessions
    path('', include(router.urls)),
    path('chat/sessions/sync/', views.sync_session, name='sync_session'),
    path('chat/sessions/<int:session_id>/messages/', views.add_chat_message, name='add_chat_message'),

    # Main API endpoints
    path('analyze-case/', views.analyze_case, name='analyze_case'),
    path('ask-legal-question/', views.ask_legal_question, name='ask_legal_question'),
    path('explain-reasoning/', views.explain_case_reasoning, name='explain_reasoning'),
    
    # Health and monitoring
    path('model-health/', views.model_health, name='model_health'),
    path('stats/', views.query_stats, name='query_stats'),
    
    # New features
    path('case-search/', views.case_search, name='case_search'),
    path('analyze-document/', views.analyze_document, name='analyze_document'),
    path('generate-notice/', views.generate_notice, name='generate_notice'),
]
