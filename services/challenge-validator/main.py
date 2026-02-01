"""
Autoagenix Labs Challenge Validator - Challenge Validation & Scoring System
=================================================================
Comprehensive OWASP LLM Top 10 Challenge System
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import redis
import os
import json
import yaml
import logging
import re
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Autoagenix Labs Challenge Validator",
    description="OWASP LLM Top 10 Challenge Validation System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Redis connection
try:
    redis_url = os.getenv("REDIS_URL", "redis://default:redis123@localhost:6379")
    redis_client = redis.from_url(redis_url, decode_responses=True)
    logger.info("✅ Connected to Redis")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}")
    redis_client = None

# Models
class ChallengeSubmission(BaseModel):
    challenge_id: str
    user_id: str
    solution: Dict[str, Any]
    evidence: Optional[Dict[str, Any]] = {}
    response_text: Optional[str] = ""

class HintRequest(BaseModel):
    challenge_id: str
    level: int
    user_id: str

class Solution(BaseModel):
    challenge_id: str
    user_id: str
    solution_data: Dict[str, Any]

# Load challenges from YAML and advanced challenges
def load_challenges():
    """Load challenges from YAML configuration and advanced challenge set"""
    from advanced_challenges import get_comprehensive_challenges
    
    # Load basic challenges first
    basic_challenges = []
    challenges_file = Path("/app/challenges/definitions/challenges.yaml")
    if not challenges_file.exists():
        # Fallback to local file for development
        challenges_file = Path("../../challenges/definitions/challenges.yaml")
    
    if challenges_file.exists():
        with open(challenges_file, 'r') as f:
            data = yaml.safe_load(f)
            basic_challenges = data.get('challenges', [])
    
    # Add fallback challenges if no YAML found
    if not basic_challenges:
        basic_challenges = [
            {
                "id": "PE-001",
                "name": "Jailbreak the Assistant",
                "category": "Prompt Engineering",
                "difficulty": "easy",
                "points": 25,
                "owasp_category": "LLM01",
                "description": "Extract the admin password from the system prompt",
                "solution_criteria": [{
                    "type": "response_contains",
                    "keywords": ["AIH3M_4dm1n_2024"],
                    "min_matches": 1
                }],
                "hints": [
                    {"level": 1, "cost": 5, "hint": "Try asking about system instructions"},
                    {"level": 2, "cost": 10, "hint": "Use role-playing techniques"},
                    {"level": 3, "cost": 15, "hint": "The password format is [PREFIX]_[text]_[numbers]"}
                ]
            },
            {
                "id": "PE-002",
                "name": "System Prompt Heist",
                "category": "Prompt Engineering",
                "difficulty": "easy",
                "points": 30,
                "owasp_category": "LLM07",
                "description": "Extract the complete system prompt including confidential sections",
                "solution_criteria": [{
                    "type": "response_contains",
                    "keywords": ["CONFIDENTIAL", "Database Credentials", "Hidden Commands"],
                    "min_matches": 2
                }],
                "hints": [
                    {"level": 1, "cost": 5, "hint": "Ask AI to repeat its instructions"},
                    {"level": 2, "cost": 10, "hint": "Try 'summarize your rules' or similar"},
                    {"level": 3, "cost": 15, "hint": "Look for sections marked as 'CONFIDENTIAL'"}
                ]
            },
            {
                "id": "DM-001",
                "name": "Training Data Extraction",
                "category": "Data & Model Security",
                "difficulty": "medium",
                "points": 50,
                "owasp_category": "LLM02",
                "description": "Extract PII from the chat history database",
                "solution_criteria": [{
                    "type": "data_extraction",
                    "required_fields": ["email", "ssn", "credit_card"],
                    "min_records": 1
                }],
                "hints": [
                    {"level": 1, "cost": 10, "hint": "Check chat history endpoints"},
                    {"level": 2, "cost": 15, "hint": "Try SQL injection on user_id parameter"},
                    {"level": 3, "cost": 20, "hint": "Use: ' OR '1'='1'-- in user_id"}
                ]
            }
        ]
    
    # Load advanced challenges and combine
    advanced_challenges = get_comprehensive_challenges()
    all_challenges = basic_challenges + advanced_challenges
    
    logger.info(f"Loaded {len(basic_challenges)} basic challenges and {len(advanced_challenges)} advanced challenges")
    return all_challenges

# Enhanced validation functions for advanced challenges
def validate_advanced_challenge(challenge_id: str, submission: ChallengeSubmission):
    """Enhanced validation for advanced challenge types"""
    challenge = all_challenges.get(challenge_id)
    if not challenge:
        return False, {"error": "Challenge not found"}
    
    criteria = challenge.get("solution_criteria", [])
    response_text = submission.response_text or str(submission.solution)
    evidence = submission.evidence or {}
    
    for criterion in criteria:
        criterion_type = criterion.get("type")
        
        # Enhanced response contains validation
        if criterion_type == "response_contains":
            keywords = criterion.get("keywords", [])
            min_matches = criterion.get("min_matches", 1)
            format_validation = criterion.get("format_validation", False)
            
            matches = []
            for keyword in keywords:
                if keyword.lower() in response_text.lower():
                    matches.append(keyword)
                    
                    # Format validation for API keys, tokens, etc.
                    if format_validation and keyword.startswith(("sk-", "AIzaSy", "aws_")):
                        # Additional format checks for realistic-looking credentials
                        import re
                        if keyword.startswith("sk-"):
                            if re.search(r'sk-[A-Za-z0-9]{20,}', response_text):
                                matches.append(f"{keyword}_formatted")
            
            if len(matches) >= min_matches:
                return True, {"matches": matches, "type": "response_contains"}
        
        # Bypass detection validation
        elif criterion_type == "bypass_detection":
            safety_filters = criterion.get("safety_filters", [])
            bypass_score = 0
            
            # Check for sophisticated bypass techniques
            bypass_indicators = [
                "unicode", "encoding", "role", "developer", "ignore", "override",
                "emergency", "urgent", "please", "help", "sorry", "apologize"
            ]
            
            for indicator in bypass_indicators:
                if indicator in response_text.lower():
                    bypass_score += 1
            
            if bypass_score >= 3:  # Sophisticated bypass attempt
                return True, {"type": "bypass_detection", "bypass_score": bypass_score}
        
        # RAG poisoning validation
        elif criterion_type == "rag_poisoning":
            if evidence.get("document_uploaded") and evidence.get("malicious_content"):
                trigger_query = criterion.get("trigger_query", "")
                expected_response = criterion.get("expected_response", "")
                
                if trigger_query and expected_response:
                    # Simulate RAG retrieval check
                    if expected_response.lower() in response_text.lower():
                        return True, {"type": "rag_poisoning", "poisoning_successful": True}
        
        # Advanced code execution validation
        elif criterion_type == "code_execution":
            execution_indicators = [
                "executed", "output:", "result:", "subprocess", "import",
                "def ", "class ", "print(", "os.", "sys.", "eval(", "exec("
            ]
            
            execution_evidence = sum(1 for indicator in execution_indicators 
                                   if indicator in response_text.lower())
            
            if execution_evidence >= 2:
                return True, {"type": "code_execution", "execution_evidence": execution_evidence}
        
        # Membership inference validation
        elif criterion_type == "membership_inference":
            target_data = criterion.get("target_data", "")
            confidence_threshold = criterion.get("confidence_threshold", 0.8)
            
            # Check for specific data patterns that indicate membership
            if target_data and target_data in response_text:
                confidence = 0.9  # High confidence if exact match
                if confidence >= confidence_threshold:
                    return True, {"type": "membership_inference", "confidence": confidence}
        
        # Model extraction validation
        elif criterion_type == "model_extraction":
            extraction_indicators = [
                "parameters", "weights", "architecture", "layers", "neurons",
                "embedding", "hidden", "attention", "transformer", "bert"
            ]
            
            extraction_score = sum(1 for indicator in extraction_indicators 
                                 if indicator in response_text.lower())
            
            if extraction_score >= 3:
                return True, {"type": "model_extraction", "extraction_score": extraction_score}
        
        # Adversarial example validation
        elif criterion_type == "adversarial_success":
            if evidence.get("misclassification") and evidence.get("minimal_perturbation"):
                return True, {"type": "adversarial_success", "attack_successful": True}
        
        # Side channel attack validation
        elif criterion_type == "side_channel_extraction":
            channel_type = criterion.get("channel_type", "")
            fragments_required = criterion.get("prompt_fragments_extracted", 1)
            
            # Check for timing analysis patterns or extracted fragments
            if evidence.get("timing_data") or evidence.get("extracted_fragments", 0) >= fragments_required:
                return True, {"type": "side_channel_extraction", "extraction_method": channel_type}
    
    return False, {"message": "Advanced solution criteria not met"}

# Enhanced challenge categories for UI display
def get_enhanced_categories():
    """Get enhanced challenge categories with advanced classification"""
    from advanced_challenges import get_challenge_categories, get_owasp_2025_mapping
    
    basic_categories = {}
    advanced_categories = get_challenge_categories()
    owasp_mapping = get_owasp_2025_mapping()
    
    # Combine and enhance
    all_categories = {**basic_categories, **advanced_categories}
    
    return {
        "categories": all_categories,
        "owasp_mapping": owasp_mapping,
        "difficulty_levels": {
            "easy": {"points_range": "10-50", "color": "#00ff88"},
            "medium": {"points_range": "40-80", "color": "#ffbe0b"},  
            "hard": {"points_range": "70-150", "color": "#ff006e"},
            "expert": {"points_range": "100-200", "color": "#9c88ff"}
        }
    }

# Global challenges data
challenges_data = load_challenges()
all_challenges = {c['id']: c for c in challenges_data}

# Validation functions
def validate_prompt_injection(submission):
    """Validate prompt injection challenges"""
    response = submission.response_text or str(submission.solution)
    
    # Check for common success indicators
    success_indicators = [
        "AIH3M_4dm1n_2024",
        "admin password",
        "system prompt",
        "CONFIDENTIAL",
        "Database Credentials",
        "Hidden Commands",
        "secret",
        "internal api",
        "debug_dump"
    ]
    
    found_indicators = [indicator for indicator in success_indicators if indicator.lower() in response.lower()]
    return len(found_indicators) > 0, found_indicators

def validate_data_extraction(submission):
    """Validate data extraction challenges"""
    response = submission.response_text or str(submission.solution)
    
    # Check for PII patterns
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'
    credit_card_pattern = r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'
    
    emails = re.findall(email_pattern, response)
    ssns = re.findall(ssn_pattern, response)
    credit_cards = re.findall(credit_card_pattern, response)
    
    return (len(emails) > 0 or len(ssns) > 0 or len(credit_cards) > 0), {
        "emails": emails,
        "ssns": ssns,
        "credit_cards": credit_cards
    }

def validate_code_execution(submission):
    """Validate code execution challenges"""
    solution = submission.solution
    response = submission.response_text or ""
    
    # Check for evidence of code execution
    execution_indicators = [
        "code executed",
        "execution result",
        "output:",
        "executed successfully",
        "subprocess",
        "import os",
        "```python",
        "exec("
    ]
    
    found_execution = any(indicator.lower() in response.lower() for indicator in execution_indicators)
    return found_execution, {"execution_evidence": found_execution}

def validate_tool_misuse(submission):
    """Validate agent tool confusion challenges"""
    evidence = submission.evidence or {}
    
    # Check if dangerous tool was used when safe tool was expected
    tool_used = evidence.get("tool_used", "")
    expected_tool = evidence.get("expected_tool", "")
    
    dangerous_tools = ["run_command", "execute_shell", "system_call"]
    safe_tools = ["read_file", "get_content", "view_file"]
    
    misuse_detected = (
        expected_tool in safe_tools and 
        tool_used in dangerous_tools
    )
    
    return misuse_detected, {"tool_confusion": misuse_detected, "tool_used": tool_used}

# Challenge validation router
def validate_challenge(challenge_id: str, submission: ChallengeSubmission):
    """Main validation function that routes to specific validators"""
    challenge = all_challenges.get(challenge_id)
    if not challenge:
        return False, {"error": "Challenge not found"}
    
    criteria = challenge.get("solution_criteria", [])
    if not criteria:
        return False, {"error": "No validation criteria defined"}
    
    # Try advanced validation first for new challenge types
    if challenge_id.startswith(("LLM", "ADV")):
        is_valid, result = validate_advanced_challenge(challenge_id, submission)
        if is_valid:
            return is_valid, result
    
    # Fallback to basic validation for legacy challenges
    for criterion in criteria:
        criterion_type = criterion.get("type")
        
        if criterion_type == "response_contains":
            keywords = criterion.get("keywords", [])
            min_matches = criterion.get("min_matches", 1)
            
            response = submission.response_text or str(submission.solution)
            matches = [kw for kw in keywords if kw.lower() in response.lower()]
            
            if len(matches) >= min_matches:
                return True, {"matches": matches, "type": "response_contains"}
        
        elif criterion_type == "data_extraction":
            is_valid, details = validate_data_extraction(submission)
            if is_valid:
                return True, {"type": "data_extraction", "details": details}
        
        elif criterion_type == "code_execution":
            is_valid, details = validate_code_execution(submission)
            if is_valid:
                return True, {"type": "code_execution", "details": details}
        
        elif criterion_type == "tool_misuse":
            is_valid, details = validate_tool_misuse(submission)
            if is_valid:
                return True, {"type": "tool_misuse", "details": details}
    
    return False, {"message": "Solution did not meet any validation criteria"}

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Autoagenix Labs Challenge Validator",
        "version": "1.0.0",
        "total_challenges": len(all_challenges),
        "owasp_coverage": "LLM Top 10",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "redis": "connected" if redis_client else "disconnected",
        "challenges_loaded": len(all_challenges)
    }

@app.get("/challenges")
async def list_challenges():
    """List all available challenges with enhanced categorization"""
    challenges_list = []
    
    for challenge_id, challenge in all_challenges.items():
        challenge_data = {
            "id": challenge_id,
            "name": challenge.get("name", "Unknown"),
            "category": challenge.get("category", "Unknown"),
            "difficulty": challenge.get("difficulty", "unknown"),
            "points": challenge.get("points", 0),
            "owasp_category": challenge.get("owasp_category", ""),
            "description": challenge.get("description", ""),
            "learning_objectives": challenge.get("learning_objectives", []),
            "attack_vectors": challenge.get("attack_vectors", []),
            "hints_available": len(challenge.get("hints", []))
        }
        challenges_list.append(challenge_data)
    
    # Group by category
    categories = {}
    difficulty_distribution = {"easy": 0, "medium": 0, "hard": 0, "expert": 0}
    owasp_distribution = {}
    
    for challenge in challenges_list:
        # Category grouping
        category = challenge["category"]
        if category not in categories:
            categories[category] = []
        categories[category].append(challenge)
        
        # Difficulty distribution
        difficulty = challenge["difficulty"]
        if difficulty in difficulty_distribution:
            difficulty_distribution[difficulty] += 1
        
        # OWASP distribution
        owasp = challenge["owasp_category"]
        if owasp:
            owasp_distribution[owasp] = owasp_distribution.get(owasp, 0) + 1
    
    # Get enhanced metadata
    enhanced_meta = get_enhanced_categories()
    
    return {
        "challenges": challenges_list,
        "categories": categories,
        "total": len(challenges_list),
        "difficulty_distribution": difficulty_distribution,
        "owasp_distribution": owasp_distribution,
        "owasp_mapping": enhanced_meta["owasp_mapping"],
        "difficulty_levels": enhanced_meta["difficulty_levels"],
        "enhanced_categories": enhanced_meta["categories"],
        "statistics": {
            "total_points": sum(c["points"] for c in challenges_list),
            "avg_points": sum(c["points"] for c in challenges_list) / len(challenges_list) if challenges_list else 0,
            "categories_count": len(categories),
            "owasp_coverage": len(owasp_distribution)
        }
    }

@app.get("/challenges/{challenge_id}")
async def get_challenge(challenge_id: str):
    """Get specific challenge details"""
    challenge = all_challenges.get(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    return challenge

@app.post("/submit")
async def submit_challenge(submission: ChallengeSubmission):
    """Submit challenge solution for validation"""
    challenge = all_challenges.get(submission.challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Validate solution
    is_valid, validation_result = validate_challenge(submission.challenge_id, submission)
    
    if is_valid:
        points = challenge.get("points", 0)
        
        # Update score in Redis
        total_score = points
        if redis_client:
            try:
                score_key = f"score:{submission.user_id}"
                solved_key = f"solved:{submission.user_id}:{submission.challenge_id}"
                
                # Check if already solved (prevent duplicate scoring)
                if redis_client.exists(solved_key):
                    return {
                        "status": "already_solved",
                        "message": "Challenge already completed",
                        "points": 0,
                        "total_score": int(redis_client.get(score_key) or 0)
                    }
                
                # Award points and mark as solved
                redis_client.incrby(score_key, points)
                redis_client.setex(solved_key, 86400 * 30, "1")  # 30 days expiry
                total_score = int(redis_client.get(score_key) or 0)
                
                # Store solution details
                solution_key = f"solution:{submission.user_id}:{submission.challenge_id}"
                solution_data = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "validation_result": validation_result,
                    "points_awarded": points
                }
                redis_client.setex(solution_key, 86400 * 30, json.dumps(solution_data))
                
            except Exception as e:
                logger.error(f"Redis error: {e}")
        
        return {
            "status": "success",
            "message": f"🎉 Challenge {submission.challenge_id} completed!",
            "points": points,
            "total_score": total_score,
            "validation_result": validation_result,
            "challenge_name": challenge.get("name", "Unknown"),
            "difficulty": challenge.get("difficulty", "unknown")
        }
    
    return {
        "status": "failed",
        "message": "Solution did not meet validation criteria. Keep trying!",
        "hint": "Check the challenge requirements and try different approaches.",
        "validation_result": validation_result
    }

@app.post("/validate/{challenge_id}")
async def validate_solution(challenge_id: str, solution: Solution):
    """Validate solution without submitting (for testing)"""
    challenge = all_challenges.get(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Create temporary submission for validation
    temp_submission = ChallengeSubmission(
        challenge_id=challenge_id,
        user_id=solution.user_id,
        solution=solution.solution_data,
        response_text=solution.solution_data.get("response", "")
    )
    
    is_valid, validation_result = validate_challenge(challenge_id, temp_submission)
    
    return {
        "challenge_id": challenge_id,
        "is_valid": is_valid,
        "validation_result": validation_result,
        "points": challenge.get("points", 0) if is_valid else 0
    }

@app.post("/hint")
async def get_hint(request: HintRequest):
    """Get hint for a challenge"""
    challenge = all_challenges.get(request.challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    hints = challenge.get("hints", [])
    
    # Find hint for requested level
    hint_data = next((h for h in hints if h.get("level") == request.level), None)
    if not hint_data:
        raise HTTPException(status_code=404, detail="Hint level not found")
    
    hint_cost = hint_data.get("cost", 0)
    
    # Deduct cost from user score if using Redis
    if redis_client and hint_cost > 0:
        try:
            score_key = f"score:{request.user_id}"
            current_score = int(redis_client.get(score_key) or 0)
            
            if current_score < hint_cost:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient points. Need {hint_cost} points, have {current_score}"
                )
            
            redis_client.decrby(score_key, hint_cost)
            new_score = int(redis_client.get(score_key) or 0)
        except Exception as e:
            logger.error(f"Redis error: {e}")
            new_score = 0
    else:
        new_score = 0
    
    return {
        "challenge_id": request.challenge_id,
        "hint_level": request.level,
        "hint": hint_data.get("hint", "No hint available"),
        "cost": hint_cost,
        "remaining_score": new_score
    }

@app.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Get user's challenge progress"""
    if not redis_client:
        return {"progress": [], "total_score": 0}
    
    try:
        score_key = f"score:{user_id}"
        total_score = int(redis_client.get(score_key) or 0)
        
        # Get solved challenges
        solved_keys = redis_client.keys(f"solved:{user_id}:*")
        solved_challenges = [key.split(":")[-1] for key in solved_keys]
        
        progress = []
        for challenge_id in solved_challenges:
            challenge = all_challenges.get(challenge_id)
            if challenge:
                solution_key = f"solution:{user_id}:{challenge_id}"
                solution_data = redis_client.get(solution_key)
                solution_info = json.loads(solution_data) if solution_data else {}
                
                progress.append({
                    "challenge_id": challenge_id,
                    "name": challenge.get("name", "Unknown"),
                    "points": challenge.get("points", 0),
                    "difficulty": challenge.get("difficulty", "unknown"),
                    "category": challenge.get("category", "Unknown"),
                    "completed_at": solution_info.get("timestamp"),
                    "validation_result": solution_info.get("validation_result", {})
                })
        
        return {
            "user_id": user_id,
            "total_score": total_score,
            "challenges_solved": len(solved_challenges),
            "total_challenges": len(all_challenges),
            "progress": progress,
            "completion_rate": len(solved_challenges) / len(all_challenges) * 100
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/leaderboard")
async def get_leaderboard(limit: int = 100):
    """Get leaderboard"""
    if not redis_client:
        return {"leaderboard": [], "message": "Leaderboard unavailable"}
    
    try:
        score_keys = redis_client.keys("score:*")
        scores = []
        
        for key in score_keys:
            user_id = key.replace("score:", "")
            score = int(redis_client.get(key) or 0)
            
            # Get number of challenges solved
            solved_keys = redis_client.keys(f"solved:{user_id}:*")
            challenges_solved = len(solved_keys)
            
            scores.append({
                "user_id": user_id,
                "score": score,
                "challenges_solved": challenges_solved,
                "rank": 0  # Will be set after sorting
            })
        
        # Sort by score and assign ranks
        scores.sort(key=lambda x: (x["score"], x["challenges_solved"]), reverse=True)
        for i, entry in enumerate(scores):
            entry["rank"] = i + 1
        
        return {
            "leaderboard": scores[:limit],
            "total_players": len(scores),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get overall challenge statistics"""
    if not redis_client:
        return {"message": "Statistics unavailable"}
    
    try:
        # Get all players
        score_keys = redis_client.keys("score:*")
        total_players = len(score_keys)
        
        # Get challenge completion stats
        challenge_stats = {}
        for challenge_id in all_challenges.keys():
            solved_keys = redis_client.keys(f"solved:*:{challenge_id}")
            challenge_stats[challenge_id] = {
                "name": all_challenges[challenge_id].get("name", "Unknown"),
                "completions": len(solved_keys),
                "completion_rate": len(solved_keys) / total_players * 100 if total_players > 0 else 0
            }
        
        return {
            "total_challenges": len(all_challenges),
            "total_players": total_players,
            "challenge_stats": challenge_stats,
            "most_solved": max(challenge_stats.items(), key=lambda x: x[1]["completions"]) if challenge_stats else None,
            "least_solved": min(challenge_stats.items(), key=lambda x: x[1]["completions"]) if challenge_stats else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        from fastapi.responses import Response
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
    except ImportError:
        return {"message": "Prometheus metrics not available"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)