import { DEMO_PROFILE } from "@rohith-health/domain";
import { summarizeMetric } from "@rohith-health/analytics";
import { generateCoachFindings } from "@rohith-health/coach";
import { DemoBanner } from "./demo-banner";
import { Icon } from "./icons";
import { SleepChart } from "./sleep-chart";

export function TodayDashboard() {
  const days = DEMO_PROFILE.days;
  const recent = days.slice(-14);
  const current = days.at(-1);
  const sleep = summarizeMetric(days, "sleep_minutes");
  const steps = summarizeMetric(days, "steps");
  const findings = generateCoachFindings(days);
  const actionCount = findings.filter((finding) => finding.action).length;
  if (!current) return null;
  return (
    <>
      <DemoBanner />
      <div className="utility-row">
        <span>
          <span className="status-dot" /> Deterministic only
        </span>
        <span>◷ Updated 18 min ago</span>
        <span>◐ System⌄</span>
      </div>
      <div className="date-control">
        <button type="button" aria-label="Previous day">
          ‹
        </button>
        <strong>Friday, 28 August</strong>
        <button type="button" aria-label="Next day">
          ›
        </button>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <section className="today-intro">
            <h1>A steadier day starts with a lighter plan.</h1>
            <p>
              Your synthetic sleep was close to its recent pattern and today’s
              activity is still partial.
              <br />
              Focus on consistency over intensity.
            </p>
          </section>
          <section className="metric-rail" aria-label="Today summary">
            <Metric
              icon="moon"
              title="Last night"
              value={
                sleep.current === null
                  ? "Missing"
                  : `${Math.floor(sleep.current / 60)}h ${String(Math.round(sleep.current % 60)).padStart(2, "0")}m`
              }
              detail={
                sleep.difference === null
                  ? "Baseline unavailable"
                  : `${Math.abs(Math.round(sleep.difference))} min ${sleep.difference < 0 ? "below" : "above"} 28-day median`
              }
              link="/sleep"
            />
            <Metric
              icon="walk"
              title="Today’s movement"
              value={
                steps.current === null
                  ? "Missing"
                  : `${steps.current.toLocaleString("en-IN")} steps`
              }
              detail={
                current.dayCompletionStatus === "partial"
                  ? "Partial day · totals may change"
                  : "Complete day"
              }
              link="/activity"
            />
            <Metric
              icon="target"
              title="What to prioritize"
              value={`${actionCount} ${actionCount === 1 ? "action" : "actions"}`}
              detail="Small steps, steady progress"
              link="/coach"
            />
          </section>
          <SleepChart days={recent} />
        </div>
        <aside className="evidence-rail" aria-label="Baseline and evidence">
          <section className="side-panel baseline-panel">
            <div className="side-panel-title">
              <h2>Baseline</h2>
              <span aria-hidden="true">⌁</span>
            </div>
            <p>
              <strong>
                {sleep.maturity === "mature" ? "Mature" : sleep.maturity}
              </strong>{" "}
              · {sleep.validDays} valid days
            </p>
            <small>
              Your baseline is{" "}
              {sleep.maturity === "mature" ? "stable" : "still developing"}.
              Keep logging to strengthen reliability.
            </small>
            <a href="/methodology">About baseline maturity →</a>
          </section>
          <section className="side-panel evidence-panel">
            <div className="side-panel-title">
              <h2>Evidence (deterministic)</h2>
              <button type="button">Show details⌄</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Last data</th>
                </tr>
              </thead>
              <tbody>
                <EvidenceRow
                  source="Wearable (demo)"
                  detail="Synthetic source"
                  time="28 Aug, 07:12"
                />
                <EvidenceRow
                  source="Health (demo)"
                  detail="Apple Health contract"
                  time="28 Aug, 07:05"
                />
                <EvidenceRow
                  source="Activity (demo)"
                  detail="Pedometer aggregate"
                  time="28 Aug, 06:58"
                />
              </tbody>
            </table>
            <p className="timezone-note">All times shown in Asia/Kolkata</p>
            <a href="/methodology">How evidence works →</a>
          </section>
          <section className="side-panel completeness-panel">
            <h2>
              Data completeness <small>(last 14 days)</small>
            </h2>
            <div
              className="completeness-strip"
              role="img"
              aria-label="11 complete days, 2 missing days, 1 partial day"
            >
              {recent.map((day) => (
                <span key={day.localDate} className={day.dayCompletionStatus} />
              ))}
            </div>
            <div className="legend-row">
              <span>
                <i className="complete" /> Complete
              </span>
              <span>
                <i className="missing" /> Missing
              </span>
              <span>
                <i className="partial" /> Partial
              </span>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function Metric({
  icon,
  title,
  value,
  detail,
  link,
}: Readonly<{
  icon: "moon" | "walk" | "target";
  title: string;
  value: string;
  detail: string;
  link: string;
}>) {
  return (
    <article className="metric-item">
      <div className={`metric-icon ${icon}`}>
        <Icon name={icon} width="24" />
      </div>
      <div>
        <h2>{title}</h2>
        <strong>{value}</strong>
        <p>{detail}</p>
        <a href={link}>See details →</a>
      </div>
    </article>
  );
}

function EvidenceRow({
  source,
  detail,
  time,
}: Readonly<{ source: string; detail: string; time: string }>) {
  return (
    <tr>
      <td>
        <span className="source-icon">
          <Icon name="evidence" width="17" />
        </span>
        <span>
          <strong>{source}</strong>
          <small>{detail}</small>
        </span>
      </td>
      <td>
        {time}
        <span className="verified" aria-label="Verified">
          ✓
        </span>
      </td>
    </tr>
  );
}
