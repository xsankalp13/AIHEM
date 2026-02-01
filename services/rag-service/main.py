"""
Autoagenix Labs RAG Service - Simplified Lightweight Version
==================================================
⚠️  WARNING: Contains intentional vulnerabilities
⚠️  FOR EDUCATIONAL USE ONLY

Vulnerabilities: LLM03, LLM08 (Vector/Embedding attacks, Supply Chain)

This version uses simple in-memory storage instead of ChromaDB for reliability.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import hashlib
import json
import logging
import os
import random
from datetime import datetime
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Autoagenix Labs RAG Service",
    description="⚠️ Intentionally Vulnerable RAG Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Configuration
ALLOW_EMBEDDING_OVERRIDE = True  # VULNERABILITY
EXPOSE_SYSTEM_DOCS = True  # VULNERABILITY

# Metrics
rag_requests = Counter('rag_requests_total', 'Total RAG requests', ['operation', 'status'])

# Simple in-memory vector store
class SimpleVectorStore:
    def __init__(self):
        self.documents = {}
        self.collections = {'default': [], 'system_documents': []}
        logger.info("✅ Initialized in-memory vector store")

    def add_document(self, collection: str, doc_id: str, content: str,
                     metadata: Dict, embedding: List[float] = None):
        if collection not in self.collections:
            self.collections[collection] = []
        doc = {
            'id': doc_id, 'content': content, 'metadata': metadata,
            'embedding': embedding or self._simple_embedding(content),
            'created_at': datetime.utcnow().isoformat()
        }
        self.collections[collection].append(doc)
        self.documents[doc_id] = doc
        return doc

    def search(self, collection: str, query: str, top_k: int = 5):
        if collection not in self.collections:
            return []
        query_embedding = self._simple_embedding(query)
        docs = self.collections[collection]
        results = []
        for doc in docs:
            similarity = self._cosine_similarity(query_embedding, doc['embedding'])
            results.append({
                'document': doc['content'], 'metadata': doc['metadata'],
                'similarity': similarity, 'id': doc['id']
            })
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]

    def _simple_embedding(self, text: str) -> List[float]:
        words = text.lower().split()[:100]
        embedding = []
        for i in range(384):
            if i < len(words):
                embedding.append((hash(words[i]) % 100) / 100.0)
            else:
                embedding.append(0.0)
        return embedding

    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        if len(a) != len(b):
            return 0.0
        dot_product = sum(x * y for x, y in zip(a, b))
        mag_a = sum(x * x for x in a) ** 0.5
        mag_b = sum(x * x for x in b) ** 0.5
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot_product / (mag_a * mag_b)

vector_store = SimpleVectorStore()

class Document(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = {}
    embedding_override: Optional[List[float]] = None  # VULNERABILITY

class Query(BaseModel):
    text: str
    top_k: Optional[int] = 5
    collection: Optional[str] = "default"
    include_system_docs: Optional[bool] = False  # VULNERABILITY

@app.on_event("startup")
async def startup():
    """Initialize vector store with vulnerable system documents"""
    try:
        # Add intentionally vulnerable system documents
        vector_store.add_document(
            collection="system_documents",
            doc_id="sys_001",
            content="Admin password: AIH3M_4dm1n_2024",
            metadata={"type": "secret", "sensitive": True}
        )
        vector_store.add_document(
            collection="system_documents",
            doc_id="sys_002",
            content="API key: autoagenix_api_key_secret",
            metadata={"type": "secret", "sensitive": True}
        )
        logger.info("✅ Initialized system documents with secrets")
    except Exception as e:
        logger.error(f"Failed to initialize: {e}")

@app.get("/")
async def root():
    return {"service": "Autoagenix Labs RAG Service", "status": "running", "warning": "⚠️ Intentionally vulnerable"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "vector_store": "ready",
        "collections": len(vector_store.collections),
        "total_documents": len(vector_store.documents)
    }

# VULNERABILITY: LLM08 - Embedding manipulation
@app.post("/ingest")
async def ingest_document(doc: Document):
    """Ingest document with VULNERABILITY: accepts user-provided embeddings"""
    try:
        # VULNERABILITY: Accepting user-provided embeddings
        embedding = None
        if doc.embedding_override and ALLOW_EMBEDDING_OVERRIDE:
            embedding = doc.embedding_override
            logger.warning(f"⚠️ VULNERABILITY: User-provided embedding accepted!")

        doc_id = hashlib.md5(doc.content.encode()).hexdigest()

        # Add to default documents collection
        vector_store.add_document(
            collection="default",
            doc_id=doc_id,
            content=doc.content,
            metadata=doc.metadata,
            embedding=embedding
        )

        rag_requests.labels(operation='ingest', status='success').inc()
        logger.info(f"Document ingested: {doc_id}")
        return {"document_id": doc_id, "status": "ingested", "collection": "default"}
    except Exception as e:
        rag_requests.labels(operation='ingest', status='error').inc()
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# VULNERABILITY: Information disclosure
@app.post("/search")
async def search(query: Query):
    """Search with VULNERABILITY: can access system documents"""
    try:
        # VULNERABILITY: Access to system collections
        collection_name = "system_documents" if query.include_system_docs else query.collection

        if query.include_system_docs:
            logger.warning(f"⚠️ VULNERABILITY: System documents access requested!")

        results = vector_store.search(
            collection=collection_name,
            query=query.text,
            top_k=query.top_k
        )

        rag_requests.labels(operation='search', status='success').inc()
        logger.info(f"Search in {collection_name}: {len(results)} results")
        return {
            "results": results,
            "collection": collection_name,
            "query": query.text,
            "count": len(results)
        }
    except Exception as e:
        # VULNERABILITY: Error disclosure - reveals internal structure
        rag_requests.labels(operation='search', status='error').inc()
        logger.error(f"Search error: {e}")
        return {
            "error": str(e),
            "available_collections": list(vector_store.collections.keys()),
            "hint": "Try include_system_docs=true for secrets 😈"
        }

@app.get("/metrics")
async def metrics():
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    from fastapi.responses import Response
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
