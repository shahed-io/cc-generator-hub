import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loadPrefs, savePrefs, UserPrefs, DEFAULT_PREFS, CardBrand } from "@/lib/cardUtils";

interface AppContextValue {
  prefs: UserPrefs;
  setPref: <K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) => void;
}

const AppContext = createContext<AppContextValue>({
  prefs: DEFAULT_PREFS,
  setPref: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    const loaded = loadPrefs();
    setPrefs(loaded);
    if (loaded.darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const setPref = <K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
    if (key === "darkMode") {
      if (value) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  };

  return <AppContext.Provider value={{ prefs, setPref }}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
