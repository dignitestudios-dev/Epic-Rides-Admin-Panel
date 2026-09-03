const SIZES = {
  sm: "w-6 h-6 text-micro",
  md: "w-7 h-7 text-caption",
  lg: "w-9 h-9 text-sm",
  xl: "w-14 h-14 text-lg",
};

const initialsFrom = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "?";

/**
 * Identity chip. Falls back to initials on a neutral ground — deliberately not
 * a per-user color, which would read as a status in a table full of them.
 */
const Avatar = ({ name, src, size = "md", className = "" }) => (
  <span
    className={`shrink-0 inline-flex items-center justify-center rounded-full overflow-hidden bg-surface-active text-ink-muted font-medium select-none ${
      SIZES[size] ?? SIZES.md
    } ${className}`}
  >
    {src ? (
      <img src={src} alt="" className="w-full h-full object-cover" />
    ) : (
      initialsFrom(name)
    )}
  </span>
);

export default Avatar;
