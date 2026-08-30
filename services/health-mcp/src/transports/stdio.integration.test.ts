import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

describe("MCP stdio process", () => {
  let client: Client | undefined;
  afterEach(async () => client?.close());

  it("starts through the real launcher and completes initialize/list", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [
        resolve("node_modules/tsx/dist/cli.mjs"),
        "services/health-mcp/src/transports/stdio.ts",
      ],
      cwd: process.cwd(),
      env: {
        ...getDefaultEnvironment(),
        ENABLE_HEALTH_MCP: "true",
        NODE_ENV: "test",
      },
      stderr: "pipe",
      maxBufferSize: 2_000_000,
    });
    client = new Client({ name: "stdio-synthetic-test", version: "1.0.0" });
    await client.connect(transport);
    expect((await client.listTools()).tools).toHaveLength(17);
  }, 15_000);
});
