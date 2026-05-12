import { useCallback, useSyncExternalStore } from "react";
import { AppLocale } from "../components/AppHeader";

const LOCALE_STORAGE_KEY = "route-snap-locale";
const LOCALE_CHANGE_EVENT = "route-snap-locale-change";
let memoryLocale: AppLocale | null = null;

function isAppLocale(value: string | null): value is AppLocale {
  return value === "ja" || value === "en";
}

function detectLocale(): AppLocale {
  if (typeof window === "undefined") return "ja";

  const savedLocale = safeGetStoredLocale();
  if (isAppLocale(savedLocale)) {
    return savedLocale;
  }
  if (memoryLocale) return memoryLocale;

  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((language) => language.toLowerCase().startsWith("ja")) ? "ja" : "en";
}

function safeGetStoredLocale() {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribeLocaleChange(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  };
}

export function usePreferredLocale() {
  const locale = useSyncExternalStore(subscribeLocaleChange, detectLocale, (): AppLocale => "ja");
  const setLocale = useCallback((localeValue: AppLocale) => {
    memoryLocale = localeValue;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, localeValue);
      } catch {
        // Keep language switching usable even when localStorage is unavailable.
      }
      window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
    }
  }, []);

  return [locale, setLocale] as const;
}
