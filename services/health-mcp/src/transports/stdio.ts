import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createHealthMcpServer } from "../server/createServer.js";

if (
  process.env.ENABLE_HEALTH_MCP !== "true" &&
  process.env.NODE_ENV === "production"
) {
  process.stderr.write("HEALTH_MCP_DISABLED\n");
  process.exit(78);
}

const server = createHealthMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);

const shutdown = async (): Promise<void> => {
  await server.close();
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
