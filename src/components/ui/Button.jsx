import { forwardRef } from "react";

/**
 * The primary action carries the Epic Rides green with dark ink rather than
 * white — the brand green is bright enough that white text fails contrast,
 * while near-black on green clears AA comfortably in both themes.
 */
const VARIANTS = {
  primary:
    "bg-interactive text-interactive-ink hover:bg-interactive-hover active:bg-interactive-active border border-transparent font-semibold",
  secondary:
    "bg-surface text-ink border border-line hover:bg-surface-hover active:bg-surface-active",
  outline:
    "bg-transparent text-ink border border-line hover:bg-surface-hover active:bg-surface-active",
  ghost:
    "bg-transparent text-ink-muted border border-transparent hover:bg-surface-hover hover:text-ink active:bg-surface-active",
  subtle:
    "bg-interactive-subtle text-interactive-subtle-ink border border-transparent hover:brightness-95 dark:hover:brightness-110",
  danger:
    "bg-danger text-white border border-transparent hover:brightness-110 active:brightness-95 font-semibold",
  success:
    "bg-success text-white border border-transparent hover:brightness-110 active:brightness-95 font-semibold",
  warning:
    "bg-warning text-white border border-transparent hover:brightness-110 active:brightness-95 font-semibold",
  // Destructive action that shouldn't shout until hovered.
  "danger-ghost":
    "bg-transparent text-danger border border-transparent hover:bg-danger-bg active:bg-danger-bg",
};

const SIZES = {
  xs: "h-6 px-2 text-micro gap-1 rounded-sm",
  sm: "h-7 px-2.5 text-caption gap-1.5 rounded",
  md: "h-8 px-3 text-sm gap-1.5 rounded",
  lg: "h-9 px-4 text-md gap-2 rounded-md",
  xl: "h-11 px-5 text-lg gap-2 rounded-lg",
};

// Square sizes for icon-only buttons, so they don't render as lozenges.
const ICON_SIZES = {
  xs: "h-6 w-6 p-0 rounded-sm",
  sm: "h-7 w-7 p-0 rounded",
  md: "h-8 w-8 p-0 rounded",
  lg: "h-9 w-9 p-0 rounded-md",
  xl: "h-11 w-11 p-0 rounded-lg",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon,
      iconRight,
      disabled = false,
      loading = false,
      fullWidth = false,
      className = "",
      type = "button",
      onClick,
      ...props
    },
    ref
  ) => {
    const iconOnly = !children && (icon || iconRight);

    const classes = [
      "inline-flex items-center justify-center whitespace-nowrap font-medium",
      "transition-colors duration-150 select-none",
      "focus-visible:outline-2 focus-visible:outline-offset-2",
      "disabled:opacity-45 disabled:pointer-events-none",
      VARIANTS[variant] ?? VARIANTS.primary,
      iconOnly ? ICON_SIZES[size] ?? ICON_SIZES.md : SIZES[size] ?? SIZES.md,
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="spinner shrink-0" aria-hidden="true" />
        ) : (
          icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        )}
        {children}
        {iconRight && !loading && (
          <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
