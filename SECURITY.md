# Security Policy

## ⚠️ IMPORTANT: This is an Intentionally Vulnerable Platform

**Autoagenix Labs is designed to be vulnerable for educational purposes.** The vulnerabilities in this platform are **intentional** and are meant to teach AI security concepts.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting Security Issues

### For Real Security Issues in the Platform Itself

If you discover a **real security vulnerability** in the Autoagenix Labs platform itself (not an intentional vulnerability), please report it responsibly:

1. **Do NOT** open a public issue
2. Email security concerns to: [INSERT SECURITY EMAIL]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### What to Report

**Report these:**
- Real vulnerabilities in deployment scripts
- Accidental exposure of real credentials
- Issues with the development environment
- Problems with documentation that could lead to real security issues

**Do NOT report these (they're intentional):**
- Weak password hashing (MD5) - This is intentional
- SQL injection vulnerabilities - These are intentional
- JWT vulnerabilities - These are intentional
- Prompt injection vulnerabilities - These are intentional
- Any vulnerabilities documented in VULNERABILITY_ARCHITECTURE.md

## Responsible Disclosure

We follow responsible disclosure practices:

1. **Private Report**: Report privately first
2. **Investigation**: We'll investigate and confirm
3. **Fix Development**: We'll develop a fix
4. **Coordination**: We'll coordinate disclosure timing
5. **Public Disclosure**: After fix is available

## Security Best Practices for Users

### ⚠️ CRITICAL WARNINGS

1. **Never deploy to production** - This platform is intentionally vulnerable
2. **Never expose to the public internet** - Use only in isolated environments
3. **Never use with real data** - Use only test/dummy data
4. **Never use real API keys** - Use test keys or environment variables
5. **Isolate the environment** - Run in a VM, container, or isolated network

### Safe Deployment Practices

- Run in isolated Docker networks
- Use firewall rules to restrict access
- Don't expose ports to the internet
- Use environment variables for secrets
- Regularly update dependencies
- Monitor for unexpected behavior

## Known Intentional Vulnerabilities

This platform intentionally includes vulnerabilities for educational purposes. See [VULNERABILITY_ARCHITECTURE.md](VULNERABILITY_ARCHITECTURE.md) for a complete list.

### Categories of Intentional Vulnerabilities

1. **OWASP LLM Top 10** - All categories are intentionally vulnerable
2. **Authentication Issues** - Weak hashing, JWT flaws, etc.
3. **Authorization Issues** - Missing access controls
4. **Input Validation** - SQL injection, XSS, etc.
5. **Information Disclosure** - Secrets in logs, prompts, etc.
6. **Supply Chain** - Vulnerable dependencies

## Security Updates

We will notify users about:
- Updates to fix real security issues
- Dependency updates with security patches
- Changes to deployment configurations
- Important security-related documentation updates

## Security Research

We encourage security research on this platform! However:

1. **Stay within scope** - Only test the Autoagenix Labs platform itself
2. **Don't attack infrastructure** - Don't attack hosting, CI/CD, etc.
3. **Respect privacy** - Don't access other users' data
4. **Follow responsible disclosure** - Report real issues privately

## Acknowledgments

We appreciate security researchers who help improve the platform. Contributors will be:
- Acknowledged in security advisories (if desired)
- Listed in SECURITY.md (if desired)
- Credited in release notes

## Questions?

For security-related questions:
- Open a discussion (for general questions)
- Email security team (for sensitive issues)
- Check documentation first

---

**Remember**: This platform is for **educational purposes only**. Use responsibly and ethically.

