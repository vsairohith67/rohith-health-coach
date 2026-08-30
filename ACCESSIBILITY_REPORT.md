# Accessibility report

Automated and manual local checks passed for the implemented release candidate.

- Playwright/Axe: no serious or critical WCAG-tagged findings on Today and Ask at desktop 1440×900 and mobile 390×844.
- Basic semantic checks: main/navigation landmarks, one primary heading, labels, skip link, accessible completeness graphic, visible focus, and keyboard-operable controls.
- Reflow: no horizontal document overflow at the tested mobile viewport; bottom navigation and safe padding remain available.
- Tap targets: primary mobile navigation targets are approximately 60 CSS pixels high.
- Contrast repairs were made to dark secondary text and the Demo banner.
- Reduced-motion and chart text-summary behavior are implemented.

Remaining: VoiceOver/NVDA/TalkBack, high-contrast/forced-colours, 200–400% zoom on physical browsers, long localization strings, and real ChatGPT widget-container accessibility.
