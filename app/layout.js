import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aapko Kya Lagta Hai — आपको क्या लगता है?",
    template: "%s — Aapko Kya Lagta Hai",
  },
  description:
    "Aapko Kya Lagta Hai — a new image every day, one simple question: aapko kya lagta hai? Vote thumbs up or down, see how the crowd feels, and join the debate.",
  keywords: [
    "Aapko Kya Lagta Hai",
    "aapko kya lagta hai",
    "आपको क्या लगता है",
    "image voting app",
    "daily debate",
    "thumbs up thumbs down poll",
    "opinion app India",
  ],
  openGraph: {
    type: "website",
    siteName: "Aapko Kya Lagta Hai",
    title: "Aapko Kya Lagta Hai — आपको क्या लगता है?",
    description:
      "A new image every day. Vote 👍 or 👎, see what everyone else thinks, and join the debate.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Aapko Kya Lagta Hai — आपको क्या लगता है?",
    description:
      "A new image every day. Vote 👍 or 👎, see what everyone else thinks, and join the debate.",
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
