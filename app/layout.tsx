import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Northbridge Motors — Quality Used & Imported Vehicles",
    template: "%s — Northbridge Motors",
  },
  description:
    "Independently inspected used and imported vehicles, honestly priced, financed fast, delivered anywhere in NZ.",
  openGraph: {
    siteName: "Northbridge Motors",
    locale: "en_NZ",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NZ" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-bg text-ink font-body">{children}</body>
    </html>
  );
}