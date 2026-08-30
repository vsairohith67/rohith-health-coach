import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const freePort = async (): Promise<number> =>
  new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string")
        return reject(new Error("port_unavailable"));
      server.close(() => resolvePort(address.port));
    });
  });

describe("MCP Streamable HTTP boundary", () => {
  let child: ChildProcessWithoutNullStreams | undefined;
  afterEach(() => child?.kill("SIGTERM"));

  it("is loopback-bound, exposes safe metadata, and denies unauthenticated MCP", async () => {
    const port = await freePort();
    child = spawn(
      process.execPath,
      [
        resolve("node_modules/tsx/dist/cli.mjs"),
        "services/health-mcp/src/transports/http.ts",
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ENABLE_HEALTH_MCP: "true",
          HEALTH_MCP_BIND_HOST: "127.0.0.1",
          HEALTH_MCP_PORT: String(port),
        },
        stdio: "pipe",
        shell: false,
      },
    );
    await new Promise<void>((resolveReady, reject) => {
      const timer = setTimeout(
        () => reject(new Error("http_server_start_timeout")),
        30_000,
      );
      child?.stderr.on("data", (chunk: Buffer) => {
        if (chunk.toString().includes("MCP_HTTP_READY")) {
          clearTimeout(timer);
          resolveReady();
        }
      });
      child?.once("exit", (code) =>
        reject(new Error(`http_server_exited:${String(code)}`)),
      );
    });

    const base = `http://127.0.0.1:${port}`;
    await expect(
      fetch(`${base}/health`).then((response) => response.json()),
    ).resolves.toMatchObject({ ok: true, service: "rohith-health-mcp" });
    const metadata = await fetch(
      `${base}/.well-known/oauth-protected-resource`,
    ).then((response) => response.json());
    expect(metadata).toMatchObject({ resource: base });
    const denied = await fetch(`${base}/mcp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    expect(denied.status).toBe(401);
    expect(denied.headers.get("www-authenticate")).toContain(
      "oauth-protected-resource",
    );
  }, 40_000);
});
