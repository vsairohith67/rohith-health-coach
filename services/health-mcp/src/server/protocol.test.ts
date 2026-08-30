import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it } from "vitest";

import { createHealthMcpServer } from "./createServer";

describe("MCP protocol integration", () => {
  const closeables: Array<{ close(): Promise<void> }> = [];
  afterEach(async () => {
    await Promise.allSettled(closeables.splice(0).map((item) => item.close()));
  });

  it("initializes, lists exactly 17 narrow tools, and calls a structured tool", async () => {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const server = createHealthMcpServer();
    const client = new Client({
      name: "synthetic-test-client",
      version: "1.0.0",
    });
    closeables.push(client, server);
    await server.connect(
      serverTransport as Parameters<typeof server.connect>[0],
    );
    await client.connect(
      clientTransport as Parameters<typeof client.connect>[0],
    );

    expect(client.getServerVersion()).toMatchObject({
      name: "rohith-health-read-only",
      version: "1.0.0-rc4",
    });
    const listed = await client.listTools();
    expect(listed.tools).toHaveLength(17);
    expect(
      listed.tools.every((tool) => tool.annotations?.readOnlyHint === true),
    ).toBe(true);
    expect(
      listed.tools.every((tool) => tool.annotations?.destructiveHint === false),
    ).toBe(true);

    const result = await client.callTool({
      name: "health_get_today_summary",
      arguments: {},
    });
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({
      schemaVersion: "1.0",
      userTimezone: "Asia/Kolkata",
    });
  });
});
