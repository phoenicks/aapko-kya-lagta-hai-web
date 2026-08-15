"use client";

import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export function LangThemeProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("auto"); // auto | light | dark

  useEffect(() => {
    const savedLang = window.localStorage.getItem("apk_lang");
    const savedTheme = window.localStorage.getItem("apk_theme");
    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.setAttribute("data-theme", "light");
    else if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    window.localStorage.setItem("apk_theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("apk_lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "en" ? "hi" : "en"));
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <Ctx.Provider value={{ lang, theme, toggleLang, toggleTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLangTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLangTheme must be used within LangThemeProvider");
  return ctx;
}
