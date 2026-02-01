# Contributing to Autoagenix Labs

Thank you for your interest in contributing to Autoagenix Labs! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Adding New Challenges](#adding-new-challenges)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Autoagenix Labs.git
   cd Autoagenix Labs
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/JBAhire/Autoagenix Labs.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs

- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include steps to reproduce
- Provide environment details (OS, Docker version, etc.)
- Include relevant logs or error messages

### Suggesting Enhancements

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Clearly describe the enhancement
- Explain why it would be useful
- Consider implementation approach

### Adding New Challenges

See the [Adding New Challenges](#adding-new-challenges) section below.

### Improving Documentation

- Fix typos or clarify unclear sections
- Add examples or use cases
- Improve code comments
- Update README or other docs

## Development Setup

### Prerequisites

- Docker & Docker Compose
- Python 3.10+
- Node.js 18+ (for frontend development)
- Git

### Local Development

1. **Start services**:
   ```bash
   cd deploy/docker
   docker-compose up -d
   ```

2. **Run tests**:
   ```bash
   # Test individual services
   cd services/rag-service
   python test_service.py
   ```

3. **Make changes** and test locally

4. **Check code quality**:
   ```bash
   # Python: Use flake8 or black (if configured)
   # JavaScript: Use ESLint (if configured)
   ```

## Coding Standards

### Python

- Follow PEP 8 style guide
- Use type hints where possible
- Write docstrings for functions and classes
- Keep functions focused and small
- Use meaningful variable names

### JavaScript/React

- Follow ESLint rules
- Use functional components with hooks
- Keep components small and focused
- Use meaningful prop and variable names

### General

- Write clear, self-documenting code
- Add comments for complex logic
- Keep commits focused and atomic
- Write meaningful commit messages

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(challenges): add new prompt injection challenge

Adds LLM01-ADV-004 challenge demonstrating multi-step
prompt injection attacks with context manipulation.
```

## Submitting Changes

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** to ensure everything works

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your descriptive message"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**:
   - Use the [PR template](.github/pull_request_template.md)
   - Describe your changes clearly
   - Reference any related issues
   - Add screenshots if UI changes

6. **Respond to feedback** and make requested changes

## Adding New Challenges

### Challenge Structure

Challenges are defined in `challenges/definitions/challenges.yaml`. Each challenge should include:

- **ID**: Unique identifier (e.g., `LLM01-ADV-004`)
- **Title**: Descriptive title
- **Category**: OWASP LLM Top 10 category
- **Difficulty**: Easy, Medium, Hard, or Expert
- **Points**: Point value
- **Description**: Clear description of the challenge
- **Hints**: Optional hints for users
- **Validation**: How the challenge is validated

### Example Challenge

```yaml
- id: "LLM01-ADV-004"
  title: "Multi-Step Prompt Injection"
  category: "LLM01 - Prompt Injection"
  difficulty: "Hard"
  points: 120
  description: |
    Exploit a multi-step prompt injection attack by manipulating
    context across multiple interactions.
  hints:
    - "Think about how context persists between messages"
    - "Consider using role-playing techniques"
  validation:
    type: "extract_secret"
    secret: "admin_password_2024"
```

### Validation Types

- `extract_secret`: Extract a specific secret value
- `code_execution`: Execute code successfully
- `data_extraction`: Extract specific data
- `behavior_change`: Change system behavior
- `custom`: Custom validation logic

### Testing Challenges

1. Test the challenge locally
2. Verify validation works correctly
3. Ensure hints are helpful but not too revealing
4. Test edge cases

## Documentation

### Code Documentation

- Add docstrings to Python functions/classes
- Add JSDoc comments to JavaScript functions
- Explain complex algorithms or logic
- Document API endpoints

### User Documentation

- Update README.md for major changes
- Add examples to GETTING_STARTED.md
- Update CHALLENGES_WALKTHROUGH.md for new challenges
- Keep architecture docs up to date

## Review Process

1. **Automated Checks**: PRs must pass CI/CD checks (if configured)
2. **Code Review**: At least one maintainer will review
3. **Testing**: Changes should be tested locally
4. **Documentation**: Documentation should be updated

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues/PRs for similar questions

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md (if created)
- Credited in release notes
- Acknowledged in the project README

Thank you for contributing to Autoagenix Labs! 🎯🔒

