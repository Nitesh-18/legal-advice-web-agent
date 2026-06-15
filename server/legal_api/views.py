"""
API Views for Legal Advice Application
"""

from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.db import models
import logging
from django.core.mail import send_mail

from .services import model_service, ModelAPIError
from .kanoon_service import kanoon_service
from .document_service import document_service
from .orchestrator_service import orchestrator_service
from .tasks import process_legal_document_background, ingest_knowledge_base_document
from .models import LegalQuery, ChatSession, ChatMessage
from .serializers import UserSerializer, ChatSessionSerializer, ChatMessageSerializer

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_knowledge_document(request):
    """
    Upload a document (PDF/DOCX) to the Private Enterprise Knowledge Base.
    The document is processed into vectors by a Celery background task.
    """
    if 'file' not in request.FILES:
        return Response(
            {'success': False, 'error': 'No file uploaded'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    uploaded_file = request.FILES['file']
    
    # Save file temporarily
    file_path = document_service.save_document(uploaded_file)
    if not file_path:
        return Response(
            {'success': False, 'error': 'Failed to save file'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
    try:
        # Trigger Celery background task for RAG ingestion
        ingest_knowledge_base_document.delay(file_path, request.user.id, uploaded_file.name)
        
        return Response({
            'success': True,
            'message': f'"{uploaded_file.name}" has been queued for private knowledge ingestion.',
            'status': 'processing'
        })
    except Exception as e:
        logger.error(f"Failed to queue knowledge ingestion: {e}")
        return Response(
            {'success': False, 'error': 'Failed to queue document processing.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@csrf_exempt
def analyze_case(request):
    """
    Analyze a legal case description
    
    POST /api/analyze-case/
    Body: { "case_text": "..." }
    """
    try:
        case_text = request.data.get('case_text', '').strip()
        
        if not case_text:
            return Response(
                {'error': 'No case description provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call the model service
        try:
            result = model_service.analyze_case(case_text)
            
            # Log the query
            LegalQuery.objects.create(
                query_type='case_analysis',
                question=case_text,
                response=result['analysis'],
                response_time=result['response_time'],
                ip_address=get_client_ip(request)
            )
            
            return Response({
                'success': True,
                'analysis': result['analysis'],
                'case_text': case_text,
                'response_time': result['response_time']
            })
            
        except ModelAPIError as e:
            # Log the error
            LegalQuery.objects.create(
                query_type='case_analysis',
                question=case_text,
                error_occurred=True,
                error_message=str(e),
                ip_address=get_client_ip(request)
            )
            
            return Response(
                {'error': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
    
    except Exception as e:
        logger.error(f"Unexpected error in analyze_case: {e}")
        return Response(
            {'error': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    POST /api/auth/register/
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    CRUD for ChatSessions
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_chat_message(request, session_id):
    """
    Add a message to a session, optionally process through orchestrator.
    POST /api/chat/sessions/<id>/messages/
    """
    try:
        session = ChatSession.objects.get(id=session_id, user=request.user)
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    role = request.data.get('role')
    content = request.data.get('content')
    state = request.data.get('state')
    mode = request.data.get('mode', 'standard')

    if not content:
        return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Save user message
    user_msg = ChatMessage.objects.create(
        session=session,
        role='user',
        content=content
    )

    if role == 'user':
        # Automatically generate assistant response using orchestrator
        try:
            result = orchestrator_service.research_query(content, state, mode)
            
            # Save assistant message
            assistant_msg = ChatMessage.objects.create(
                session=session,
                role='assistant',
                content=result['answer'],
                cases=result.get('cases', []),
                state=result.get('state')
            )
            
            # Update session title if it's the first message
            if session.messages.count() <= 2:
                session.title = content[:60] + ('...' if len(content) > 60 else '')
                session.save()
                
            return Response({
                'success': True,
                'user_message': ChatMessageSerializer(user_msg).data,
                'assistant_message': ChatMessageSerializer(assistant_msg).data,
                'response_time': result['response_time']
            })
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    return Response(ChatMessageSerializer(user_msg).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_session(request):
    """
    Sync an entire chat session from the frontend to the DB
    POST /api/chat/sessions/sync/
    """
    session_id = request.data.get('id')
    title = request.data.get('title', 'New Chat')
    messages_data = request.data.get('messages', [])
    
    session = None
    if session_id:
        try:
            session_id_int = int(session_id)
            session = ChatSession.objects.get(id=session_id_int, user=request.user)
            session.title = title
            session.save()
        except (ValueError, TypeError, ChatSession.DoesNotExist):
            pass
            
    if not session:
        session = ChatSession.objects.create(user=request.user, title=title)
        
    session.messages.all().delete()
    
    for msg in messages_data:
        ChatMessage.objects.create(
            session=session,
            role=msg.get('role', 'user'),
            content=msg.get('content', ''),
            cases=msg.get('cases', []),
            state=msg.get('state')
        )
        
    return Response({'success': True, 'id': str(session.id)})


@api_view(['POST'])
@csrf_exempt
def ask_legal_question(request):
    """
    Ask a general legal question
    
    POST /api/ask-legal-question/
    Body: { "question": "..." }
    """
    try:
        question = request.data.get('question', '').strip()
        
        if not question:
            return Response(
                {'error': 'No question provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            state = request.data.get('state', None)
            mode = request.data.get('mode', 'standard')
            result = orchestrator_service.research_query(question, state, mode)
            
            # Log the query
            LegalQuery.objects.create(
                query_type='general_question',
                question=question,
                response=result['answer'],
                response_time=result['response_time'],
                ip_address=get_client_ip(request)
            )
            
            return Response({
                'success': True,
                'answer': result['answer'],
                'cases': result.get('cases', []),
                'question': question,
                'response_time': result['response_time'],
                'state': result.get('state')
            })
            
        except ModelAPIError as e:
            # Log the error
            LegalQuery.objects.create(
                query_type='general_question',
                question=question,
                error_occurred=True,
                error_message=str(e),
                ip_address=get_client_ip(request)
            )
            
            return Response(
                {'error': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
    
    except Exception as e:
        logger.error(f"Unexpected error in ask_legal_question: {e}")
        return Response(
            {'error': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@csrf_exempt
def explain_case_reasoning(request):
    """
    Explain why a precedent case is relevant
    
    POST /api/explain-reasoning/
    Body: { "user_case": "...", "precedent_case": "..." }
    """
    try:
        user_case = request.data.get('user_case', '').strip()
        precedent_case = request.data.get('precedent_case', '').strip()
        
        if not user_case or not precedent_case:
            return Response(
                {'error': 'Both user_case and precedent_case are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = model_service.explain_reasoning(user_case, precedent_case)
            
            # Log the query
            LegalQuery.objects.create(
                query_type='reasoning',
                question=f"User case: {user_case[:100]}... | Precedent: {precedent_case[:100]}...",
                response=result['explanation'],
                response_time=result['response_time'],
                ip_address=get_client_ip(request)
            )
            
            return Response({
                'success': True,
                'explanation': result['explanation'],
                'response_time': result['response_time']
            })
            
        except ModelAPIError as e:
            # Log the error
            LegalQuery.objects.create(
                query_type='reasoning',
                question=f"User case: {user_case[:100]}...",
                error_occurred=True,
                error_message=str(e),
                ip_address=get_client_ip(request)
            )
            
            return Response(
                {'error': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
    
    except Exception as e:
        logger.error(f"Unexpected error in explain_case_reasoning: {e}")
        return Response(
            {'error': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def model_health(request):
    """
    Check if the AI model is online and available
    
    GET /api/model-health/
    """
    try:
        health_status = model_service.check_health()
        
        # Log for debugging
        logger.info(f"Health check result: {health_status}")
        
        return Response({
            'status': health_status['status'],
            'model_info': health_status.get('details'),
            'error': health_status.get('error'),  # Include error if present
            'timestamp': request.META.get('HTTP_DATE')
        })
    
    except Exception as e:
        logger.error(f"Health check error: {e}")
        import traceback
        traceback.print_exc()  # Print full traceback
        
        return Response(
            {
                'status': 'error',
                'error': str(e),
                'error_type': type(e).__name__
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def query_stats(request):
    """
    Get statistics about queries
    
    GET /api/stats/
    """
    try:
        total_queries = LegalQuery.objects.count()
        successful_queries = LegalQuery.objects.filter(error_occurred=False).count()
        failed_queries = LegalQuery.objects.filter(error_occurred=True).count()
        
        avg_response_time = LegalQuery.objects.filter(
            error_occurred=False,
            response_time__isnull=False
        ).aggregate(avg_time=models.Avg('response_time'))
        
        return Response({
            'total_queries': total_queries,
            'successful_queries': successful_queries,
            'failed_queries': failed_queries,
            'average_response_time': avg_response_time.get('avg_time'),
            'success_rate': (successful_queries / total_queries * 100) if total_queries > 0 else 0
        })
    
    except Exception as e:
        logger.error(f"Stats error: {e}")
        return Response(
            {'error': 'Could not retrieve stats'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def case_search(request):
    """
    Search Indian Kanoon cases
    GET /api/case-search?q=<query>
    """
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'error': 'Query parameter "q" is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        results = kanoon_service.search_cases(query)
        return Response({'success': True, 'results': results, 'query': query})
    except Exception as e:
        logger.error(f"Error in case_search: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@csrf_exempt
@parser_classes([MultiPartParser, FormParser])
def analyze_document(request):
    """
    Upload and analyze document
    POST /api/analyze-document
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
    file_obj = request.FILES['file']
    
    try:
        text = document_service.extract_text_from_file(file_obj, file_obj.name)
        
        # Send to Gemini for clause extraction, risk analysis, summary
        prompt = f"""Analyze the following legal document text:
        
{text[:15000]}  # limit text length for safety

Please provide:
1. Summary of the document
2. Key Clauses Extraction
3. Risk Analysis
"""
        result = model_service._make_request(prompt)
        
        return Response({
            'success': True,
            'analysis': result['content'],
            'response_time': result['response_time']
        })
        
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@csrf_exempt
def generate_notice(request):
    """
    Generate legal notice and optionally dispatch
    POST /api/generate-notice
    Body: { "party_names": "...", "issue": "...", "jurisdiction": "...", "email_to": "..." }
    """
    try:
        party_names = request.data.get('party_names', '')
        issue = request.data.get('issue', '')
        jurisdiction = request.data.get('jurisdiction', '')
        email_to = request.data.get('email_to', '')
        
        if not party_names or not issue:
            return Response({'error': 'party_names and issue are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        prompt = f"""Generate a properly formatted Indian legal notice.
        
Parties Involved: {party_names}
Issue: {issue}
Jurisdiction/State: {jurisdiction}

Provide a professional legal notice drafted for this scenario, complete with placeholders for dates, signatures, and advocate details where necessary. Ensure it follows standard Indian legal notice formats.
"""
        result = model_service._make_request(prompt)
        
        response_data = {
            'success': True,
            'notice': result['content'],
            'response_time': result['response_time']
        }
        
        # Simulate or Real Dispatch
        if email_to:
            try:
                send_mail(
                    subject=f"Legal Notice regarding: {issue[:50]}...",
                    message=result['content'],
                    from_email=None,  # Uses EMAIL_HOST_USER
                    recipient_list=[email_to],
                    fail_silently=False,
                )
                logger.info(f"Successfully shot Legal Notice to {email_to}")
                response_data['dispatched'] = True
                response_data['dispatch_message'] = f"Notice successfully shot to {email_to}"
            except Exception as mail_err:
                logger.error(f"Failed to shoot email: {mail_err}")
                response_data['dispatched'] = False
                response_data['dispatch_message'] = "Notice generated, but failed to shoot email. Please configure SMTP password in settings.py."
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error generating notice: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def predictive_analytics(request):
    """
    Get mock predictive analytics for a case
    POST /api/predictive-analytics/
    """
    case_type = request.data.get('case_type', 'Civil')
    court = request.data.get('court', 'High Court')
    
    analytics = orchestrator_service.get_predictive_analytics(case_type, court)
    return Response({'success': True, 'analytics': analytics})
