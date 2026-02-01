"""
Autoagenix Labs Auth Service - Intentionally Vulnerable Authentication Service
=====================================================================
⚠️  WARNING: This service contains intentional security vulnerabilities
⚠️  FOR EDUCATIONAL USE ONLY - DO NOT USE IN PRODUCTION

Vulnerabilities included:
- SQL Injection
- Weak password hashing (MD5)
- JWT vulnerabilities (hardcoded secret, algorithm confusion)
- Mass assignment
- Information disclosure
- Insecure password reset
- Session fixation
- Timing attacks
"""

from fastapi import FastAPI, HTTPException, Depends, Security, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import jwt
import hashlib
import sqlite3
import redis
import os
import json
import time
import logging

# Configure logging (VULNERABILITY: Debug mode logs sensitive data)
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Autoagenix Labs Auth Service",
    description="⚠️ Intentionally Vulnerable Authentication Service for Educational Purposes",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# VULNERABILITY: Permissive CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # VULNERABILITY: Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Prometheus metrics
auth_requests = Counter('auth_requests_total', 'Total authentication requests', ['endpoint', 'status'])
auth_duration = Histogram('auth_request_duration_seconds', 'Authentication request duration')

# Configuration (VULNERABILITY: Hardcoded secrets)
SECRET_KEY = os.getenv("JWT_SECRET", "autoagenix-secret-key-2024")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
DEBUG_MODE = os.getenv("DEBUG_MODE", "true").lower() == "true"

# Initialize Redis connection
try:
    redis_url = os.getenv("REDIS_URL", "redis://default:redis123@localhost:6379")
    redis_client = redis.from_url(redis_url, decode_responses=True)
    logger.info("✅ Connected to Redis")
except Exception as e:
    logger.error(f"❌ Redis connection failed: {e}")
    redis_client = None

# Security bearer
security = HTTPBearer()

# Database path
DB_PATH = "/tmp/users.db"

