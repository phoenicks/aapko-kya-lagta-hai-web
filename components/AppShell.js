"use client";

import { LangThemeProvider } from "./LangThemeProvider";
import Header from "./Header";
import SessionBeacon from "./SessionBeacon";

// Client-side chrome shared by every page: language/theme context, the
// header, and the anonymous session heartbeat.
export default function AppShell({ children }) {
  return (
    <LangThemeProvider>
      <SessionBeacon />
      <Header />
      {children}
    </LangThemeProvider>
  );
}
