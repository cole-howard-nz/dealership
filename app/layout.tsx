import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ShortlistProvider } from "./hooks/useShortlist";
import { ToastProvider } from "./hooks/useToast";
// @ts-ignore: side-effect CSS import declaration is handled by Next.js
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
      <body className="flex min-h-screen flex-col bg-bg text-ink font-body">
        <ShortlistProvider>
          <ToastProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-accent text-white px-3 py-2 rounded-sm z-50"
            >
              Skip to content
            </a>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </ShortlistProvider>
      </body>
    </html>
  );
}
