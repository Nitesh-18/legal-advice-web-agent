import os
import logging
from typing import List, Dict
import PyPDF2
import docx2txt
import chromadb
from chromadb.utils import embedding_functions
from django.conf import settings

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        # Store ChromaDB in the project root directory
        self.persist_directory = os.path.join(settings.BASE_DIR, "chroma_db")
        os.makedirs(self.persist_directory, exist_ok=True)
        
        try:
            self.client = chromadb.PersistentClient(path=self.persist_directory)
            # Use default all-MiniLM-L6-v2 embedding model (small & fast)
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
            
            # We use one collection for the entire firm's knowledge base.
            # In a real multi-tenant system, we'd partition by user_id or firm_id.
            self.collection = self.client.get_or_create_collection(
                name="enterprise_knowledge_base",
                embedding_function=self.embedding_function
            )
            logger.info("Successfully initialized ChromaDB Enterprise RAG Service")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.collection = None

    def _extract_text(self, file_path: str) -> str:
        text = ""
        ext = file_path.lower().split('.')[-1]
        try:
            if ext == 'pdf':
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text += extracted + "\n"
            elif ext in ['doc', 'docx']:
                text = docx2txt.process(file_path)
            elif ext == 'txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                logger.warning(f"Unsupported file type for RAG: {ext}")
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            
        return text

    def ingest_document(self, file_path: str, user_id: int, filename: str) -> bool:
        if not self.collection:
            logger.error("ChromaDB collection not initialized.")
            return False
            
        text = self._extract_text(file_path)
        if not text.strip():
            logger.warning(f"No text extracted from {filename}")
            return False

        # Simple semantic chunking (by paragraphs/fixed size)
        # We chunk by roughly 1000 characters to ensure good retrieval context
        chunk_size = 1000
        overlap = 200
        
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap
            
        documents = []
        metadatas = []
        ids = []
        
        for i, chunk in enumerate(chunks):
            # Clean chunk
            cleaned_chunk = " ".join(chunk.split())
            if len(cleaned_chunk) < 50: # Skip very small fragments
                continue
                
            documents.append(cleaned_chunk)
            metadatas.append({"user_id": user_id, "source": filename, "chunk": i})
            ids.append(f"doc_{user_id}_{filename}_{i}")
            
        if not documents:
            return False
            
        try:
            self.collection.upsert(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Ingested {len(documents)} chunks from {filename} into Vector DB")
            return True
        except Exception as e:
            logger.error(f"Failed to upsert chunks to Vector DB: {e}")
            return False

    def query_knowledge_base(self, query: str, n_results: int = 3) -> str:
        """
        Queries the vector DB for the most relevant private context.
        Returns a formatted string of context, or empty string if none found.
        """
        if not self.collection:
            return ""
            
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            if not results['documents'] or not results['documents'][0]:
                return ""
                
            context_blocks = []
            for i, doc in enumerate(results['documents'][0]):
                meta = results['metadatas'][0][i]
                source = meta.get('source', 'Unknown Document')
                context_blocks.append(f"--- Excerpt from Private File: {source} ---\n{doc}")
                
            return "\n\n".join(context_blocks)
        except Exception as e:
            logger.error(f"Error querying Vector DB: {e}")
            return ""

rag_service = RAGService()
