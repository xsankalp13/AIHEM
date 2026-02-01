# Changelog

All notable changes to Autoagenix Labs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Additional challenge categories
- Enhanced monitoring and analytics
- Improved frontend UI/UX
- More detailed walkthroughs

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Autoagenix Labs platform
- 33 comprehensive AI security challenges covering OWASP LLM Top 10
- Core services:
  - Authentication service with intentional vulnerabilities
  - RAG service with in-memory vector storage
  - Chatbot service with prompt injection vulnerabilities
  - Agent service with excessive agency vulnerabilities
  - Model registry with supply chain vulnerabilities
  - Challenge validator service
- React frontend with modern UI
- Docker Compose deployment configuration
- Comprehensive documentation:
  - README with quick start guide
  - GETTING_STARTED.md
  - CHALLENGES_WALKTHROUGH.md
  - VULNERABILITY_ARCHITECTURE.md
  - Autoagenix_Labs_Security_Researcher_Guide.md
- Challenge categories:
  - Prompt Injection (LLM01) - 6 challenges
  - Insecure Output Handling (LLM02) - 2 challenges
  - Training Data Poisoning (LLM03) - 2 challenges
  - Model Denial of Service (LLM04) - 2 challenges
  - Supply Chain Vulnerabilities (LLM05) - 2 challenges
  - Sensitive Information Disclosure (LLM06) - 4 challenges
  - Insecure Plugin Design (LLM07) - 2 challenges
  - Excessive Agency (LLM08) - 3 challenges
  - Overreliance (LLM09) - 2 challenges
  - Model Theft (LLM10) - 2 challenges
  - Advanced AI Attacks - 6 challenges
- Monitoring stack:
  - Prometheus for metrics
  - Grafana for visualization
- API Gateway (Kong) with intentional misconfigurations
- Leaderboard and progress tracking
- User authentication and authorization

### Security
- ⚠️ All vulnerabilities are intentional for educational purposes
- Comprehensive security warnings in documentation
- Isolated deployment recommendations

### Documentation
- Complete setup and installation guide
- Troubleshooting section
- Challenge walkthroughs
- Architecture documentation
- Security researcher guide

## [0.1.0] - Pre-release

### Added
- Initial project structure
- Basic service implementations
- Docker configuration
- Frontend skeleton

---

## Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes (real ones, not intentional)

