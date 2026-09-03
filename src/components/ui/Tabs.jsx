/**
 * Underlined tab bar. The active tab is marked by a 2px brand rail plus a
 * weight change, so the current view is never signalled by color alone.
 *
 * tabs: [{ value, label, icon?, count? }]
 */
const Tabs = ({ tabs = [], value, onChange, className = "" }) => (
  <div
    role="tablist"
    className={`flex items-center gap-1 border-b border-line ${className}`}
  >
    {tabs.map((tab) => {
      const active = tab.value === value;
      const Icon = tab.icon;

      return (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={active}
          onClick={() => onChange?.(tab.value)}
          className={`relative flex items-center gap-2 h-9 px-3 -mb-px border-b-2 text-sm transition-colors ${
            active
              ? "border-interactive text-ink font-medium"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          {Icon && (
            <Icon
              className={`w-4 h-4 ${active ? "text-interactive" : "text-ink-faint"}`}
              aria-hidden="true"
            />
          )}
          {tab.label}
          {tab.count != null && (
            <span
              className={`tnum ml-0.5 px-1.5 h-[18px] inline-flex items-center rounded-full text-micro font-medium ${
                active
                  ? "bg-interactive-subtle text-interactive-subtle-ink"
                  : "bg-surface-active text-ink-subtle"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default Tabs;
