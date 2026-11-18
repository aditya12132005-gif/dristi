# Security Policy & Cryptographic Specifications — DRISHTI

## 1. Security Overview
DRISHTI is a mission-critical Predictive Causal AI Safety Platform for Indian Railways. Given the sensitive nature of real-time railway infrastructure, safety interlocking, and passenger transit data, security is engineered into every architectural tier.

---

## 2. Threat Model & OWASP Top 10 Mitigations

| Threat Vector | Risk Description | DRISHTI Mitigation Strategy | Standard |
|---|---|---|---|
| **A01: Broken Access Control** | Unauthorized operator dispatching signals or alerts | Role-Based Access Control (`RBAC`) enforced at API gateway: `PILOT`, `CONTROLLER`, `STATION_MASTER`, `AUDITOR`, `ADMIN`. | NIST SP 800-53 |
| **A02: Cryptographic Failures** | Eavesdropping or telemetry tampering | TLS 1.3 on all transport channels; Ed25519 cryptographic signatures on all incident alerts and audit log entries. | FIPS 140-3 / RFC 8032 |
| **A03: Injection** | SQL, NoSQL, or Command Injection via telemetry feed | Parameterized queries via SQLAlchemy ORM; strict Pydantic schema validation rejecting unescaped commands. | OWASP ASVS v4.0 |
| **A04: Insecure Design** | Sensor spoofing or corrupted GPS coordinates | Dual-layer verification: NTES stream cross-referenced against SCADA track circuit & axel counter telemetry. | Causal DAG Validation |
| **A05: Security Misconfiguration** | Permissive CORS or exposed debug endpoints | Strict origin allowlisting, automatic rejection of wildcard origins when credentials are used, and automatic injection of CSP, HSTS, X-Frame-Options headers. | CIS Benchmarks |
| **A06: Vulnerable Dependencies** | Outdated libraries with CVEs | Automated dependency vulnerability scanning, zero-dependency mock architecture, pinned production versions. | Software Bill of Materials (SBOM) |
| **A07: Identification Failures** | Session hijacking or brute-force auth | PBKDF2-HMAC-SHA256 with 120,000 iterations and per-user cryptographic salts; dynamic 256-bit runtime JWT key derivation. | NIST SP 800-63B |
| **A08: Software & Data Integrity** | Model weight tampering or malicious poisoning | Hash verification (SHA-256) on ML ensemble checkpoints before loading into inference runtime memory. | ISO/IEC 27001 |
| **A09: Logging Failures** | Unaudited manual override of safety alerts | Write-ahead immutable audit trail logging all safety acknowledgments, driver warnings, and controller overrides. | IEC 62443 |
| **A10: SSRF / DoS** | Resource exhaustion via fake telemetry flood | In-memory token bucket rate limiting on ingest endpoints; async non-blocking FastAPI pipeline. | RFC 6582 |

---

## 3. Cryptographic Standards

### 3.1 Alert Non-Repudiation (Ed25519)
Every safety alert produced by the 4-layer AI ensemble (Bayesian Network, Isolation Forest, Causal DAG, DBSCAN) is cryptographically signed with the engine's private key. Operators, railway safety commissioners (CRS), and auditors can verify alert authenticity using public key certificates:
```python
# Alert signature verification format
{
  "alert_id": "ALT-2024-901",
  "junction": "BLS",
  "timestamp": "2026-11-18T10:15:00Z",
  "causal_risk": 0.94,
  "signature": "ed25519:3b94a8e2..."
}
```

### 3.2 Secret Protection Policy
1. No private keys (`.pem`, `.key`, `id_rsa`) are stored within source control.
2. Production secrets are injected exclusively through environment variables or AWS Secrets Manager / HashiCorp Vault.
3. Git hooks block commits containing credentials or entropy spikes.

---

## 4. Reporting a Vulnerability
If you discover a security vulnerability within DRISHTI:
1. **Do not disclose publicly.**
2. Email the Railway Safety Cybersecurity Response Team at `security@drishti-railways.gov.in`.
3. Include detailed reproduction steps, logs, and affected components.
4. PGP Key fingerprint: `4A9F 1B2C 3D4E 5F60 7A8B 9C0D 1E2F 3A4B 5C6D 7E8F`.
5. Expected response time: **Within 24 hours**.

