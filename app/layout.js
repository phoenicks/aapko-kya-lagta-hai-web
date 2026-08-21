import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aapko Kya Lagta Hai — आपको क्या लगता है?",
    template: "%s — Aapko Kya Lagta Hai",
  },
  description:
    "Red flags, cursed rooms, fit checks, AI chaos — a fresh debate every day. Swipe 👍 or 👎, see if the internet agrees with you, and roast it in the comments.",
  keywords: [
    "Aapko Kya Lagta Hai",
    "aapko kya lagta hai",
    "आपको क्या लगता है",
    "red flag or nah",
    "meme voting app",
    "gen z poll app",
    "daily debate",
    "thumbs up thumbs down poll",
    "opinion app India",
  ],
  openGraph: {
    type: "website",
    siteName: "Aapko Kya Lagta Hai",
    title: "Aapko Kya Lagta Hai — आपको क्या लगता है?",
    description:
      "Red flags, cursed rooms, fit checks, AI chaos. Swipe 👍 or 👎 and see if the internet agrees with you.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Aapko Kya Lagta Hai — आपको क्या लगता है?",
    description:
      "Red flags, cursed rooms, fit checks, AI chaos. Swipe 👍 or 👎 and see if the internet agrees with you.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a19" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
