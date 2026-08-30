# Design system

The selected direction is a calm editorial health journal: warm ivory surfaces, deep ink text, teal evidence accents, restrained status colours, rounded cards, and generous whitespace. Dark mode uses a near-black ink surface with contrast-adjusted secondary text.

## Layout

- Desktop: persistent left navigation, open central reading column, contextual evidence rail.
- Mobile: compact header, bottom navigation, single-column cards, safe-area padding, and minimum 44 CSS-pixel targets.
- Demo provenance appears before health content.

## Tokens

CSS custom properties define background, surface, text, muted text, line, accent, success, attention, danger, radius, shadow, spacing, and type scale. System theme is the default and follows the OS; explicit light/dark settings override it.

## Content grammar

Headlines state an observation, the evidence line says compared with what, the interpretation states uncertainty, and the action is short and non-medical. Empty, missing, partial, delayed, and failed states have different copy and never collapse into zero.

Design concepts are preserved under `docs/design`; tested captures are under `docs/screenshots`. Deviations are recorded in `VISUAL_QA_REPORT.md`.