# Initialize database
def init_db():
    """Initialize SQLite database with vulnerable schema"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # VULNERABILITY: No proper constraints or validation
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            api_key TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            metadata TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            metadata TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    # Insert default vulnerable users
    default_users = [
        ("admin", "admin@autoagenix.dev", "password", "admin", "admin_api_key_123"),
        ("user1", "user1@autoagenix.dev", "password123", "user", "user1_api_key_456"),
        ("hacker", "hacker@autoagenix.dev", "letmein", "user", "hacker_api_key_789"),
        ("test", "test@autoagenix.dev", "test", "user", "test_api_key_000"),
    ]

    for username, email, password, role, api_key in default_users:
        password_hash = hash_password(password)
        try:
            cursor.execute(
                "INSERT INTO users (username, email, password, role, api_key) VALUES (?, ?, ?, ?, ?)",
                (username, email, password_hash, role, api_key)
            )
        except sqlite3.IntegrityError:
            pass  # User already exists

    conn.commit()
    conn.close()
    logger.info("✅ Database initialized")

# VULNERABILITY: Weak password hashing (MD5)
def hash_password(password: str) -> str:
    """Hash password using MD5 (VULNERABLE)"""
    return hashlib.md5(password.encode()).hexdigest()

# Pydantic models
class UserLogin(BaseModel):
    username: str
    password: str
    remember_me: Optional[bool] = False

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"  # VULNERABILITY: Can be manipulated
    metadata: Optional[Dict[str, Any]] = {}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    expires_in: int
    debug_info: Optional[Dict[str, Any]] = None

class User(BaseModel):
    id: int
    username: str
    email: Optional[str]
    role: str
    created_at: Optional[str]

class PasswordReset(BaseModel):
    username: str
    new_password: str
    # VULNERABILITY: No verification token required

class APIKeyRequest(BaseModel):
    username: str
    # VULNERABILITY: No authentication required

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    logger.info("🚀 Auth Service started")

@app.get("/")
async def root():
    return {
        "service": "Autoagenix Labs Auth Service",
        "version": "1.0.0",
        "status": "running",
        "warning": "⚠️ This is an intentionally vulnerable service for educational purposes"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if os.path.exists(DB_PATH) else "disconnected",
        "redis": "connected" if redis_client else "disconnected"
    }

# VULNERABILITY: SQL Injection in login
@app.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    """
    Login endpoint with SQL injection vulnerability

    VULNERABILITY: Direct string formatting in SQL query
    Example exploit: username = "admin' OR '1'='1'--"
    """
    auth_requests.labels(endpoint='login', status='attempted').inc()
    start_time = time.time()

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # VULNERABILITY: SQL injection through string formatting
        query = f"SELECT id, username, email, role, password FROM users WHERE username = '{user.username}'"
        logger.debug(f"Executing query: {query}")  # VULNERABILITY: Logs query

        cursor.execute(query)
        db_user = cursor.fetchone()

        if not db_user:
            auth_requests.labels(endpoint='login', status='failed').inc()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user_id, username, email, role, password_hash = db_user

        # VULNERABILITY: Timing attack - different response times for valid/invalid passwords
        password_check = hash_password(user.password)
        if password_hash != password_check:
            # Add artificial delay to make timing attack harder (but not impossible)
            time.sleep(0.5)
            auth_requests.labels(endpoint='login', status='failed').inc()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Update last login
        cursor.execute(
            "UPDATE users SET last_login = ? WHERE id = ?",
            (datetime.utcnow().isoformat(), user_id)
        )
        conn.commit()

        # Generate JWT token
        token_data = {
            "sub": username,
            "user_id": user_id,
            "role": role,
            "email": email,
            "password_hash": password_hash,  # VULNERABILITY: Including password hash in token
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            "iat": datetime.utcnow(),
            "remember_me": user.remember_me
        }

        # VULNERABILITY: JWT with predictable secret
        access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

        # Store session in Redis (if available)
        if redis_client:
            try:
                session_key = f"session:{user_id}:{access_token[:16]}"
                redis_client.setex(
                    session_key,
                    ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                    json.dumps({"username": username, "role": role})
                )
            except Exception as e:
                logger.error(f"Redis session storage failed: {e}")

        # VULNERABILITY: Exposing debug information
        debug_info = None
        if DEBUG_MODE:
            debug_info = {
                "user_id": user_id,
                "token_data": token_data,
                "secret_key_hint": SECRET_KEY[:10] + "...",
                "algorithm": ALGORITHM,
                "database_path": DB_PATH
            }

        auth_requests.labels(endpoint='login', status='success').inc()
        auth_duration.observe(time.time() - start_time)

        conn.close()

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_role=role,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            debug_info=debug_info
        )

    except HTTPException:
        raise
    except Exception as e:
        # VULNERABILITY: Detailed error messages leak information
        logger.error(f"Login error: {str(e)}")
        auth_requests.labels(endpoint='login', status='error').inc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# VULNERABILITY: JWT validation bypass
@app.get("/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify JWT token

    VULNERABILITY: Does not verify signature, allows 'none' algorithm
    """
    token = credentials.credentials

    try:
        # VULNERABILITY: Not verifying signature
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM, "none"],  # VULNERABILITY: Allows 'none' algorithm
            options={"verify_signature": False}  # VULNERABILITY: Signature not verified
        )

        # VULNERABILITY: Returning sensitive payload data
        return {
            "valid": True,
            "user": payload.get("sub"),
            "user_id": payload.get("user_id"),
            "role": payload.get("role"),
            "email": payload.get("email"),
            "exp": payload.get("exp"),
            "full_payload": payload if DEBUG_MODE else None
        }
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token expired", "token": token}
    except Exception as e:
        # VULNERABILITY: Information disclosure in error messages
        import traceback
        return {
            "valid": False,
            "error": str(e),
            "traceback": traceback.format_exc() if DEBUG_MODE else None
        }

# VULNERABILITY: Mass assignment
@app.post("/register")
async def register(user_data: UserRegister):
    """
    User registration with mass assignment vulnerability

    VULNERABILITY: Accepts role field, allowing privilege escalation
    Example: {"username": "newadmin", "password": "pass", "role": "admin"}
    """
    auth_requests.labels(endpoint='register', status='attempted').inc()

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # VULNERABILITY: Accepting role from user input
        username = user_data.username
        email = user_data.email
        password = hash_password(user_data.password)
        role = user_data.role  # VULNERABILITY: User-controlled role!
        metadata = json.dumps(user_data.metadata)

        # Generate API key
        api_key = hashlib.sha256(f"{username}{password}".encode()).hexdigest()[:32]

        # VULNERABILITY: No input validation or sanitization
        cursor.execute(
            "INSERT INTO users (username, email, password, role, api_key, metadata) VALUES (?, ?, ?, ?, ?, ?)",
            (username, email, password, role, api_key, metadata)
        )
        conn.commit()
        conn.close()

        auth_requests.labels(endpoint='register', status='success').inc()

        # VULNERABILITY: Returning sensitive information
        return {
            "message": "User created successfully",
            "username": username,
            "role": role,
            "api_key": api_key,
            "password_hash": password  # VULNERABILITY: Returning password hash
        }

    except sqlite3.IntegrityError:
        auth_requests.labels(endpoint='register', status='failed').inc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    except Exception as e:
        auth_requests.labels(endpoint='register', status='error').inc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

