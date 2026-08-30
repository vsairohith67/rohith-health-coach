# FastAPI deployment

The FIT worker is an independent private service. Its image is based on a digest-pinned Python 3.12 slim image, installs from the frozen uv lock, runs as user `fit`, disables access logs, and exposes port 8080 only inside the chosen private network.

Required secrets/config: `FIT_INTERNAL_TOKEN`, maximum upload size, official decoder path/hash/profile version, and allowed caller/network. Add health checks, request/body limits, no public docs, private egress policy, log redaction, rotation, and rollback to the previous immutable image.

The local image build and loopback container health/version/non-root checks passed. FastAPI Cloud CLI support is not installed in the project (`fastapi[standard]` is absent); per deployment guardrails no dependency or cloud app was created without an explicit installation/account action. Hosted worker and official decoder remain unverified.
