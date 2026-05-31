import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });

const BASE = "https://aniwatsu.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: { default: "Aniwatsu – Watch Anime Free Online", template: "%s | Aniwatsu" },
  description: "Watch anime free online in HD. Stream the latest seasonal anime, top-rated series, and classic movies. Updated daily. No sign-up required.",
  keywords: ["watch anime free", "anime streaming", "watch anime online", "anime online", "free anime", "HD anime"],
  authors: [{ name: "Aniwatsu" }],
  creator: "Aniwatsu",
  publisher: "Aniwatsu",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    siteName: "Aniwatsu",
    title: "Aniwatsu – Watch Anime Free Online",
    description: "Watch anime free online in HD. Stream the latest seasonal anime, top-rated series, and classic movies. Updated daily.",
    url: BASE,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Aniwatsu – Watch Anime Free" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aniwatsu – Watch Anime Free Online",
    description: "Watch anime free online in HD. Updated daily.",
    images: ["/og-default.jpg"],
  },
  alternates: { canonical: BASE },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <link rel="preconnect" href="https://cdn.myanimelist.net" />
        <meta name="theme-color" content="#0d0d14" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0d0d14]">
        <Navbar />
        <div className="flex-1 pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
