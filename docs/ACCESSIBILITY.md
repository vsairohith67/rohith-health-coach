# Accessibility

The target is WCAG 2.2 AA for the supported web experience.

- Semantic landmarks, one primary heading, labelled navigation, visible focus, keyboard operation, and descriptive form labels.
- Colour contrast is at least 4.5:1 for ordinary text and 3:1 for large text/non-text UI where applicable.
- Status does not rely on colour alone.
- Touch targets are at least 44 by 44 CSS pixels.
- Charts have text summaries; the completeness strip has an accessible image role and label.
- Motion respects `prefers-reduced-motion`.
- Zoom/reflow is supported without horizontal document overflow at the tested narrow viewport.
- Error and missing-data messages are specific and remain available to assistive technology.

Automated Axe checks cover serious and critical WCAG-tagged findings on desktop and mobile. Manual browser checks cover landmarks, heading order, labels, focus visibility, reflow, and tap targets. Automated clearance does not replace screen-reader and real-device testing, which remains a pilot gate.
