# Build report

Final local run on Windows/Node 22 toolchain:

- `pnpm.cmd install --frozen-lockfile`: dependency tree already synchronized to committed lock.
- `pnpm.cmd format:check`: PASS.
- `pnpm.cmd lint`: PASS, zero warnings after excluding generated build/caches globally.
- `pnpm.cmd typecheck`: PASS.
- `pnpm.cmd build`: PASS on Next.js 16.3.3/Turbopack; 26 static pages generated plus dynamic API/auth routes.
- `uv lock --check --directory services/fit-parser`: PASS, 31 packages resolved from lock.
- `docker build --pull=false -t rohith-health-fit-parser:rc4 services/fit-parser`: PASS with digest-pinned Python 3.12.11 base and frozen uv install.

The FIT container was also run on loopback: `/health` returned `ok`, authenticated `/version` reported RC4/decoder not configured, and `id` showed non-root UID/GID 999. No production deployment is implied.

Release reproducibility: the exact `rohith-health-coach-v1.0.0-rc4.zip` was extracted to a clean temporary directory, installed with the frozen lock (455 packages), and passed format, lint, typecheck, 254 tests, the 26-page production build, and extracted secret scanning.
