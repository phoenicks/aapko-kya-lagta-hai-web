"use client";

import { LangThemeProvider } from "./LangThemeProvider";
import Header from "./Header";
import SessionBeacon from "./SessionBeacon";

// Client-side chrome shared by every page: language/theme context, the
// header, and the anonymous session heartbeat. Pass `hideHeader` when a page
// renders its own Header inline (the homepage's full-screen feed pins Header
// above its own scroll container instead of using this default placement).
export default function AppShell({ children, hideHeader = false }) {
  return (
    <LangThemeProvider>
      <SessionBeacon />
      {!hideHeader && <Header />}
      {children}
    </LangThemeProvider>
  );
}
