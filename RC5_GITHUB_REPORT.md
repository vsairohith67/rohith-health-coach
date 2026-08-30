# RC5 GitHub report

Verified: 2026-08-30 (Asia/Calcutta)

- Pull request: `https://github.com/vsairohith67/rohith-health-coach/pull/1`
- Result: merged normally; no force merge, branch-protection bypass, history rewrite, or evidence deletion.
- PR head: `91f839a763df39e2fed516fe27a879f39eb0757a`
- Merge commit on `main`: `f6af08dd9302cd76323ee0cd15e92f6ea78760d3`
- Merge parents: `2eb3b1fb48658317005d2bf9d66c5ca3c8d9cbe6` and `91f839a763df39e2fed516fe27a879f39eb0757a`
- Merge tree: `6cb767d056a6f5276ae2f92cdc44a80ffbaf807a`
- Ancestry verification: the final PR head is an ancestor of `origin/main`.
- Pre-merge exact-head CI: run `33304275915`, Python and JavaScript success.
- Post-merge exact-SHA CI: run `33304331092`, Python job `99238060804` and JavaScript job `99238060931` success, including production build and secret verification.
- Audit evidence: the source branch was retained; the resolved P1 review thread and its verification reply remain on PR #1.
- RC5 working branch: `codex/rc5-hosted-synthetic`, created from the verified merge commit.
