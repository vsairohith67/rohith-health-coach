# FIT worker deployment report

Status: **CONTAINER VERIFIED LOCALLY / NOT DEPLOYED**.

The digest-pinned, non-root container built successfully. On loopback, `/health` returned `ok`, authenticated `/version` reported RC4 with decoder not configured, and the process ran as UID/GID 999. No FastAPI Cloud account/service, secret, network policy, log sink, TLS endpoint, or private ingress was configured. Full FIT decoding remains fail-closed until an approved official SDK is supplied.