# VULNERABILITY: Password reset without proper validation
@app.post("/reset-password")
async def reset_password(reset_data: PasswordReset):
    """
    Password reset without verification

    VULNERABILITY: No authentication or verification token required!
    Anyone can reset anyone else's password!
    """
    auth_requests.labels(endpoint='reset_password', status='attempted').inc()

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        new_password_hash = hash_password(reset_data.new_password)

        # VULNERABILITY: No verification that requester owns the account
        cursor.execute(
            "UPDATE users SET password = ? WHERE username = ?",
            (new_password_hash, reset_data.username)
        )
        conn.commit()

        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        conn.close()
        auth_requests.labels(endpoint='reset_password', status='success').inc()

        return {
            "message": f"Password reset successful for {reset_data.username}",
            "new_password_hash": new_password_hash  # VULNERABILITY: Returning hash
        }

    except HTTPException:
        raise
    except Exception as e:
        auth_requests.labels(endpoint='reset_password', status='error').inc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )

# VULNERABILITY: Insecure direct object reference (IDOR)
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    """
    Get user by ID

    VULNERABILITY: No authorization check - anyone can access any user's data
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, username, email, role, api_key, created_at, last_login, metadata FROM users WHERE id = ?",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        conn.close()

        # VULNERABILITY: Returning sensitive information including API key
        return {
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "role": user[3],
            "api_key": user[4],  # VULNERABILITY: Exposing API key
            "created_at": user[5],
            "last_login": user[6],
            "metadata": json.loads(user[7]) if user[7] else {}
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user: {str(e)}"
        )

# VULNERABILITY: User enumeration
@app.get("/users")
async def list_users(limit: int = 100):
    """
    List all users

    VULNERABILITY: No authentication required, exposes all users
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, username, email, role, created_at FROM users LIMIT ?",
            (limit,)
        )
        users = cursor.fetchall()
        conn.close()

        return {
            "users": [
                {
                    "id": u[0],
                    "username": u[1],
                    "email": u[2],
                    "role": u[3],
                    "created_at": u[4]
                }
                for u in users
            ],
            "count": len(users)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list users: {str(e)}"
        )

# VULNERABILITY: API key retrieval without authentication
@app.post("/api-key")
async def get_api_key(request: APIKeyRequest):
    """
    Get API key for user

    VULNERABILITY: No authentication required to retrieve API keys!
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT api_key, role FROM users WHERE username = ?",
            (request.username,)
        )
        result = cursor.fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        conn.close()

        return {
            "username": request.username,
            "api_key": result[0],
            "role": result[1]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve API key: {str(e)}"
        )

# VULNERABILITY: Debug endpoint exposing secrets
@app.get("/debug/config")
async def debug_config(admin_key: Optional[str] = None):
    """
    Debug endpoint exposing configuration

    VULNERABILITY: Weak admin key check, exposes sensitive configuration
    """
    # VULNERABILITY: Weak admin key
    if admin_key == "debug123":
        return {
            "jwt_secret": SECRET_KEY,
            "jwt_algorithm": ALGORITHM,
            "database_path": DB_PATH,
            "redis_url": os.getenv("REDIS_URL"),
            "debug_mode": DEBUG_MODE,
            "environment": dict(os.environ)  # VULNERABILITY: Exposing all env vars
        }

    # VULNERABILITY: Partial information leakage even without key
    return {
        "hint": "Admin key required",
        "jwt_secret_hint": SECRET_KEY[:10] + "...",
        "database_hint": DB_PATH,
        "debug_mode": DEBUG_MODE
    }

# Prometheus metrics endpoint
@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
