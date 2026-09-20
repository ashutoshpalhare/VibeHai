import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { load, save, STORAGE_KEYS } from "@/lib/storage";

export type Theme = "dark" | "light";

interface ThemeApi {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeApi>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function apply(t: Theme) {
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", t === "light" ? "#f1eff8" : "#08080c");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "light"
      ? "light"
      : load<Theme>(STORAGE_KEYS.theme, "dark"),
  );

  useEffect(() => {
    apply(theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    // smooth cross-fade for the whole UI
    document.body.classList.add("theme-fade");
    setTimeout(() => document.body.classList.remove("theme-fade"), 420);
    setThemeState(t);
    save(STORAGE_KEYS.theme, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
