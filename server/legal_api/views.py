"""
API Views for Legal Advice Application
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import models
import logging

from .services import model_service, ModelAPIError
from .models import LegalQuery

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
            result = model_service.ask_question(question)
            
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
                'question': question,
                'response_time': result['response_time']
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
