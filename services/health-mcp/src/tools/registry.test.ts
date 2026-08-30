import { describe, expect, it } from "vitest";

import { operationCompletenessCheck, toolDefinitions } from "./registry";

describe("MCP tool registry", () => {
  it("publishes exactly seventeen narrow read-only tools", () => {
    expect(operationCompletenessCheck()).toBe(true);
    expect(toolDefinitions).toHaveLength(17);
    expect(new Set(toolDefinitions.map((tool) => tool.name)).size).toBe(17);
    expect(
      toolDefinitions.every(
        (tool) =>
          tool.name.startsWith("health_get_") ||
          tool.name.startsWith("health_compare_") ||
          tool.name.startsWith("health_list_") ||
          tool.name.startsWith("health_explain_"),
      ),
    ).toBe(true);
  });

  it("has no SQL, raw, write, token, GPS or user-id surface", () => {
    const serialized = JSON.stringify(toolDefinitions).toLowerCase();
    for (const blocked of [
      "execute_sql",
      "raw_fit",
      "location_history",
      "create_token",
      "update_health",
      "delete_health",
      "user_id",
    ]) {
      expect(serialized).not.toContain(blocked);
    }
  });
});
