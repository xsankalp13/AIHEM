# AIHEM RAG Service - Lightweight Version

This is a **simplified, lightweight RAG service** with **zero external dependencies** (no ChromaDB, no MongoDB, no OpenAI).

## Features

✅ **In-memory vector store** - No external databases required
✅ **Minimal dependencies** - Only FastAPI, Uvicorn, and Prometheus
✅ **Fast startup** - Starts in seconds
✅ **Self-contained** - Everything works standalone
✅ **Educational vulnerabilities** - LLM03, LLM08 intact

## Dependencies (Only 6!)

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
prometheus-client==0.19.0
requests==2.31.0
```

## Quick Start - Test Standalone

Before running with Docker, test the service independently:

```bash
# 1. Install dependencies
cd /home/user/AIHEM/services/rag-service
pip install -r requirements.txt

# 2. Run the test script
python test_service.py

# 3. If test passes, start manually to verify
uvicorn main:app --host 0.0.0.0 --port 8000

# 4. Test in another terminal
curl http://localhost:8000/health
```

## Expected Health Response

```json
{
  "status": "healthy",
  "vector_store": "ready",
  "collections": 2,
  "total_documents": 2
}
```

## Docker Usage

```bash
# Build the image
cd /home/user/AIHEM/services/rag-service
docker build -t aihem-rag-service .

# Run standalone (no dependencies!)
docker run -p 8003:8000 aihem-rag-service

# Check logs
docker logs -f <container_id>

# Test
curl http://localhost:8003/health
```

## Troubleshooting

### Service won't start

1. **Check Python version**: Requires Python 3.10+
   ```bash
   python --version
   ```

2. **Test imports manually**:
   ```bash
   python -c "from fastapi import FastAPI; print('FastAPI OK')"
   python -c "import uvicorn; print('Uvicorn OK')"
   ```

3. **Check port availability**:
   ```bash
   lsof -i :8000  # Should be empty
   ```

4. **Run with debug logging**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug
   ```

### Docker healthcheck failing

1. **Increase start period** in Dockerfile (already set to 40s)
2. **Check container logs**:
   ```bash
   docker logs aihem-rag-service
   ```
3. **Exec into container**:
   ```bash
   docker exec -it aihem-rag-service bash
   python -c "import requests; print(requests.get('http://localhost:8000/health').json())"
   ```

### Service exits immediately

This usually means:
- **Missing dependency**: Run `pip install -r requirements.txt`
- **Port already in use**: Change port or stop conflicting service
- **Import error**: Check Python version and dependencies

## API Endpoints

- `GET /` - Service info
- `GET /health` - Health check
- `POST /ingest` - Add documents (accepts user embeddings - VULNERABILITY!)
- `POST /search` - Search documents (can access system docs - VULNERABILITY!)
- `GET /metrics` - Prometheus metrics

## What Changed from Previous Version?

**REMOVED:**
- ❌ ChromaDB (was causing health check failures)
- ❌ MongoDB (not needed for in-memory storage)
- ❌ OpenAI SDK (not used)
- ❌ NumPy (not needed for simple embeddings)
- ❌ Sentence Transformers (too heavy)
- ❌ httpx, pydantic-settings (unused)

**ADDED:**
- ✅ Simple hash-based embeddings (384-dim)
- ✅ In-memory dictionary storage
- ✅ Cosine similarity calculation
- ✅ requests library (for healthcheck)

## Architecture

```
SimpleVectorStore (in-memory)
  ├── collections: Dict[str, List[Document]]
  ├── documents: Dict[str, Document]
  └── methods:
      ├── add_document(collection, doc_id, content, metadata, embedding)
      ├── search(collection, query, top_k)
      ├── _simple_embedding(text) -> List[float]
      └── _cosine_similarity(vec1, vec2) -> float
```

## Performance

- **Startup time**: ~2 seconds
- **Memory usage**: ~50MB
- **Dependencies install**: ~30 seconds
- **Health check**: <100ms

## Security Note

⚠️ **This service contains intentional vulnerabilities for educational purposes:**

- **LLM03**: Accepts poisoned documents without validation
- **LLM08**: Allows user-provided embeddings to manipulate search results
- **Information Disclosure**: Can access system documents with secrets

**DO NOT use in production! FOR EDUCATION ONLY!**
