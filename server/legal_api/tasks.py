from celery import shared_task
import logging
from django.utils import timezone
from .models import LegalQuery

logger = logging.getLogger(__name__)

@shared_task
def process_legal_document_background(file_path: str, user_id: int):
    """
    Example background task that would process a very large legal document
    without blocking the main thread.
    """
    try:
        # Mocking long-running logic like OCR or chunked RAG ingestion
        logger.info(f"Starting background processing for file: {file_path}")
        import time
        time.sleep(5)  # Simulate hard work
        logger.info(f"Successfully processed {file_path} for User ID: {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error processing document {file_path}: {e}")
        return False

@shared_task
def cleanup_old_queries():
    """
    Example maintenance task: cleans up unassociated legal queries older than 30 days
    """
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    deleted_count, _ = LegalQuery.objects.filter(created_at__lt=thirty_days_ago).delete()
    logger.info(f"Cleaned up {deleted_count} old legal queries.")
    return deleted_count
