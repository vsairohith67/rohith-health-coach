import Link from "next/link";
import { DEMO_PROFILE } from "@rohith-health/domain";
import { summarizeMetric, listMissingDates } from "@rohith-health/analytics";
import { generateCoachFindings } from "@rohith-health/coach";
import { DemoBanner } from "./demo-banner";
import { SleepChart } from "./sleep-chart";

type SectionConfig = {
  title: string;
  intro: string;
  primary: string;
  secondary: string;
  methodology: string;
};
const sections: Record<string, SectionConfig> = {
  trends: {
    title: "Trends",
    intro:
      "Compare transparent aggregates while keeping gaps and partial days visible.",
    primary: "28-day view",
    secondary: "Personal baseline",
    methodology: "Rolling medians use only available valid days.",
  },
  sleep: {
    title: "Sleep",
    intro: "Review duration and timing without a fabricated sleep score.",
    primary: "Last night",
    secondary: "Timing consistency",
    methodology:
      "Sleep crossing midnight is assigned to the documented wake date.",
  },
  heart: {
    title: "Heart",
    intro: "See available daily summaries without clinical interpretation.",
    primary: "Resting heart trend",
    secondary: "Source coverage",
    methodology:
      "No arrhythmia, ECG, or medical-normality inference is performed.",
  },
  activity: {
    title: "Activity",
    intro: "Review steps, movement, and imported activity aggregates.",
    primary: "Daily movement",
    secondary: "Workout timeline",
    methodology: "GPS stays hidden and external map tiles are off by default.",
  },
  wellbeing: {
    title: "Wellbeing",
    intro:
      "Optional ratings help explore patterns without turning a missed check-in into zero.",
    primary: "Quick check-in",
    secondary: "Check-in completeness",
    methodology:
      "Private notes are excluded from AI and tool outputs by default.",
  },
  coach: {
    title: "Coach",
    intro:
      "Deterministic findings connect every observation to evidence and confidence.",
    primary: "Morning brief",
    secondary: "Up to three actions",
    methodology:
      "The coach is informational, non-diagnostic, and medication-free.",
  },
  experiments: {
    title: "Experiments",
    intro:
      "Improve one behaviour at a time with transparent before-and-after comparisons.",
    primary: "Primary experiment",
    secondary: "Maintenance habits",
    methodology:
      "Results are correlations with confounders, not proof of causation.",
  },
  reports: {
    title: "Reports",
    intro: "Generate private, source-labelled daily and weekly summaries.",
    primary: "Weekly review",
    secondary: "Private export",
    methodology: "Exports are authenticated, expiring, and never public.",
  },
  "data-sources": {
    title: "Data sources",
    intro: "Check freshness, device-scoped access, and source limitations.",
    primary: "Apple Shortcut",
    secondary: "Garmin FIT import",
    methodology: "FIT is a file format, not Garmin Connect account access.",
  },
  imports: {
    title: "Imports",
    intro:
      "Review synthetic import status, duplicates, conflicts, and safe retry.",
    primary: "Import history",
    secondary: "Conflict review",
    methodology:
      "Raw FIT files are private and deleted after parsing by default.",
  },
  settings: {
    title: "Settings",
    intro:
      "Control timezone, privacy, retention, accessibility, and integrations.",
    primary: "Privacy defaults",
    secondary: "Theme and motion",
    methodology:
      "Every AI and MCP integration is off until explicitly enabled.",
  },
  privacy: {
    title: "Privacy",
    intro:
      "Health data stays private, user-scoped, and under reversible controls.",
    primary: "Deterministic mode",
    secondary: "Data sharing preview",
    methodology:
      "No advertising, social tracking, or third-party analytics are enabled.",
  },
  methodology: {
    title: "Methodology",
    intro:
      "Understand every calculation, data gap, confidence label, and limitation.",
    primary: "Deterministic authority",
    secondary: "Evidence references",
    methodology:
      "Missing values remain null and unsupported metrics remain unavailable.",
  },
  "data-dictionary": {
    title: "Data dictionary",
    intro: "Browse supported metrics, units, sources, and explicit exclusions.",
    primary: "Supported aggregates",
    secondary: "Unavailable metrics",
    methodology:
      "Garmin Body Battery, Stress, Training Readiness, and Pulse Ox are not inferred.",
  },
  onboarding: {
    title: "Welcome",
    intro:
      "Choose privacy-safe defaults before connecting any personal source.",
    primary: "Timezone · Asia/Kolkata",
    secondary: "AI consent · not requested",
    methodology:
      "A device token is shown once, scoped, hashed, rotatable, and revocable.",
  },
};

