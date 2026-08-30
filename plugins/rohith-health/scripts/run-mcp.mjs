import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";

const configuredRoot = process.env.ROHITH_HEALTH_REPO;
const candidateRoots = [
  configuredRoot,
  resolve(import.meta.dirname, "../../.."),
].filter(Boolean);
const repositoryRoot = candidateRoots.find((candidate) =>
  existsSync(resolve(candidate, "services/health-mcp/src/transports/stdio.ts")),
);

if (!repositoryRoot) {
  process.stderr.write(
    "Rohith Health Coach source was not found. Set ROHITH_HEALTH_REPO to the extracted application directory.\n",
  );
  process.exit(78);
}

const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const child = spawn(
  executable,
  ["exec", "tsx", "services/health-mcp/src/transports/stdio.ts"],
  {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      ENABLE_HEALTH_MCP: process.env.ENABLE_HEALTH_MCP ?? "true",
    },
    stdio: "inherit",
    shell: false,
  },
);
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
