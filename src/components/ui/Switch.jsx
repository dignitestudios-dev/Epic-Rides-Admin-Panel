/**
 * Binary control for a state that applies immediately (no save step).
 * Always pass an `aria-label` describing what it toggles.
 */
const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  loading = false,
  "aria-label": ariaLabel,
  className = "",
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    aria-busy={loading || undefined}
    disabled={disabled || loading}
    onClick={() => onChange?.(!checked)}
    className={[
      "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full",
      "transition-colors duration-150",
      "disabled:opacity-45 disabled:cursor-not-allowed",
      checked ? "bg-interactive" : "bg-surface-active border border-line",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <span
      className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ${
        checked ? "translate-x-[15px]" : "translate-x-[2px]"
      }`}
    />
  </button>
);

export default Switch;
