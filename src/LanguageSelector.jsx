import React, { useState, useEffect } from "react";

const LANG_STORAGE_KEY = "kc_f1_language";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export function getCurrentLanguage() {
  const lang = localStorage.getItem(LANG_STORAGE_KEY);
  return lang ? lang.toLowerCase() : "en";
}



export default function LanguageSelector() {
  const [language, setLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_STORAGE_KEY, language);
    }
  }, [language]);

  const current =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) ??
    LANGUAGE_OPTIONS[0];

  function handleChange(event) {
    setLanguage(event.target.value);
  }

  return (
    <div className="flex flex-col items-end gap-1 text-right text-xs sm:text-sm">

      {/* Row 1: language dropdown */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/60 px-3 py-1">
        <span className="hidden sm:inline text-gray-300">Language:</span>
        <span className="sm:hidden text-gray-300">Lang:</span>
        <span aria-hidden="true">{current.flag}</span>

        <select
          value={language}
          onChange={handleChange}
          className="bg-transparent text-xs sm:text-sm outline-none border-none focus:ring-0 text-white"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option
              key={option.code}
              value={option.code}
              className="text-black"
            >
              {option.flag} {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2: hint + refresh button */}
      <div className="flex items-center justify-end gap-2 text-gray-300/80">
        <span>Change language, then refresh:</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-white/30 bg-black/60 px-3 py-1 hover:bg-black/80 text-xs sm:text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
