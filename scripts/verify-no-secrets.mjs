import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import process from "node:process";

const root = resolve(process.argv[2] ?? process.cwd());
const excludedSegments = new Set([
  ".git",
  ".next",
  ".venv",
  ".pytest_cache",
  ".ruff_cache",
  ".temp",
  ".branches",
  "node_modules",
  "playwright-report",
  "release",
  "test-results",
]);
const binaryExtensions = new Set([
  ".fit",
  ".gif",
  ".gguf",
  ".ico",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".webp",
  ".zip",
]);
const forbiddenNames = [/^\.env(?!\.example$)/i, /\.(?:key|p12|pfx|pem)$/i];
const signatures = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["OpenAI-style secret", /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/],
  ["Supabase secret key", /\bsb_secret_[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token", /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/],
  ["Hugging Face token", /\bhf_[A-Za-z0-9]{24,}\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{16,}\b/],
];

const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excludedSegments.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else if (entry.isFile()) files.push(absolute);
  }
}

await walk(root);
const findings = [];
let scanned = 0;
for (const file of files) {
  const name = file.split(sep).at(-1) ?? "";
  const rel = relative(root, file).replaceAll("\\", "/");
  if (forbiddenNames.some((pattern) => pattern.test(name))) {
    findings.push(`${rel}: forbidden credential filename`);
    continue;
  }
  if (binaryExtensions.has(extname(name).toLowerCase())) continue;
  const body = await readFile(file, "utf8");
  scanned += 1;
  for (const [label, pattern] of signatures) {
    if (pattern.test(body)) findings.push(`${rel}: ${label}`);
  }
}

if (findings.length) {
  process.stderr.write(
    `Secret scan failed (${findings.length} finding(s)):\n${findings.join("\n")}\n`,
  );
  process.exit(1);
}
process.stdout.write(
  `Secret scan passed: ${scanned} text files, no credential signatures.\n`,
);
