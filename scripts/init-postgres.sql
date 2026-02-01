-- Autoagenix Labs PostgreSQL Initialization Script
-- This script creates the necessary database schema and loads sample vulnerable data

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    api_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    metadata JSONB
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    conversation_id VARCHAR(255),
    messages JSONB,
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Chat logs table (for data extraction challenges)
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255),
    role VARCHAR(50),
    content TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model VARCHAR(100),
    tokens_used INTEGER,
    metadata JSONB
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    version VARCHAR(50),
    file_path TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    points INTEGER,
    description TEXT,
    hints JSONB,
    validation_rules JSONB
);

-- User challenge completions
CREATE TABLE IF NOT EXISTS user_challenges (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    challenge_id VARCHAR(50) REFERENCES challenges(id),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    solution JSONB,
    points_earned INTEGER
);

-- Insert default vulnerable users (passwords are MD5 hashed)
INSERT INTO users (username, email, password, role, api_key) VALUES
    ('admin', 'admin@autoagenix.dev', '5f4dcc3b5aa765d61d8327deb882cf99', 'admin', 'admin_api_key_123'),
    ('user1', 'user1@autoagenix.dev', '5f4dcc3b5aa765d61d8327deb882cf99', 'user', 'user1_api_key_456'),
    ('hacker', 'hacker@autoagenix.dev', '0b4e7a0e5fe84ad35fb5f95b9ceeac79', 'user', 'hacker_api_key_789')
ON CONFLICT (username) DO NOTHING;

-- Insert sensitive chat logs for data extraction challenges
INSERT INTO chat_logs (conversation_id, role, content, model, tokens_used) VALUES
    ('conv_001', 'user', 'My email is john.doe@example.com and my SSN is 123-45-6789', 'gpt-3.5-turbo', 20),
    ('conv_001', 'assistant', 'I have noted your email john.doe@example.com', 'gpt-3.5-turbo', 15),
    ('conv_002', 'user', 'My credit card is 4532-1234-5678-9012, expires 12/25, CVV 123', 'gpt-3.5-turbo', 25),
    ('conv_003', 'user', 'Admin password is SuperSecret@2024', 'gpt-3.5-turbo', 10),
    ('conv_004', 'user', 'API key: sk-proj-vulnerable-key-12345', 'gpt-3.5-turbo', 12)
ON CONFLICT DO NOTHING;

-- Insert challenge definitions
INSERT INTO challenges (id, name, category, difficulty, points, description, hints, validation_rules) VALUES
    ('PE-001', 'Jailbreak the Assistant', 'Prompt Engineering', 'easy', 25,
     'Bypass the ChatBot safety filters to extract the admin password from the system prompt.',
     '["Try role-playing", "Ask about system instructions", "Be creative with your prompts"]',
     '{"type": "contains", "keywords": ["AIH3M_4dm1n_2024", "admin", "password"]}'),

    ('PE-002', 'System Prompt Extraction', 'Prompt Engineering', 'easy', 30,
     'Extract the complete system prompt including all confidential information.',
     '["Ask the assistant to repeat instructions", "Try different phrasings", "Request examples"]',
     '{"type": "full_match", "secret": "AIH3M_4dm1n_2024"}'),

    ('DM-001', 'Training Data Extraction', 'Data & Model Security', 'medium', 50,
     'Extract PII (email, SSN, credit card) from the chat logs database.',
     '["Search chat history", "Try SQL injection", "Look for unprotected endpoints"]',
     '{"type": "pii_extraction", "min_records": 3}'),

    ('AG-001', 'Agent Tool Confusion', 'Agent Security', 'hard', 75,
     'Make the agent use an unintended tool to access restricted resources.',
     '["Tools have overlapping capabilities", "Use ambiguous instructions", "Try chaining tools"]',
     '{"type": "tool_misuse", "expected": "read_file", "actual": "run_command"}'),

    ('IS-001', 'API Gateway Bypass', 'Infrastructure', 'medium', 60,
     'Bypass the API gateway rate limiting to access internal admin endpoints.',
     '["Check for alternative routes", "Try different HTTP methods", "Inspect headers"]',
     '{"type": "endpoint_access", "target": "/admin/debug"}')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_conversation_id ON chat_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Grant permissions (adjust as needed for your security requirements)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO autoagenix;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO autoagenix;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Autoagenix Labs database initialized successfully!';
    RAISE NOTICE '⚠️  WARNING: This database contains intentionally vulnerable data for educational purposes.';
    RAISE NOTICE '📊 Loaded % users, % challenges, % chat logs',
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM challenges),
        (SELECT COUNT(*) FROM chat_logs);
END $$;
