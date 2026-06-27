import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password — Northbridge Motors Staff Portal",
};

/**
 * Password reset via email is implemented in Phase 4.
 * Until then, the Owner can reset a staff member's password
 * directly via the Staff management pages (Phase 3).
 */
export default function ForgotPasswordPage() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "#0d1a2b" }}
    >
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundColor: "#E15A2C" }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md mx-4">

        {/* Top identity strip */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
              Northbridge Motors
            </span>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full border" style={{ color: "rgba(255,255,255,0.3)", borderColor: "rgba(255,255,255,0.1)" }}>
            Staff only
          </span>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#111f30",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6">
            <h1
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-sora, sans-serif)", letterSpacing: "-0.02em" }}
            >
              Reset password
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Staff portal — authorised access only
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)", margin: "0 2rem" }} />

          {/* Body */}
          <div className="px-8 py-7 flex flex-col gap-5">
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Email-based password reset is coming in a future update. In the meantime, your portal Owner or Manager can reset your password directly.
            </p>

            {/* Info box */}
            <div
              className="rounded-xl p-4 flex gap-3"
              style={{
                backgroundColor: "rgba(225,90,44,0.08)",
                border: "1px solid rgba(225,90,44,0.2)",
              }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#E15A2C" }}>
                  Need access now?
                </p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Ask your Owner or Manager to go to{" "}
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>
                    Staff → your account → Reset password
                  </span>
                </p>
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}