"use client";

import { useState } from "react";
import { DEMO_PROFILE } from "@rohith-health/domain";
import { summarizeMetric } from "@rohith-health/analytics";
import { generateCoachFindings } from "@rohith-health/coach";
import { DemoBanner } from "./demo-banner";
import { Icon } from "./icons";

const suggestions = [
  "How did I sleep this week?",
  "Compare this week with last week.",
  "What should I prioritize today?",
  "Which days have missing data?",
  "How consistent was my sleep this month?",
  "Why is the baseline still provisional?",
];

export function AskExperience() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const recent = DEMO_PROFILE.days.slice(-14);
  const sleep = summarizeMetric(DEMO_PROFILE.days, "sleep_minutes");
  const findings = generateCoachFindings(DEMO_PROFILE.days);
  const missing = recent
    .filter((day) => day.sleepMinutes === null)
    .map((day) => day.localDate.slice(8));
  const submit = (value: string): void => {
    setQuestion(value);
    setSubmitted(true);
  };
  return (
    <>
      <DemoBanner />
      <section className="ask-header">
        <p className="ask-date">Friday, 28 August</p>
        <h1>Ask my data</h1>
        <div className="provider-line">
          <span>
            <Icon name="shield" width="17" /> Deterministic only
          </span>
          <span>▣ Nothing leaves this device</span>
          <span>◷ Updated 18 min ago</span>
        </div>
      </section>
      <section className="ask-layout">
        <div className="ask-main">
          <h2>Try asking</h2>
          <div className="suggestion-grid">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submit(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <form
            className="ask-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (question.trim()) setSubmitted(true);
            }}
          >
            <label className="sr-only" htmlFor="health-question">
              Ask about aggregate health data
            </label>
            <input
              id="health-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about your aggregate health data"
              maxLength={240}
            />
            <button type="submit" aria-label="Ask question">
              →
            </button>
          </form>
          <section
            className={submitted ? "answer-panel visible" : "answer-panel"}
            aria-live="polite"
          >
            <p className="answer-label">Answer</p>
            <h2>
              {submitted && /missing/i.test(question)
                ? "Missing sleep data in the last 14 days"
                : "Sleep this week (22–28 Aug)"}
            </h2>
            <div className="answer-meta">
              <span>
                Provider: <strong>Deterministic only</strong>
              </span>
              <span>
                Range: <strong>15–28 Aug 2026</strong>
              </span>
              <span>
                Freshness: <strong>updated 18 min ago</strong>
              </span>
              <span>
                Baseline:{" "}
                <strong>
                  {sleep.maturity} · {sleep.validDays} valid days
                </strong>
              </span>
              <span>
                Data completeness: <strong>{sleep.completeness}%</strong>
              </span>
            </div>
            <p>
              {submitted && /missing/i.test(question)
                ? `Synthetic sleep data is missing on day ${missing.join(" and day ") || "none"}. Missing values were not converted to zero.`
                : (findings[0]?.observation ??
                  "There is not enough data for a stronger conclusion.")}
            </p>
            <table>
              <caption>Aggregate sleep comparison</caption>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>This period</th>
                  <th>28-day baseline</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Median sleep</td>
                  <td>
                    {sleep.current === null
                      ? "Missing"
                      : `${Math.round(sleep.current)} min`}
                  </td>
                  <td>
                    {sleep.median28 === null
                      ? "Unavailable"
                      : `${Math.round(sleep.median28)} min`}
                  </td>
                  <td>
                    {sleep.difference === null
                      ? "Unavailable"
                      : `${Math.round(sleep.difference)} min`}
                  </td>
                </tr>
                <tr>
                  <td>Valid nights</td>
                  <td>
                    {recent.filter((day) => day.sleepMinutes !== null).length}
                  </td>
                  <td>{sleep.validDays}</td>
                  <td>Informational</td>
                </tr>
              </tbody>
            </table>
            <div className="answer-footer">
              <div>
                <strong>Evidence</strong>
                <p>ev:sleep_minutes:2026-08-28 · 12 valid synthetic nights</p>
              </div>
              <a href="/data-sources">View source data</a>
            </div>
            <details className="calculation-panel">
              <summary>Explain this calculation</summary>
              <p>
                The deterministic engine uses valid aggregate sleep days only,
                preserves missing days as missing, and compares the selected
                period with the documented 28-day median.
              </p>
              <a href="/methodology">Read the full methodology</a>
            </details>
            <p className="limitation">
              <strong>Limitation</strong>
              <br />
              Wearable-derived trends are informational and do not identify a
              medical cause.
            </p>
          </section>
        </div>
        <aside className="privacy-preview">
          <h2>What this mode can use</h2>
          <ul>
            <li>Daily aggregates</li>
            <li>Baseline status</li>
            <li>Deterministic findings</li>
            <li>Freshness and completeness</li>
          </ul>
          <h3>Always excluded</h3>
          <ul>
            <li>Raw heart samples</li>
            <li>GPS and FIT files</li>
            <li>Private notes</li>
            <li>Medication data</li>
          </ul>
          <a href="/settings/ai">Review provider controls →</a>
        </aside>
      </section>
    </>
  );
}
