import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { evalCases } from "../packages/agent-evals/cases/cases";
import { gradeEvalCase } from "../packages/agent-evals/graders/policy";

const outcomes = evalCases.map(gradeEvalCase);
const byCategory = Object.fromEntries(
  [...new Set(evalCases.map((testCase) => testCase.category))].map(
    (category) => {
      const rows = outcomes.filter(
        (_, index) => evalCases[index]?.category === category,
      );
      return [
        category,
        {
          total: rows.length,
          passed: rows.filter((item) => item.passed).length,
        },
      ];
    },
  ),
);
const report = {
  schema_version: "1.0",
  generated_at: new Date().toISOString(),
  fixed_seed: "rohith-health-agent-evals-v1",
  data_classification: "synthetic_only",
  hosted_evaluation_used: false,
  total: outcomes.length,
  passed: outcomes.filter((item) => item.passed).length,
  critical_total: outcomes.filter((item) => item.critical).length,
  critical_passed: outcomes.filter((item) => item.critical && item.passed)
    .length,
  general_score:
    outcomes.filter((item) => item.passed).length / outcomes.length,
  categories: byCategory,
  failures: outcomes.filter((item) => !item.passed),
};
await mkdir(resolve("packages/agent-evals/reports"), { recursive: true });
await writeFile(
  resolve("eval-results.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);
await writeFile(
  resolve("packages/agent-evals/reports/eval-results.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);
