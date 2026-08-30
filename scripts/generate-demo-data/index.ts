import { writeFile } from "node:fs/promises";
import { generateDemoProfile } from "@rohith-health/domain";

const output = process.argv[2];
const payload = JSON.stringify(generateDemoProfile({ days: 90 }), null, 2);
if (output) {
  await writeFile(output, payload, "utf8");
  process.stdout.write(
    `Wrote deterministic synthetic demo data to ${output}\n`,
  );
} else {
  process.stdout.write(`${payload}\n`);
}
