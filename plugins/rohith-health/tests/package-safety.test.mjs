import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const skill = await readFile(
  resolve(import.meta.dirname, "../skills/rohith-health/SKILL.md"),
  "utf8",
);
const forbidden = [
  /@/,
  /\b(?:gps|secret|bearer|service[_ -]?role|api[_ -]?key)\b/i,
  /\b\d{3}-\d{2}-\d{4}\b/,
];
for (const pattern of forbidden)
  assert.equal(pattern.test(skill), false, `packaged skill matched ${pattern}`);
assert.equal(skill.includes("Demo data"), false);
