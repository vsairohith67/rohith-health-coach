# RC6 hosted Production E2E report

Status: **NOT RUN — 0/24**

The mandatory public-signup gate is incomplete (`disable_signup=false`, negative tests 2/6), the exact Auth URL allowlist is not read back, no owner has authenticated, and no RC6 Production target was deployed. Running temporary Production users or data would violate the ordered stop rule.

All 24 required cases remain pending:

1. authorized sign-in
2. unauthorized sign-in rejected
3. public signup rejected
4. User A own profile
5. User A own health data
6. User B isolation
7. anonymous denial
8. device creation
9. ingestion-token creation
10. valid ingestion
11. invalid token
12. revoked token
13. duplicate request
14. duplicate samples
15. Garmin+iPhone arbitration
16. late sleep update
17. partial day
18. deterministic coach
19. private FIT metadata/disabled state
20. private export
21. signed export expiry
22. selective deletion
23. complete synthetic cleanup
24. sign-out/post-signout denial

Existing independent hosted evidence remains valid: RLS 179/179, Storage 21/21, ingestion 26/26, source arbitration 12/12, and synthetic Preview QA. The source-arbitration unit gate still selects Garmin `4,861` over overlapping iPhone `8,148`; it never produces `13,009`. Ambiguous overlap returns conflict/no unsafe total. That case was not re-run as authenticated Production E2E.

Exact hosted cleanup readback after RC6 preparation: zero Auth users/sessions/refresh tokens, application rows, private credentials, and Storage objects.

No real data was used.
