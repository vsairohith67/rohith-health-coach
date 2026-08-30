import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createHealthMcpServer } from "../server/createServer.js";
import {
  authorizationServerMetadata,
  protectedResourceMetadata,
} from "../auth/oauth.js";

const host = process.env.HEALTH_MCP_BIND_HOST ?? "127.0.0.1";
const port = Number(process.env.HEALTH_MCP_PORT ?? "8787");
const resource = process.env.HEALTH_MCP_AUDIENCE ?? `http://${host}:${port}`;
const issuer = process.env.HEALTH_MCP_ISSUER ?? `${resource}/oauth`;
const enabled = process.env.ENABLE_HEALTH_MCP === "true";
const sessions = new Map<string, StreamableHTTPServerTransport>();

const httpServer = createServer(async (request, response) => {
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader(
    "content-security-policy",
    "default-src 'none'; frame-ancestors 'none'",
  );
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(enabled ? 200 : 503, {
      "content-type": "application/json",
    });
    response.end(
      JSON.stringify({
        ok: enabled,
        service: "rohith-health-mcp",
        version: "1.0.0-rc6",
      }),
    );
    return;
  }
  if (
    request.method === "GET" &&
    request.url === "/.well-known/oauth-protected-resource"
  ) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(protectedResourceMetadata(resource, issuer)));
    return;
  }
  if (
    request.method === "GET" &&
    request.url === "/.well-known/oauth-authorization-server"
  ) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(authorizationServerMetadata(issuer)));
    return;
  }
  if (!enabled || request.url !== "/mcp") {
    response.writeHead(enabled ? 404 : 503, {
      "content-type": "application/json",
    });
    response.end(
      JSON.stringify({ error: enabled ? "NOT_FOUND" : "MCP_DISABLED" }),
    );
    return;
  }
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    response.writeHead(401, {
      "content-type": "application/json",
      "www-authenticate": `Bearer resource_metadata="${resource}/.well-known/oauth-protected-resource"`,
    });
    response.end(JSON.stringify({ error: "AUTHORIZATION_REQUIRED" }));
    return;
  }
  const sessionId = request.headers["mcp-session-id"];
  let transport =
    typeof sessionId === "string" ? sessions.get(sessionId) : undefined;
  if (!transport) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: randomUUID,
    });
    transport.onclose = () => {
      if (transport?.sessionId) sessions.delete(transport.sessionId);
    };
    const server = createHealthMcpServer();
    await server.connect(transport as Parameters<typeof server.connect>[0]);
    if (transport.sessionId) sessions.set(transport.sessionId, transport);
  }
  await transport.handleRequest(request, response);
});

httpServer.listen(port, host, () => {
  process.stderr.write(
    `MCP_HTTP_READY host=${host} port=${port} enabled=${String(enabled)}\n`,
  );
});

const shutdown = (): void => {
  for (const transport of sessions.values()) void transport.close();
  httpServer.close(() => process.exit(0));
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
