import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: {
    default: "Staff Portal — Northbridge Motors",
    template: "%s — Northbridge Motors Staff Portal",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // basePath tells NextAuth to call /admin/api/auth/* instead of /api/auth/*
    <SessionProvider basePath="/admin/api/auth">
      {children}
    </SessionProvider>
  );
}