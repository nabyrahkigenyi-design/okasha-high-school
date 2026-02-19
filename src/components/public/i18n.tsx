"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "ar";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: "rtl" | "ltr";
};

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({
  children,
  defaultLang = "en",
}: {
  children: React.ReactNode;
  defaultLang?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(defaultLang);

  // ✅ Narrow type to "rtl" | "ltr"
  const dir: Ctx["dir"] = lang === "ar" ? "rtl" : "ltr";

  // optional: persist language
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ohs_lang") as Lang | null;
      if (saved === "en" || saved === "ar") setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ohs_lang", lang);
    } catch {}

    // keep document direction in sync (nice for Arabic)
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  // ✅ include dir in deps
  const value = useMemo(() => ({ lang, setLang, dir }), [lang, dir]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within <LangProvider>");
  return ctx;
}
