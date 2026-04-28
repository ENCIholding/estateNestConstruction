# ENCI Accessibility QA Checklist

Generated: 2026-04-28T07:36:42.848Z

| Area | Status | Evidence | Action |
| --- | --- | --- | --- |
| Careers form uses explicit labels + ids | PARTIAL | One or more required Careers fields are missing explicit label/id pairing. | Complete missing labels/ids in Careers form. |
| ARIA live/alert error messaging coverage | PARTIAL | Found 2 role="alert" and 2 aria-live markers in targeted forms/pages. | Expand a consistent aria-live + aria-describedby pattern across all form errors and toast-to-inline fallbacks. |
| Management report modules are routable | DONE | Routes for presentations, videos, and client reports are present. | No action. |
| Live color contrast validation | PENDING | Contrast ratios require computed browser colors and cannot be confirmed statically. | Run live contrast checks and record measured ratios in contrast-tracking.csv before deployment sign-off. |
| Keyboard/screen-reader regression pass | PENDING | Requires live browser walkthrough (tab order, focus ring, screen reader output). | Execute assisted QA on public forms + management key flows and document findings. |

## Contrast Test Targets

Use reports/accessibility/contrast-tracking.csv to store measured values from live browser checks.

1. Hero white text over image overlay
2. Gradient headings
3. Orange text on white/background surfaces
4. White text on green/yellow gradients
5. Footer links
6. Management dashboard badges
7. Disabled/offline module labels
8. Toast messages and error states
