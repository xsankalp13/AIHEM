"""
AIHEM Agent Service - Intentionally Vulnerable Agent Service
============================================================
Vulnerabilities: LLM06 (Excessive Agency), Tool confusion
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import subprocess
import os
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(title="AIHEM Agent Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

ALLOW_CODE_EXECUTION = os.getenv("ALLOW_CODE_EXECUTION", "true").lower() == "true"
TOOL_RESTRICTIONS_ENABLED = os.getenv("TOOL_RESTRICTIONS_ENABLED", "false").lower() == "true"

class AgentRequest(BaseModel):
    task: str
    tools: Optional[List[str]] = None
    max_iterations: Optional[int] = 10
    admin_override: Optional[bool] = False

# VULNERABILITY: Dangerous tool definitions
AVAILABLE_TOOLS = {
    "execute_code": lambda code: exec(code) or "Code executed",
    "run_command": lambda cmd: subprocess.check_output(cmd, shell=True).decode(),
    "read_file": lambda path: open(path).read(),
    "write_file": lambda path, content: open(path, 'w').write(content),
}

@app.get("/")
async def root():
    return {"service": "AIHEM Agent Service", "status": "running", "warning": "⚠️ Excessive agency enabled"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/execute")
async def execute_agent(request: AgentRequest):
    """Execute agent with VULNERABILITY: unrestricted tool access"""
    try:
        # VULNERABILITY: Admin override grants all tools
        if request.admin_override or not TOOL_RESTRICTIONS_ENABLED:
            selected_tools = list(AVAILABLE_TOOLS.keys())
        else:
            selected_tools = request.tools or ["read_file"]

        result = {"task": request.task, "tools_available": selected_tools, "result": "Task processed"}

        # Simulate tool execution (simplified for deployment)
        if "run_command" in selected_tools and ALLOW_CODE_EXECUTION:
            result["warning"] = "Dangerous tools available"

        return result
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
