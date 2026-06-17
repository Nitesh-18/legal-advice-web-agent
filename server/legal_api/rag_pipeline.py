import logging
import os
import time
from typing import Any, Dict, List

import chromadb
from datasets import load_dataset
import google.generativeai as genai

logger = logging.getLogger(__name__)

BASE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "chroma_db",
)
COLLECTION_NAME = "indian_legal_cases"
EMBEDDING_MODEL = "text-embedding-004"


def _configure_genai() -> None:
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not configured")
    genai.configure(api_key=api_key)


def embed_text(text: str) -> List[float]:
    trimmed_text = (text or "")[:2000]
    if not trimmed_text.strip():
        raise ValueError("Cannot embed empty text")

    _configure_genai()
    try:
        response = genai.embed_content(
            model=f"models/{EMBEDDING_MODEL}",
            content=trimmed_text,
        )
        embedding = response.get("embedding") if isinstance(response, dict) else getattr(response, "embedding", None)
        if isinstance(embedding, dict):
            values = embedding.get("values") or embedding.get("value")
            if values is None:
                raise ValueError("Embedding response was malformed")
            return list(values)
        if embedding is None:
            raise ValueError("Embedding response did not contain an embedding vector")
        return list(embedding)
    finally:
        time.sleep(0.5)


def get_collection() -> Any:
    os.makedirs(BASE_DIR, exist_ok=True)
    client = chromadb.PersistentClient(path=BASE_DIR)
    return client.get_or_create_collection(name=COLLECTION_NAME)


def _extract_response_text(document_text: str) -> str:
    if "\nA:" in document_text:
        return document_text.split("\nA:", 1)[1].strip()
    if "A:" in document_text:
        return document_text.split("A:", 1)[1].strip()
    return document_text.strip()


def retrieve_relevant_cases(query: str, n_results: int = 5) -> List[Dict]:
    try:
        if not query or not query.strip():
            return []

        collection = get_collection()
        if collection.count() == 0:
            return []

        query_embedding = embed_text(query)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"],
        )

        documents = (results or {}).get("documents", [[]])[0] if results else []
        metadatas = (results or {}).get("metadatas", [[]])[0] if results else []
        distances = (results or {}).get("distances", [[]])[0] if results else []

        retrieved: List[Dict] = []
        for index, document_text in enumerate(documents or []):
            metadata = metadatas[index] if index < len(metadatas) and metadatas[index] else {}
            distance = distances[index] if index < len(distances) else None
            score = 1.0 / (1.0 + float(distance)) if distance is not None else 0.0
            retrieved.append(
                {
                    "instruction": metadata.get("instruction", "") if isinstance(metadata, dict) else "",
                    "response": _extract_response_text(document_text or ""),
                    "score": score,
                }
            )

        return retrieved
    except Exception:
        return []


def ingest_dataset() -> Dict[str, int]:
    summary = {"total": 0, "ingested": 0, "skipped": 0}

    try:
        collection = get_collection()
        dataset = load_dataset("viber1/indian-law-dataset", split="train")
        summary["total"] = len(dataset)

        try:
            existing = collection.get()
            existing_ids = set(existing.get("ids", []))
        except Exception:
            existing_ids = set()

        batch_ids: List[str] = []
        batch_documents: List[str] = []
        batch_metadatas: List[Dict] = []
        batch_embeddings: List[List[float]] = []

        for index, row in enumerate(dataset):
            document_id = f"ilaw_{index}"
            if document_id in existing_ids:
                summary["skipped"] += 1
                continue

            instruction = (row.get("instruction") or "").strip()
            response = (row.get("response") or "").strip()
            document_text = f"Q: {instruction}\nA: {response}"

            batch_ids.append(document_id)
            batch_documents.append(document_text)
            batch_metadatas.append(
                {
                    "instruction": instruction[:200],
                    "source": "indian-law-dataset",
                }
            )
            batch_embeddings.append(embed_text(document_text))
            summary["ingested"] += 1

            if summary["ingested"] % 100 == 0:
                print(f"Ingested {summary['ingested']}/{summary['total']}...")

            if len(batch_ids) >= 50:
                collection.add(
                    ids=batch_ids,
                    documents=batch_documents,
                    metadatas=batch_metadatas,
                    embeddings=batch_embeddings,
                )
                batch_ids = []
                batch_documents = []
                batch_metadatas = []
                batch_embeddings = []

        if batch_ids:
            collection.add(
                ids=batch_ids,
                documents=batch_documents,
                metadatas=batch_metadatas,
                embeddings=batch_embeddings,
            )

        return summary
    except Exception as exc:
        logger.error(f"Dataset ingestion failed: {exc}")
        return summary
