import type { DailyMetric } from "@rohith-health/domain";
import { median } from "@rohith-health/analytics";

export function SleepChart({
  days,
}: Readonly<{ days: readonly DailyMetric[] }>) {
  const values = days.flatMap((day) =>
    day.sleepMinutes === null ? [] : [day.sleepMinutes],
  );
  const rollingMedian = median(values);
  return (
    <section className="chart-panel" aria-labelledby="sleep-chart-title">
      <div className="panel-heading">
        <div>
          <h2 id="sleep-chart-title">Sleep duration — last 14 days</h2>
          <p className="chart-legend">
            <span className="legend-swatch teal" /> Sleep duration{" "}
            <span className="legend-line" /> 14-day rolling median{" "}
            <span className="legend-swatch missing" /> No data
          </p>
        </div>
        <div className="panel-actions">
          <button type="button">14 days⌄</button>
          <a href="#sleep-table">Table view</a>
        </div>
      </div>
      <div
        className="bar-chart"
        role="img"
        aria-label={`Sleep duration across 14 synthetic days. ${days.filter((day) => day.sleepMinutes === null).length} days are missing. Rolling median ${rollingMedian === null ? "unavailable" : `${Math.round(rollingMedian / 60)} hours ${Math.round(rollingMedian % 60)} minutes`}.`}
      >
        <span className="axis-label">Hours</span>
        <span
          className="median-line"
          style={{
            bottom: `${rollingMedian === null ? 0 : Math.min(82, Math.max(18, (rollingMedian / 600) * 100))}%`,
          }}
        />
        {days.map((day) => (
          <div className="bar-column" key={day.localDate}>
            <div
              className={
                day.sleepMinutes === null
                  ? "bar missing-bar"
                  : day.dayCompletionStatus === "partial"
                    ? "bar partial-bar"
                    : "bar"
              }
              style={{
                height: `${day.sleepMinutes === null ? 24 : Math.min(92, Math.max(18, (day.sleepMinutes / 600) * 100))}%`,
              }}
              title={`${day.localDate}: ${day.sleepMinutes === null ? "No data" : `${day.sleepMinutes} minutes`}`}
            />
            <span>{day.localDate.slice(8)}</span>
          </div>
        ))}
      </div>
      <p className="chart-note">
        ⓘ Missing data remains a gap. Rolling median uses available complete
        days.
      </p>
      <details id="sleep-table" className="data-table-disclosure">
        <summary>Accessible sleep data table</summary>
        <table>
          <caption>Last 14 days of synthetic sleep data</caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.localDate}>
                <td>{day.localDate}</td>
                <td>
                  {day.sleepMinutes === null
                    ? "Missing"
                    : `${day.sleepMinutes} min`}
                </td>
                <td>{day.dayCompletionStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
