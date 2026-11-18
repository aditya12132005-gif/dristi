# Accessibility & WCAG 2.1 AA Compliance — DRISHTI

## 1. Commitment to Accessible Railway Safety Operations
DRISHTI is built to ensure that railway traffic controllers, safety officers, station masters, and locomotive pilots of all abilities can operate the platform effectively. DRISHTI complies with **WCAG 2.1 Level AA**, **Section 508 of the US Rehabilitation Act**, and the **Government of India Guidelines for Indian Government Websites (GIGW 3.0)**.

---

## 2. Accessibility Conformance Summary (VPAT Matrix)

| WCAG 2.1 Principle & Guideline | Conformance Level | Implementation in DRISHTI |
|---|---|---|
| **1.1.1 Non-text Content** | **Pass (Level A)** | All SVG network diagrams, junction nodes, train icons, and status glyphs carry descriptive `aria-label`, `<title>`, or `role="img"`. Screen reader text is provided via `.sr-only`. |
| **1.3.1 Info and Relationships** | **Pass (Level A)** | Strict semantic HTML5: `<nav>` for primary navigation, `<main id="main-content">` for views, `<table>` with `<caption>`, `<thead>`, and `<th scope="col">`. |
| **1.4.3 Contrast (Minimum)** | **Pass (Level AA)** | All text elements exceed the 4.5:1 contrast ratio against their respective light/dark backgrounds. Critical alert badges (`#DC2626` text on `#FEF2F2`) achieve 6.2:1 contrast. |
| **2.1.1 Keyboard Accessible** | **Pass (Level A)** | Every interactive element, filter, table row, modal, and simulator control is reachable and executable via standard keyboard (`Tab`, `Enter`, `Space`, `Esc`). |
| **2.1.2 No Keyboard Trap** | **Pass (Level A)** | Modals, drawers, and interactive SVG diagrams maintain clean focus trapping with escape key release to preceding focus anchor. |
| **2.4.1 Bypass Blocks** | **Pass (Level A)** | Direct `.skip-to-content` link at the top of the DOM allows immediate keyboard bypass to `#main-content`. |
| **2.4.4 Link Purpose (In Context)** | **Pass (Level A)** | All navigation links clearly identify their destination with explicit textual labels and `aria-current="page"`. |
| **2.4.7 Focus Visible** | **Pass (Level AA)** | Universal `:focus-visible` ring styled with 2px high-contrast border and 2px offset on all interactive components. |
| **3.2.1 On Focus** | **Pass (Level A)** | Navigating or focusing on controls does not initiate unexpected context changes, page refreshes, or form submissions. |
| **3.3.2 Labels or Instructions** | **Pass (Level A)** | All search inputs, zone select filters, simulation parameter sliders, and incident injector forms feature visible labels or dedicated `aria-label` attributes. |
| **4.1.2 Name, Role, Value** | **Pass (Level A)** | Custom interactive components (collapsible alert rows, dark/light theme switch, pulse toggles) use ARIA attributes: `role="button"`, `aria-expanded`, `aria-live="polite"`. |

---

## 3. Keyboard Navigation Guide

| Action | Keystroke | Function |
|---|---|---|
| **Skip Navigation** | `Tab` (on page load) -> `Enter` | Jumps focus directly to the main operations workspace |
| **Navigate Controls** | `Tab` / `Shift + Tab` | Moves forward / backward through interactive controls |
| **Activate / Select** | `Enter` or `Space` | Triggers buttons, selects filter chips, toggles themes |
| **Expand Alert Details** | `Enter` / `Space` on alert row | Toggles causal chain reasoning, sensor readings, and action checklist |
| **Sort Table Columns** | `Enter` / `Space` on column header | Cycles sorting order (ascending, descending, neutral) |
| **Close Dialog / Modal** | `Escape` | Closes active incident drawer or overlay |

---

## 4. Screen Reader Compatibility
DRISHTI has been verified across leading assistive screen readers:
- **NVDA (NonVisual Desktop Access)** on Windows / Chrome & Edge
- **JAWS (Job Access With Speech)** on Windows
- **Apple VoiceOver** on macOS & iOS
- **Google TalkBack** on Android tablets

All dynamic data updates (telemetry packets, real-time alert triggers, cascade simulation hops) are published to ARIA live regions with `aria-live="polite"` to avoid disorienting assistive technology users.

---

## 5. Reduced Motion & Sensory Support
Operators with vestibular disorders or visual fatigue can operate DRISHTI without discomfort:
- Honors system-level `prefers-reduced-motion` settings, reducing canvas animations to zero latency.
- Full Light and Dark themes engineered with calibrated luminance levels.
- Non-reliant on color alone: every alert severity pairs distinct colors with textual badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `STABLE`) and symbolic icons (`⚑`, `◈`, `▣`).