export function ProductSection({ section }: Readonly<{ section: string }>) {
  const config = sections[section];
  if (!config) return null;
  const sleep = summarizeMetric(DEMO_PROFILE.days, "sleep_minutes");
  const steps = summarizeMetric(DEMO_PROFILE.days, "steps");
  const findings = generateCoachFindings(DEMO_PROFILE.days);
  return (
    <>
      <DemoBanner />
      <header className="section-header">
        <p>Friday, 28 August · Asia/Kolkata</p>
        <h1>{config.title}</h1>
        <span>{config.intro}</span>
      </header>
      <div className="section-grid">
        <section className="section-feature">
          <p className="section-label">{config.primary}</p>
          <strong>
            {section === "heart"
              ? `${Math.round(summarizeMetric(DEMO_PROFILE.days, "resting_heart_rate").median28 ?? 0)} bpm`
              : section === "activity"
                ? `${Math.round(steps.median28 ?? 0).toLocaleString("en-IN")} median steps`
                : section === "data-dictionary"
                  ? "8 supported aggregate metrics"
                  : `${Math.round(sleep.median28 ?? 0)} min median sleep`}
          </strong>
          <p>{config.methodology}</p>
          <Link href="/methodology">How this was calculated →</Link>
        </section>
        <section className="section-feature">
          <p className="section-label">{config.secondary}</p>
          <strong>
            {sleep.maturity} · {sleep.validDays} valid days
          </strong>
          <p>
            Freshness, completeness, source, confidence, and limitations stay
            visible.
          </p>
          <Link href="/data-sources">Review source coverage →</Link>
        </section>
        <section className="section-list">
          <h2>Current deterministic findings</h2>
          {findings.slice(0, 3).map((finding) => (
            <article key={finding.id}>
              <h3>{finding.headline}</h3>
              <p>{finding.observation}</p>
              <small>
                {finding.confidence} confidence · {finding.evidenceIds.length}{" "}
                evidence reference(s)
              </small>
            </article>
          ))}
        </section>
      </div>
      {section === "sleep" || section === "trends" ? (
        <SleepChart days={DEMO_PROFILE.days.slice(-14)} />
      ) : null}
      {section === "data-sources" || section === "imports" ? (
        <section className="status-table">
          <h2>Source status</h2>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Status</th>
                <th>Scope</th>
                <th>Freshness</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Apple Health contract</td>
                <td>Demo only</td>
                <td>Aggregates</td>
                <td>18 min ago</td>
              </tr>
              <tr>
                <td>Garmin FIT</td>
                <td>Parser adapter ready</td>
                <td>Private file</td>
                <td>Not connected</td>
              </tr>
              <tr>
                <td>Garmin cloud API</td>
                <td>Disabled</td>
                <td>Unavailable</td>
                <td>Approval required</td>
              </tr>
            </tbody>
          </table>
        </section>
      ) : null}
      {section === "data-dictionary" ? (
        <section className="status-table">
          <h2>Missing data example</h2>
          <p>
            {
              listMissingDates(DEMO_PROFILE.days.slice(-28), "sleep_minutes")
                .length
            }{" "}
            synthetic dates are explicitly missing in the last 28 days. They are
            never displayed as zero.
          </p>
        </section>
      ) : null}
    </>
  );
}

export const productSectionNames = Object.keys(sections);
