#!/usr/bin/env python3
"""
Simple test script to verify RAG service works independently
Run this before Docker to ensure the service can start
"""

import sys
import subprocess
import time

def test_imports():
    """Test that all required imports work"""
    print("✓ Testing imports...")
    try:
        from fastapi import FastAPI
        from uvicorn import run
        from prometheus_client import Counter
        import requests
        print("✅ All imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def test_startup():
    """Test that the service can start"""
    print("\n✓ Testing service startup...")
    print("Starting uvicorn on port 8888...")

    # Start the service in background
    proc = subprocess.Popen(
        ["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8888"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    # Wait for startup
    time.sleep(3)

    # Check if process is still running
    if proc.poll() is not None:
        stdout, stderr = proc.communicate()
        print(f"❌ Service failed to start!")
        print(f"STDOUT: {stdout.decode()}")
        print(f"STDERR: {stderr.decode()}")
        return False

    # Test health endpoint
    try:
        import requests
        response = requests.get("http://127.0.0.1:8888/health", timeout=5)
        if response.status_code == 200:
            print("✅ Service started successfully!")
            print(f"Health check response: {response.json()}")
            proc.terminate()
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            proc.terminate()
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        proc.terminate()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("AIHEM RAG Service - Standalone Test")
    print("=" * 60)

    if not test_imports():
        sys.exit(1)

    if not test_startup():
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED - Service is ready for Docker!")
    print("=" * 60)
    sys.exit(0)
