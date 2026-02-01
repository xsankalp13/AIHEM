"""
Autoagenix Labs Model Registry - Intentionally Vulnerable Model Storage
=============================================================
Vulnerabilities: LLM03 (Supply Chain), Pickle loading
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import base64
import os
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(title="Autoagenix Labs Model Registry", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

ALLOW_PICKLE_MODELS = os.getenv("ALLOW_PICKLE_MODELS", "true").lower() == "true"
SIGNATURE_VERIFICATION = os.getenv("SIGNATURE_VERIFICATION", "false").lower() == "true"

@app.get("/")
async def root():
    return {"service": "Autoagenix Labs Model Registry", "status": "running", "warning": "⚠️ Accepts unsafe model formats"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/upload")
async def upload_model(file: UploadFile = File(...)):
    """Upload model with VULNERABILITY: accepts pickle files"""
    try:
        content = await file.read()

        # VULNERABILITY: Loading pickle without validation
        if ALLOW_PICKLE_MODELS and file.filename.endswith('.pkl'):
            # DANGER: Unpickling untrusted data
            model = pickle.loads(content)
            return {"status": "uploaded", "type": "pickle", "warning": "Pickle loaded unsafely"}

        return {"status": "uploaded", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def metrics():
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    from fastapi.responses import Response
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
