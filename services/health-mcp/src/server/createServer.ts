import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DEMO_PROFILE } from "@rohith-health/domain";
import {
  HealthQueryService,
  InMemoryHealthRepository,
  type AuthorizationContext,
  type HealthScope,
} from "@rohith-health/query";
import {
  executeTool,
  toolDefinitions,
  toolInputShape,
} from "../tools/registry.js";
import { WIDGET_HTML, WIDGET_URI } from "./widgetResource.js";

const allDemoScopes = new Set<HealthScope>([
  "health.freshness.read",
  "health.summary.read",
  "health.sleep.read",
  "health.activity.read",
  "health.heart.read",
  "health.baseline.read",
  "health.coach.read",
  "health.reports.read",
  "health.wellbeing.read",
]);

export interface ServerContextProvider {
  getContext(extra: unknown): Promise<AuthorizationContext>;
}

export const demoContextProvider: ServerContextProvider = {
  async getContext(): Promise<AuthorizationContext> {
    return {
      subject: "demo-user",
      scopes: allDemoScopes,
      expiresAt: Date.now() + 60_000,
      revoked: false,
      timezone: "Asia/Kolkata",
      expandedRange: false,
    };
  },
};

export function createHealthMcpServer(
  contextProvider: ServerContextProvider = demoContextProvider,
): McpServer {
  const repository = new InMemoryHealthRepository(DEMO_PROFILE.days);
  const service = new HealthQueryService(
    repository,
    () => new Date("2026-08-28T12:00:00.000Z"),
  );
  const server = new McpServer(
    { name: "rohith-health-read-only", version: "1.0.0-rc6" },
    {
      instructions:
        "Read-only aggregate health tools. Check freshness, use the smallest range, preserve missing values, cite evidence, avoid diagnosis and medication advice, and return at most three actions.",
    },
  );

  const widgetEnabled = process.env.ENABLE_CHATGPT_WIDGET === "true";
  if (widgetEnabled) {
    server.registerResource(
      "rohith-health-summary-v1",
      WIDGET_URI,
      {
        title: "Rohith Health aggregate summary",
        description: "Private structured aggregate renderer",
        mimeType: "text/html+skybridge",
      },
      async () => ({
        contents: [
          {
            uri: WIDGET_URI,
            mimeType: "text/html+skybridge",
            text: WIDGET_HTML,
            _meta: {
              "openai/widgetCSP": { connect_domains: [], resource_domains: [] },
              "openai/widgetDomain": "https://chatgpt.com",
            },
          },
        ],
      }),
    );
  }

  for (const definition of toolDefinitions) {
    server.registerTool(
      definition.name,
      {
        title: definition.title,
        description: definition.description,
        inputSchema: toolInputShape,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
        ...(widgetEnabled
          ? { _meta: { "openai/outputTemplate": WIDGET_URI } }
          : {}),
      },
      async (input, extra) => {
        const auth = await contextProvider.getContext(extra);
        const result = await executeTool(service, definition, input, auth);
        return {
          structuredContent: result,
          content: [{ type: "text" as const, text: JSON.stringify(result) }],
        };
      },
    );
  }
  return server;
}
