/**
 * Status vocabulary for the console.
 *
 * Semantic variants (success / warning / danger / info) carry a leading dot by
 * default, so state is legible at a glance and never depends on color alone —
 * which matters here because the brand accent is itself a green.
 */
const VARIANTS = {
  default: {
    chip: "bg-surface-sunken text-ink-muted border-line",
    dot: "bg-ink-faint",
    showDot: false,
  },
  primary: {
    chip: "bg-interactive-subtle text-interactive-subtle-ink border-transparent",
    dot: "bg-interactive",
    showDot: false,
  },
  neutral: {
    chip: "bg-surface-sunken text-ink-muted border-line",
    dot: "bg-ink-faint",
    showDot: true,
  },
  success: {
    chip: "bg-success-bg text-success-fg border-success-border",
    dot: "bg-success",
    showDot: true,
  },
  warning: {
    chip: "bg-warning-bg text-warning-fg border-warning-border",
    dot: "bg-warning",
    showDot: true,
  },
  danger: {
    chip: "bg-danger-bg text-danger-fg border-danger-border",
    dot: "bg-danger",
    showDot: true,
  },
  info: {
    chip: "bg-info-bg text-info-fg border-info-border",
    dot: "bg-info",
    showDot: true,
  },
  // Attention states — peak windows, rewards, anything awaiting a human.
  accent: {
    chip: "bg-accent-100 text-accent-800 border-accent-200 dark:bg-accent-950 dark:text-accent-300 dark:border-accent-800",
    dot: "bg-accent-400",
    showDot: true,
  },
};

const SIZES = {
  sm: "h-[18px] px-1.5 text-micro gap-1",
  md: "h-5 px-2 text-caption gap-1.5",
  lg: "h-6 px-2.5 text-sm gap-1.5",
};

const Badge = ({
  children,
  variant = "default",
  size = "md",
  dot,
  className = "",
  ...props
}) => {
  const tone = VARIANTS[variant] ?? VARIANTS.default;
  const showDot = dot ?? tone.showDot;

  return (
    <span
      className={[
        "inline-flex items-center font-medium rounded-sm border whitespace-nowrap align-middle",
        tone.chip,
        SIZES[size] ?? SIZES.md,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
