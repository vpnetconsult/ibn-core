# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (main) | ✅ |
| older releases | ❌ |

## Reporting a Vulnerability

If you discover a security vulnerability in `ibn-core`, **please do not open a public GitHub issue**.

Instead, report it privately via:

- **GitHub Private Vulnerability Reporting**: [Submit a confidential advisory](https://github.com/vpnetconsult/ibn-core/security/advisories/new)

Please include:
- A clear description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

## Response Timeline

- **Acknowledgement**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix / disclosure**: Coordinated with reporter, typically within 90 days

## Security Tooling

Automated scanning on every push and weekly:
- **CodeQL** — static analysis (JS/TS)
- **Trivy** — container image vulnerability scanning
- **npm audit** — dependency vulnerability checks
- **Dependency Review** — license and vulnerability gate on PRs

## Disclosure Policy

We follow responsible disclosure. Once a fix is ready:
1. A GitHub Security Advisory will be published
2. Reporter credited (unless anonymity preferred)
3. A patched release will be tagged
