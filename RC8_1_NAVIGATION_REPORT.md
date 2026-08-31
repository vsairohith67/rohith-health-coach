# RC8.1 complete navigation report

Verified: 2026-08-31

Version: `1.0.0-rc8.1`

Data classification: synthetic only; no credential or health record was used.

## Result

`RC8_1_COMPLETE_NAVIGATION = PASSED`

The app shell now exposes every implemented, user-facing product route. Auth callbacks, API endpoints, and other non-product routes remain intentionally absent from navigation.

The grouped navigation includes 19 destinations:

- Overview: Today, Trends, Sleep, Heart, Activity, Wellbeing, and Coach.
- Explore: Ask my data, Experiments, and Reports.
- Data: Data sources, Imports, and iPhone ingestion.
- Settings and help: Settings, AI controls, Privacy, Methodology, Data dictionary, and Welcome.

The iPhone ingestion page is now directly reachable from both desktop and mobile navigation. The route does not contain or persist a plaintext ingestion token.

## Responsive and accessibility behavior

- Desktop navigation has its own vertical scroll region, so the footer and sign-out control remain available at short viewport heights.
- The desktop sidebar has accessible Collapse sidebar and Expand sidebar controls.
- Collapsed links retain explicit accessible names and visible tooltips.
- Mobile keeps five primary quick links and adds a scrollable All features drawer.
- The mobile drawer closes through its close control, backdrop, route selection, or the Escape key.
- While the drawer is open, background regions are inert, Tab and Shift+Tab remain inside the dialog, and focus returns to the menu button on close.
- Crossing into the desktop breakpoint closes the drawer, restores body scrolling, removes inert state, and moves focus to the visible desktop home link.
- Mobile Production mode includes the existing private sign-out control in the drawer.
- The 1024-pixel banner and utility-row collision found during visual review was corrected.
- Next.js 16 smooth-scroll intent is declared explicitly on the document element.

## Verification

| Gate                      |                                                Result |
| ------------------------- | ----------------------------------------------------: |
| Prettier                  |                                                  PASS |
| ESLint                    |                                   PASS, zero warnings |
| TypeScript                |                                     PASS, zero errors |
| Unit/integration          |                                         PASS, 282/282 |
| Agent evaluations         |                                         PASS, 222/222 |
| FIT lint/tests            |                                       PASS, 5/5 tests |
| Database migration replay |                                PASS, all 7 migrations |
| Database assertions       |                                           PASS, 91/91 |
| Database lint             |                                   PASS, zero findings |
| Zero-sample ingestion     |                   PASS, HTTP 200 and zero health rows |
| Production build          |                       PASS, 29 generated routes/pages |
| Playwright full suite     |                                           PASS, 22/22 |
| Browser viewport matrix   | PASS, 360, 390, 430, 768, 1024, 1280, and 1440 pixels |
| Navigation accessibility  |             PASS, no serious or critical Axe findings |
| Secret scan               |                                                  PASS |
| Private-data scan         |                                                  PASS |

No AI, MCP, ChatGPT, Codex, Garmin cloud, phone automation, FIT cloud processing, or real-data ingestion was enabled by this change.
