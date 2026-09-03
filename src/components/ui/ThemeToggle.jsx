import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * Three-way theme control. "System" is a first-class choice rather than a
 * hidden default, so an admin can hand control back to the OS after picking.
 */
const ThemeToggle = ({ className = "" }) => {
  const { preference, setPreference, canToggleTheme } = useTheme();

  if (!canToggleTheme) return null;

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-md bg-surface-sunken border border-line ${className}`}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={[
              "inline-flex items-center justify-center h-6 w-6 rounded transition-colors duration-150",
              active
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-faint hover:text-ink-muted",
            ].join(" ")}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
