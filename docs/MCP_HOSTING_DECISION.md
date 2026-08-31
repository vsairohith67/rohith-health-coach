# MCP hosting decision

## RC8 decision

No MCP service is deployed or enabled. Cloudflare is not required for a local MCP connection.

The only architecture considered for a later, separately approved local experiment is:

```text
Codex/Desktop
    -> STDIO
    -> local Garmin MCP process
```

`stdio` keeps the MCP process local to the desktop client and avoids opening a network port. The Garmin server and its credential store would remain on the laptop.

## Possible future ChatGPT path

A future path may be evaluated only if a separately reviewed Secure MCP Tunnel capability is available:

```text
local MCP
    -> Secure MCP Tunnel
    -> ChatGPT
```

That is not part of RC8 or the proposed first RC9 experiment. ChatGPT, Codex health access, and all tunnel exposure remain disabled.

## Cloudflare's role

Cloudflare Tunnel would be optional connectivity plumbing only. It would not become the MCP server, would not add tool authorization by itself, and would not make an unauthenticated MCP HTTP endpoint safe. Any future tunnel design would require its own authentication, authorization, tool allowlist, logging, data-retention, revocation, and threat-model review.

Cloudflare is therefore neither required nor approved for the local path.

## Availability boundary

When the laptop is powered off, sleeping, disconnected, or the local MCP process is stopped, the local MCP is unavailable. A tunnel cannot change that.

Twenty-four-hour availability would require a separately reviewed always-on host with hardened secret storage, patching, access controls, monitoring, backups, incident response, and explicit cost approval. No such host is authorized or provisioned.

## Current status

- Local Garmin MCP: research only; unauthenticated
- Network MCP transport: disabled
- Cloudflare Tunnel: not deployed
- Secure MCP Tunnel: not configured
- ChatGPT MCP: disabled
- Codex health MCP: disabled
- Production integration: disabled
