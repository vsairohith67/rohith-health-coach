import { useMemo } from "react";

import { resultEnvelopeSchema } from "@rohith-health/agent-contracts";
import { visualizationIntentSchema, toSafePlot } from "./visualization";

declare global {
  interface Window {
    openai?: { toolOutput?: unknown; theme?: "light" | "dark" };
  }
}

export function HealthWidget({
  toolOutput = window.openai?.toolOutput,
}: {
  toolOutput?: unknown;
}) {
  const parsed = useMemo(
    () => resultEnvelopeSchema.safeParse(toolOutput),
    [toolOutput],
  );
  if (!parsed.success)
    return (
      <main className="widget-state">
        <h1>Health summary unavailable</h1>
        <p>The structured response could not be validated.</p>
      </main>
    );

  const result = parsed.data;
  const sleep = result.metrics
    .filter((item) => item.metric === "sleep_minutes")
    .slice(-14);
  const intent = visualizationIntentSchema.parse({
    schema_version: "1.0",
    visualization: "time_series",
    metric: "sleep_minutes",
    title: "Sleep trend",
    series: sleep.map((item) => ({
      date: item.evidenceId.slice(-10),
      value: item.value,
      partial: item.partial,
    })),
  });
  const plot = toSafePlot(intent);
  const maximum = Math.max(
    ...plot.flatMap((item) => (item.value === null ? [] : [item.value])),
    1,
  );

  return (
    <main className="widget-shell">
      <header>
        <p>Rohith Health Coach</p>
        <h1>{intent.title}</h1>
        <span>
          {result.dateRange.start} – {result.dateRange.end}
        </span>
      </header>
      <section className="status-grid" aria-label="Data status">
        <div>
          <small>Freshness</small>
          <strong>{result.freshness.status}</strong>
        </div>
        <div>
          <small>Completeness</small>
          <strong>{result.completeness.percent}%</strong>
        </div>
        <div>
          <small>Baseline</small>
          <strong>{result.baseline.status}</strong>
        </div>
      </section>
      <section aria-labelledby="chart-title">
        <h2 id="chart-title">Recorded sleep</h2>
        <div
          className="bars"
          role="img"
          aria-label="Sleep minutes by day. Missing days are labelled Missing."
        >
          {plot.map((item) => (
            <div className="bar-column" key={item.label}>
              <span
                className={`bar ${item.partial ? "partial" : ""}`}
                style={{
                  height:
                    item.value === null
                      ? 2
                      : `${Math.max(8, (item.value / maximum) * 100)}%`,
                }}
              />
              <small>{item.value === null ? "Missing" : item.label}</small>
            </div>
          ))}
        </div>
      </section>
      <details>
        <summary>Evidence and limitations</summary>
        <p>{result.evidence.length} evidence references are available.</p>
        <ul>
          {result.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
    </main>
  );
}
