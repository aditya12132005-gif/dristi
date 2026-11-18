"""Tests verifying WCAG 2.1 AA Accessibility compliance across DRISHTI frontend."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = REPO_ROOT / "frontend"


def test_index_html_has_accessibility_landmarks():
    index_html = (FRONTEND_DIR / "index.html").read_text(encoding="utf-8")
    
    # 1. Valid language attribute (WCAG 3.1.1)
    assert '<html lang="en"' in index_html, "Missing lang attribute on <html>"
    
    # 2. Descriptive, non-generic title (WCAG 2.4.2)
    assert "<title>DRISHTI" in index_html, "Generic or missing page title"
    
    # 3. Meta viewport and description present
    assert 'name="viewport"' in index_html, "Missing viewport meta tag"
    assert 'name="description"' in index_html, "Missing description meta tag"
    
    # 4. Skip navigation anchor present (WCAG 2.4.1)
    assert 'href="#main-content"' in index_html, "Missing skip-to-content bypass link"


def test_app_layout_uses_semantic_main_landmark():
    app_jsx = (FRONTEND_DIR / "src" / "App.jsx").read_text(encoding="utf-8")
    
    # Semantic <main> element with target ID (WCAG 1.3.1, 2.4.1)
    assert '<main id="main-content"' in app_jsx, "Missing semantic <main id='main-content'> landmark"
    assert 'role="main"' in app_jsx, "Missing explicit ARIA role='main'"


def test_css_implements_wcag_visual_and_motion_rules():
    index_css = (FRONTEND_DIR / "src" / "index.css").read_text(encoding="utf-8")
    
    # Universal focus-visible ring (WCAG 2.4.7)
    assert ":focus-visible" in index_css, "Missing :focus-visible universal outline"
    
    # Screen-reader helper utility (WCAG 1.3.1, 4.1.2)
    assert ".sr-only" in index_css, "Missing .sr-only utility class"
    
    # Skip-to-content styling
    assert ".skip-to-content" in index_css, "Missing .skip-to-content styling"
    
    # Respects user reduced motion settings (WCAG 2.3.3)
    assert "prefers-reduced-motion" in index_css, "Missing prefers-reduced-motion media query"


def test_navbar_has_accessible_navigation():
    navbar_jsx = (FRONTEND_DIR / "src" / "components" / "Navbar.jsx").read_text(encoding="utf-8")
    
    # Accessible nav landmark
    assert 'aria-label="Main Application Navigation"' in navbar_jsx, "Missing accessible nav label"
    
    # Theme toggle accessibility
    assert 'aria-label={' in navbar_jsx or 'aria-label="' in navbar_jsx, "Missing aria-label on ThemeToggle"


def test_data_tables_have_accessible_headers_and_captions():
    trains_jsx = (FRONTEND_DIR / "src" / "pages" / "Trains.jsx").read_text(encoding="utf-8")
    alerts_jsx = (FRONTEND_DIR / "src" / "pages" / "Alerts.jsx").read_text(encoding="utf-8")
    
    assert 'scope="col"' in trains_jsx, "Trains table missing scope='col' on headers"
    assert '<caption className="sr-only">' in trains_jsx, "Trains table missing screen-reader caption"
    
    assert 'scope="col"' in alerts_jsx, "Alerts table missing scope='col' on headers"
    assert 'aria-expanded=' in alerts_jsx, "Alerts collapsible rows missing aria-expanded"


def test_accessibility_conformance_documentation_exists():
    acc_doc = REPO_ROOT / "ACCESSIBILITY.md"
    assert acc_doc.exists(), "Missing ACCESSIBILITY.md documentation"
    content = acc_doc.read_text(encoding="utf-8")
    assert "WCAG 2.1 Level AA" in content
    assert "Keyboard Navigation" in content

