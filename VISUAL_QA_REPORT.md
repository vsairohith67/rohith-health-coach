# Visual QA report

Selected direction: calm editorial health journal. Concept references are `docs/design/concept-desktop.png` and `concept-mobile.png`; tested captures are under `docs/screenshots`.

## Fidelity ledger

| Concept intent                                    | Implemented result                                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Warm ivory surface / deep ink dark theme          | Tokenized light/dark palettes preserve the contrast and quiet editorial feel                    |
| Fixed desktop rail with compact mobile navigation | Persistent sidebar at 1440px; sidebar hidden and bottom navigation visible at 390px             |
| Prominent provenance notice                       | Demo banner is the first content state and explicitly says data is synthetic                    |
| Open central narrative plus evidence context      | Today uses a readable main column, evidence rail, and supporting cards rather than a dense grid |
| Honest missing/partial chart semantics            | Sleep series leaves gaps, labels partial/missing data, and exposes a text summary               |
| Structured Ask instead of generic chat bubbles    | Question form returns freshness, range, evidence, limitations, and bounded action cards         |
| Visible integration truth                         | Settings separates deterministic active, provider off, prepared, and ungranted-consent states   |
| Comfortable mobile rhythm/tap targets             | 390×844 reflow has no horizontal overflow and navigation targets exceed 44px                    |

Intentional deviations: the implementation says “close to recent pattern” rather than “shorter” when synthetic evidence does not support a decline; baseline is provisional at 25 valid days instead of concept maturity; deterministic engine may emit one action rather than filling three; System theme follows OS. These changes improve truthfulness.

In-app browser was inspected at 1440×1000 and 390×844, plus the integration settings at 1440×900 and 390×844 and a zoom-equivalent narrow pass. The automated matrix covered all seven required sizes across Today, Ask, and settings, plus dark/reduced motion. Full-page mobile capture tiling is a capture-tool artefact; DOM inspection confirmed one rail and three support panels. The only development console item is React’s expected CSP `eval()` diagnostic; production-browser checks were clean.
