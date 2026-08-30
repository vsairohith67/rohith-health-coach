export function PrivateEmptyState({ title }: Readonly<{ title: string }>) {
  return (
    <>
      <div className="demo-banner" role="status">
        <strong>Private Production</strong>
        <span>No health records are connected.</span>
      </div>
      <header className="section-header">
        <p>Private shell · Asia/Kolkata</p>
        <h1>{title}</h1>
        <span>
          This authenticated account has no health data. Missing information is
          never shown as zero.
        </span>
      </header>
      <section className="integration-status" aria-labelledby="empty-heading">
        <div className="integration-status-heading">
          <div>
            <p className="section-label">Current state</p>
            <h2 id="empty-heading">No data connected</h2>
          </div>
          <span className="status-pill active">Private · empty</span>
        </div>
        <div className="integration-cards">
          <article>
            <span className="status-pill off">Off</span>
            <h3>AI</h3>
            <p>No model or external AI provider is enabled.</p>
          </article>
          <article>
            <span className="status-pill off">Off</span>
            <h3>Phone automation</h3>
            <p>No iPhone Shortcut automation is active.</p>
          </article>
          <article>
            <span className="status-pill off">Off</span>
            <h3>Garmin cloud</h3>
            <p>No Garmin cloud API is connected.</p>
          </article>
        </div>
      </section>
    </>
  );
}
