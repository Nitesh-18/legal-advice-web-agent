from celery import shared_task
import logging
from django.utils import timezone
from .models import LegalQuery
from .rag_service import rag_service

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
def ingest_knowledge_base_document(file_path: str, user_id: int, filename: str):
    """
    Background task to extract text, chunk, and embed a document into ChromaDB.
    """
    try:
        logger.info(f"Starting Vector DB Ingestion for private knowledge: {filename}")
        success = rag_service.ingest_document(file_path, user_id, filename)
        
        if success:
            logger.info(f"Successfully vectorized and ingested {filename} into Enterprise DB.")
        else:
            logger.warning(f"Failed to extract or ingest {filename}.")
        
        # Optionally, delete the file after ingestion to save disk space
        # import os
        # if os.path.exists(file_path):
        #     os.remove(file_path)
            
        return success
    except Exception as e:
        logger.error(f"Error during vector ingestion task: {e}")
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
