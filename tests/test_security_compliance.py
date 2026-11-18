"""Tests verifying Enterprise Security & OWASP Hardening across DRISHTI repository."""

from pathlib import Path
import os

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"


def test_no_private_keys_in_repository():
    """Ensure no SSH or PEM private keys are checked into source control."""
    for key_pattern in ["keys", "keys.pub", "id_rsa", "id_ed25519"]:
        key_file = REPO_ROOT / key_pattern
        assert not key_file.exists(), f"Security violation: Found private key file {key_pattern} in repo root!"


def test_gitignore_blocks_cryptographic_secrets():
    gitignore = (REPO_ROOT / ".gitignore").read_text(encoding="utf-8")
    assert "/keys" in gitignore or "keys" in gitignore
    assert "*.pem" in gitignore
    assert "*.key" in gitignore


def test_cors_policy_rejects_wildcard_with_credentials():
    main_app_py = (BACKEND_DIR / "main_app.py").read_text(encoding="utf-8")
    server_py = (BACKEND_DIR / "api" / "server.py").read_text(encoding="utf-8")
    
    # Must NOT have allow_origins=["*"] with allow_credentials=True
    assert 'allow_origins=["*"],\n    allow_credentials=True' not in main_app_py
    assert 'allow_origins=["*"],\n    allow_credentials=True' not in server_py


def test_security_headers_middleware_configured():
    main_app_py = (BACKEND_DIR / "main_app.py").read_text(encoding="utf-8")
    server_py = (BACKEND_DIR / "api" / "server.py").read_text(encoding="utf-8")
    
    for py_file in [main_app_py, server_py]:
        assert "X-Content-Type-Options" in py_file
        assert "X-Frame-Options" in py_file
        assert "Content-Security-Policy" in py_file
        assert "Strict-Transport-Security" in py_file


def test_jwt_secret_uses_secure_derivation():
    auth_py = (BACKEND_DIR / "security" / "auth.py").read_text(encoding="utf-8")
    # Must not fallback blindly to insecure static string
    assert 'JWT_SECRET = os.getenv("JWT_SECRET", "change-this-in-production")' not in auth_py
    assert "token_hex" in auth_py or "secrets" in auth_py


def test_security_policy_documentation_exists():
    sec_doc = REPO_ROOT / "SECURITY.md"
    assert sec_doc.exists(), "Missing SECURITY.md policy document"
    content = sec_doc.read_text(encoding="utf-8")
    assert "OWASP Top 10" in content
    assert "Ed25519" in content

