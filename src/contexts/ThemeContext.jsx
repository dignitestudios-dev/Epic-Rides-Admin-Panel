import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { THEME_OPTIONS, COLOR_CONFIG } from "../config/constants";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const STORAGE_KEY = "theme";
const PREFERENCES = ["system", "light", "dark"];

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

/**
 * Reads the stored preference. Older builds persisted a resolved theme
 * ("light" / "dark") rather than a preference, so those values still parse.
 */
const readStoredPreference = () => {
  if (!THEME_OPTIONS.persistTheme) return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return PREFERENCES.includes(stored) ? stored : null;
  } catch {
    // Private mode / blocked storage — fall back to the system preference.
    return null;
  }
};

const resolveTheme = (preference) => {
  if (THEME_OPTIONS.forceTheme) return THEME_OPTIONS.forceTheme;
  if (preference === "light" || preference === "dark") return preference;
  return prefersDark() ? "dark" : "light";
};

export const ThemeProvider = ({ children }) => {
  // What the admin chose: "system" | "light" | "dark".
  const [preference, setPreference] = useState(
    () => readStoredPreference() ?? THEME_OPTIONS.defaultPreference ?? "system"
  );

  // What is actually painted: "light" | "dark".
  const [theme, setResolvedTheme] = useState(() =>
    resolveTheme(readStoredPreference() ?? THEME_OPTIONS.defaultPreference)
  );

  // Paint the resolved theme onto <html> and keep the preference persisted.
  useEffect(() => {
    const resolved = resolveTheme(preference);
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.classList.toggle("light", resolved !== "dark");
    root.style.colorScheme = resolved;

    if (THEME_OPTIONS.persistTheme && !THEME_OPTIONS.forceTheme) {
      try {
        localStorage.setItem(STORAGE_KEY, preference);
      } catch {
        // Nothing to do — the choice just won't survive a reload.
      }
    }
  }, [preference]);

  // Follow the OS while the preference is "system".
  useEffect(() => {
    if (THEME_OPTIONS.forceTheme || preference !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      const resolved = event.matches ? "dark" : "light";
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.classList.toggle("light", resolved !== "dark");
      document.documentElement.style.colorScheme = resolved;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference]);

  const canToggleTheme =
    THEME_OPTIONS.enableThemeToggle && !THEME_OPTIONS.forceTheme;

  /** Flips between light and dark, leaving "system" behind once used. */
  const toggleTheme = useCallback(() => {
    if (!canToggleTheme) return;
    setPreference((current) => {
      const active = resolveTheme(current);
      return active === "dark" ? "light" : "dark";
    });
  }, [canToggleTheme]);

  const setTheme = useCallback(
    (next) => {
      if (!canToggleTheme) return;
      if (PREFERENCES.includes(next)) setPreference(next);
    },
    [canToggleTheme]
  );

  const value = useMemo(
    () => ({
      // Resolved, for rendering decisions (chart palettes, map styles).
      theme,
      isDark: theme === "dark",
      isLight: theme === "light",

      // The admin's choice, for rendering the toggle's own state.
      preference,
      setPreference: setTheme,
      setTheme,
      toggleTheme,
      canToggleTheme,

      themeOptions: THEME_OPTIONS,
      colors: {
        primary: COLOR_CONFIG.primary,
        secondary: COLOR_CONFIG.secondary,
        hasSecondary: COLOR_CONFIG.secondary.enabled,
      },
    }),
    [theme, preference, setTheme, toggleTheme, canToggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
