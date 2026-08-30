import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@rohith-health/domain": resolve("packages/health-domain/src/index.ts"),
      "@rohith-health/contracts": resolve(
        "packages/health-contracts/src/index.ts",
      ),
      "@rohith-health/analytics": resolve("packages/analytics/src/index.ts"),
      "@rohith-health/coach": resolve("packages/coach-engine/src/index.ts"),
      "@rohith-health/agent-contracts": resolve(
        "packages/health-agent-contracts/src/index.ts",
      ),
      "@rohith-health/query": resolve(
        "packages/health-query-service/src/index.ts",
      ),
      "@rohith-health/ai-safety": resolve("packages/ai-safety/src/index.ts"),
      "@rohith-health/ai-gateway": resolve(
        "services/health-ai-gateway/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["{packages,services,apps}/**/*.test.ts"],
    reporters: ["default", "json"],
    outputFile: { json: "test-results/vitest-results.json" },
    coverage: { enabled: false },
  },
});
