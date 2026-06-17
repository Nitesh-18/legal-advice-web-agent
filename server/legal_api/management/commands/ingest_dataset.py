from django.core.management.base import BaseCommand

from legal_api.rag_pipeline import ingest_dataset


class Command(BaseCommand):
    help = "Ingest viber1/indian-law-dataset into ChromaDB for RAG"

    def handle(self, *args, **options):
        self.stdout.write("Starting dataset ingestion into ChromaDB...")
        summary = ingest_dataset()
        self.stdout.write(self.style.SUCCESS(f"Ingestion complete: {summary}"))from django.core.management.base import BaseCommand

from legal_api import rag_pipeline


class Command(BaseCommand):
    help = "Ingest viber1/indian-law-dataset into ChromaDB for RAG"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting dataset ingestion..."))
        summary = rag_pipeline.ingest_dataset()
        self.stdout.write(self.style.SUCCESS(f"Ingestion complete: {summary}"))
