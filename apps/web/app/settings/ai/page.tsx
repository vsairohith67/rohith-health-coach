import { AppShell } from "../../../components/app-shell";
import { DemoBanner } from "../../../components/demo-banner";
import { isDemoMode } from "../../../lib/runtime-mode";

export default function AiSettingsPage() {
  const demoMode = isDemoMode();
  return (
    <AppShell privateMode={!demoMode}>
      {demoMode ? <DemoBanner /> : null}
      <header className="section-header">
        <p>Privacy and integrations</p>
        <h1>AI providers</h1>
        <span>Every provider is independently default-off and reversible.</span>
      </header>
      <section
        className="integration-status"
        aria-labelledby="integration-heading"
      >
        <div className="integration-status-heading">
          <div>
            <p className="section-label">Current state</p>
            <h2 id="integration-heading">Deterministic by default</h2>
          </div>
          <span className="status-pill active">Active · no model</span>
        </div>
        <div className="integration-cards">
          <article>
            <span className="status-pill off">Off</span>
            <h3>Local LLM</h3>
            <p>
              No endpoint or model is connected. Deterministic answers remain
              available.
            </p>
          </article>
          <article>
            <span className="status-pill off">Off</span>
            <h3>Codex MCP</h3>
            <p>No Codex MCP connection is enabled.</p>
          </article>
          <article>
            <span className="status-pill off">Off</span>
            <h3>ChatGPT private app</h3>
            <p>No ChatGPT app connection is enabled.</p>
          </article>
          <article>
            <span className="status-pill off">Off</span>
            <h3>External AI</h3>
            <p>
              No API key, consent, billing, or aggregate-data transfer is
              active.
            </p>
          </article>
        </div>
      </section>
      <section className="settings-matrix">
        <table>
          <thead>
            <tr>
              <th>Mode</th>
              <th>Transfer</th>
              <th>Default</th>
              <th>Available data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Deterministic only</td>
              <td>None</td>
              <td>On</td>
              <td>Canonical local aggregates</td>
            </tr>
            <tr>
              <td>Local LLM</td>
              <td>Configured local endpoint</td>
              <td>Off</td>
              <td>Approved aggregate tool results</td>
            </tr>
            <tr>
              <td>ChatGPT private app</td>
              <td>Selected aggregate tool output enters the conversation</td>
              <td>Off</td>
              <td>Scoped read-only results</td>
            </tr>
            <tr>
              <td>Codex MCP</td>
              <td>Selected aggregate tool output enters the Codex task</td>
              <td>Off</td>
              <td>Scoped read-only results</td>
            </tr>
            <tr>
              <td>External provider</td>
              <td>Configured provider</td>
              <td>Off</td>
              <td>Consent required</td>
            </tr>
          </tbody>
        </table>
        <div className="share-preview">
          <h2>What will be shared?</h2>
          <p>
            Daily aggregates, baseline status, deterministic findings, source
            freshness, completeness, and goals only after explicit consent.
          </p>
          <strong>Always denied:</strong>
          <p>
            Raw heart samples, FIT data, GPS, location, notes, medical records,
            medication, symptoms, emergency reports, identifiers, and tokens.
          </p>
          <button type="button" disabled>
            External providers disabled
          </button>
          <p className="consent-state">
            <strong>Consent state: not granted.</strong> Enabling a provider
            requires a separate review of scope, destination, retention, and a
            visible revoke control.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
