# Sources

Reviewed 30 August 2026 unless noted. Product code does not scrape these sources at runtime.

- [Supabase general Auth configuration](https://supabase.com/docs/guides/auth/general-configuration) — disabling public signup while retaining existing-user sign-in.
- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless) and [JavaScript `signInWithOtp`](https://supabase.com/docs/reference/javascript/auth-signinwithotp) — automatic unknown-user creation and mandatory `shouldCreateUser: false`.
- [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) — Site URL, exact Production callback guidance, and wildcard behavior.
- [Supabase user invitations](https://supabase.com/docs/guides/auth/users) and [email templates](https://supabase.com/docs/guides/auth/auth-email-templates) — administrator invitation, confirmation, recovery, and token-hash routes.
- [Supabase passwordless email expiry](https://supabase.com/docs/guides/auth/auth-email-passwordless) and [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits) — one-hour default email-token lifetime, repeat-request window, and built-in email limits.
- [Supabase user sessions](https://supabase.com/docs/guides/auth/sessions) — JWT lifetime, refresh rotation/reuse, session termination, Free-plan limits, and HttpOnly tradeoffs.
- [Supabase Next.js SSR client](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [advanced SSR guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide), and [`getClaims`](https://supabase.com/docs/reference/javascript/auth-getclaims) — Proxy cookie refresh, verified server identity, and why `getSession` alone is insufficient.
- [Supabase Auth Management API](https://supabase.com/docs/reference/api/v1-update-auth-service-config) — supported project Auth configuration mutation and required owner authorization.
- [Supabase changelog](https://supabase.com/changelog) — current Data API and platform breaking changes.
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS ownership patterns.
- [Supabase database functions](https://supabase.com/docs/guides/database/functions) — function security/search path.
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control) — private object policies.
- [Apple HealthKit](https://developer.apple.com/documentation/healthkit) and [Shortcuts](https://support.apple.com/guide/shortcuts/welcome/ios) — source semantics and automation boundaries.
- [Garmin FIT SDK](https://developer.garmin.com/fit/overview/) — official decoder/profile source; SDK not redistributed.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) — accessibility criteria and patterns.
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [API Security Top 10](https://owasp.org/API-Security/), and [OAuth 2.0 Security BCP](https://www.rfc-editor.org/rfc/rfc9700) — security controls.
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification/) — MCP protocol contracts.
- [OpenAI MCP server guide](https://developers.openai.com/plugins/build/mcp-server), [authentication guide](https://developers.openai.com/plugins/build/auth), [ChatGPT UI guide](https://developers.openai.com/plugins/build/chatgpt-ui), [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels), and [Codex MCP](https://developers.openai.com/codex/mcp) — private integration shape.
- [Microsoft Phi-4 mini model card](https://huggingface.co/microsoft/Phi-4-mini-instruct), [Google Gemma 3 4B model card](https://huggingface.co/google/gemma-3-4b-it), and [Qwen3 4B Instruct model card](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507) — local-model shortlist and licence/access constraints.
