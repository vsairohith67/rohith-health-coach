# RC8 public-repository safety report

Audited: 2026-08-31

## Decision

- `PUBLIC_REPO_HISTORY_SCAN = PASSED`
- `RC8_REAL_DATA_GATE = NOT_BLOCKED_BY_SECRET_EXPOSURE`
- `PUBLIC_REPOSITORY_EXCEPTION = ACCEPTED_TEMPORARILY`
- Repository visibility remains **PUBLIC**.

No credential, token, private key, password-bearing database URL, real health record, real FIT/GPX/TCX file, database dump, signed Storage URL, or health export was found in reachable Git history or the reviewed public GitHub surfaces.

## Scope

- Reachable commits across all local and fetched remote refs: 21.
- Reachable Git objects: 722.
- Blob objects: 482.
- Unique historical paths: 348.
- Current tracked files: 348.
- Tags: 0.
- Deleted or renamed historical paths: 0.
- GitHub Actions workflows: 1.
- GitHub Actions runs/logs: 12 runs, 619,462 characters.
- GitHub Actions artifacts: 0.
- GitHub Releases/assets: 0.
- Pull requests and their discussion metadata: 4.
- Issues: 0.

The audit covered every reachable commit, all local and fetched remote branches, current tracked and untracked source evidence, historical path names, blob sizes/extensions, workflow configuration, public Actions logs, PR/issue content, and available artifact/release metadata.

## Tools and checks

- Gitleaks 8.30.1 full Git-history scan with 100% output redaction.
- Repository `verify:secrets` scanner: 354 text files, zero credential signatures.
- Independent per-commit targeted regex scans for Supabase secrets/service roles, JWTs, password-bearing database URLs, provider tokens, OAuth literals, Garmin credential assignments, device-token material, signed URLs, private keys, and Gmail addresses in file content.
- Historical filename and extension audit for `.env`, key/certificate files, FIT/GPX/TCX, database dumps, CSV, archives, and images.
- Manual visual review of all six tracked PNG files.
- Read-only GitHub review of Actions configuration/logs, PRs, issues, artifacts, releases, repository visibility, and refs.

GitHub's secret-scanning alerts API was unavailable or not enabled for this repository. The independent local full-history scan therefore remains the primary evidence.

## Findings and false positives

### Gitleaks candidate

- Category: generic API key.
- Commit: `2eb3b1fb48658317005d2bf9d66c5ca3c8d9cbe6`.
- Path: `FINAL_SECURITY_REPORT.md`, line 8.
- Classification: false positive.
- Reason: the candidate is a three-word alphabetic slash-delimited prose phrase in a security-control sentence. It has no secret assignment, credential prefix, token shape, digits, or cryptographic structure.
- Likely active: no.
- Remediation: none required.

### Commit metadata identity

- Category: non-secret personal email metadata.
- Location: historical Git author/committer metadata; no repository file contains the address.
- Credential use: no.
- Health-data association: none.
- Likely active secret: no.
- Mitigation applied: future commits in this repository now use the authenticated GitHub noreply identity through repository-local Git configuration.
- Deferred remediation: any history rewrite must be separately coordinated; no force-push or destructive rewrite was performed unattended.

This identity-metadata finding does not convert into credential exposure and does not expose health data, but it remains documented as a privacy residue of the temporarily Public history.

## File and workflow decisions

- `.env.example` contains empty secret fields, local/browser-safe placeholders, booleans, timezone, and retention configuration only.
- No historical `.env` file other than `.env.example` exists.
- The six PNG files are explicitly labelled Demo/synthetic designs or product screenshots and contain no personal identity or real health information.
- No FIT, GPX, TCX, CSV health export, database dump, credential file, or private-key material exists in history.
- The CI workflow uses read-only repository permissions, commit-pinned actions, no repository secrets, and no artifact upload.
- Public Actions logs, PR content, and issue content produced zero targeted credential or personal-email findings.

## Public-repository exception

The owner has temporarily accepted Public source-code visibility. This exception does not authorize secrets, identity values, health records, screenshots with real data, payloads, logs, exports, FIT files, or database material in Git. Those prohibitions remain enforced.
