/**
 * Standard page opening: what this screen is, one line of live context, and
 * the actions that belong to it. The summary line carries real numbers rather
 * than a description — an operator already knows what "Drivers" means.
 */
const PageHeader = ({ title, summary, actions, className = "" }) => (
  <div
    className={`flex flex-wrap items-start justify-between gap-3 ${className}`}
  >
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {summary && (
        <p className="mt-0.5 text-caption text-ink-muted">{summary}</p>
      )}
    </div>
    {actions && (
      <div className="flex items-center gap-2 shrink-0">{actions}</div>
    )}
  </div>
);

export default PageHeader;
