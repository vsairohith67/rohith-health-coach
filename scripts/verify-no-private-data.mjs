import { readFile, readdir } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import process from "node:process";

const root = resolve(process.argv[2] ?? process.cwd());
const excludedSegments = new Set([
  ".git",
  ".next",
  ".venv",
  ".pytest_cache",
  ".ruff_cache",
  ".supabase",
  ".temp",
  ".turbo",
  "node_modules",
  "playwright-report",
  "release",
  "test-results",
]);
const rawHealthExtensions = new Set([".csv", ".fit", ".gpx", ".heic", ".tcx"]);
const knownSyntheticImages = new Set([
  "docs/design/concept-desktop.png",
  "docs/design/concept-mobile.png",
  "docs/screenshots/ask-desktop.png",
  "docs/screenshots/ask-mobile.png",
  "docs/screenshots/today-desktop.png",
  "docs/screenshots/today-mobile.png",
]);
const imageExtensions = new Set([".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const structuredDataName =
  /(?:apple[-_ ]?health|garmin|health[-_ ]?(?:data|export|sample)|raw[-_ ]?(?:data|sample)|sleep[-_ ]?export|activity[-_ ]?export)/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedSegments.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else if (entry.isFile()) files.push(absolute);
  }
}

await walk(root);
const findings = [];
let scannedTextFiles = 0;
for (const file of files) {
  const rel = relative(root, file).replaceAll("\\", "/");
  const extension = extname(file).toLowerCase();

  if (rawHealthExtensions.has(extension)) {
    findings.push(`${rel}: raw-health-capable file type is forbidden`);
    continue;
  }
  if (imageExtensions.has(extension)) {
    if (!knownSyntheticImages.has(rel)) {
      findings.push(
        `${rel}: image is outside the reviewed synthetic allowlist`,
      );
    }
    continue;
  }
  if (extension === ".zip" || extension === ".ico" || extension === ".pdf") {
    continue;
  }
  if (extension === ".json" && structuredDataName.test(basename(file))) {
    findings.push(`${rel}: possible structured health-data artifact`);
  }

  let body;
  try {
    body = await readFile(file, "utf8");
  } catch {
    continue;
  }
  scannedTextFiles += 1;
  for (const email of body.match(emailPattern) ?? []) {
    if (!email.toLowerCase().endsWith("@example.invalid")) {
      findings.push(`${rel}: non-synthetic email address`);
      break;
    }
  }
}

if (findings.length) {
  process.stderr.write(
    `Private-data scan failed (${findings.length} finding(s)):\n${findings.join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `Private-data scan passed: ${scannedTextFiles} text files; no non-synthetic email, raw health file, or unreviewed image artifact.\n`,
);
