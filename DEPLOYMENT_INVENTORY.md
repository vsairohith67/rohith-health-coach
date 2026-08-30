# Deployment inventory

Inventory captured 2026-08-30. Identifiers are non-secret.

| Platform      | Observed account/resource                                 | Selected role                                            | State                                               |
| ------------- | --------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| GitHub        | Personal `vsairohith67`; private `rohith-health-coach`    | Private source and CI                                    | PR open; CI blocked before steps by account billing |
| Supabase      | `Supabase test Organisation`; zero projects               | Auth, Postgres, private Storage, ingestion Edge Function | Blocked pending project/cost/region confirmation    |
| Vercel        | Personal Hobby; unrelated `body-composition-journey` only | Preferred PWA host                                       | Not created or deployed                             |
| Netlify       | Personal Free owner team; zero sites                      | Alternative PWA host                                     | Intentionally unused                                |
| FastAPI Cloud | No authenticated target verified                          | Optional private FIT worker                              | Not deployed                                        |
| Hugging Face  | Personal non-Pro, read-scoped                             | Optional local model discovery                           | No mutation; disabled                               |
| Notion        | Personal workspace; relevant private Life OS hub          | Sanitized project status only                            | Eligible for one terminal update                    |
| Asana         | No matching project                                       | Optional task tracking                                   | Intentionally unused                                |

Intended resource names are `rohith-health-coach` (GitHub/Vercel), `rohith-health-coach-prod` (Supabase), and `rohith-health-fit-parser` (worker). Only one web host is allowed. No current custom domain was selected and Cloudflare is unnecessary for this pilot.
