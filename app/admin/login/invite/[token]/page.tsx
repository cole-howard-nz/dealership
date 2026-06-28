import type { Metadata } from "next";
import { prisma } from "../../../../lib/prisma";
import { acceptInvite } from "../../../(portal)/staff/actions";
import { AcceptInviteForm } from "../../../../components/portal/AcceptInviteForm";

export const metadata: Metadata = {
  title: "Accept Invite — Northbridge Motors Staff Portal",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findFirst({
    where: {
      inviteToken: token,
      inviteAccepted: false,
      inviteTokenExpiry: { gt: new Date() },
    },
    select: { id: true, name: true, email: true, role: { select: { name: true } } },
  });

  const gridOverlay = {
    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
  };

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#0d1a2b" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={gridOverlay} />
        <div className="relative w-full max-w-md mx-4">
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#111f30", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)" }}
            >
              <span className="text-xl">⚠️</span>
            </div>
            <h1 className="font-heading text-xl font-bold text-white mb-2">Invalid Invite Link</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              This invite link is invalid or has expired. Please ask your manager to send a new invite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const boundAction = acceptInvite.bind(null, token);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#0d1a2b" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={gridOverlay} />
      <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: "#E15A2C" }} />

      <div className="relative w-full max-w-md mx-4">
        {/* Top identity strip */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
            Northbridge Motors
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full border" style={{ color: "rgba(255,255,255,0.3)", borderColor: "rgba(255,255,255,0.1)" }}>
            Staff only
          </span>
        </div>

        {/* Card */}
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
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-sora, sans-serif)", letterSpacing: "-0.02em" }}>
              Set your password
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Welcome, {user.name}. Activate your {user.role.name} account below.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)", margin: "0 2rem" }} />

          {/* Account info row */}
          <div className="px-8 pt-5">
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: "#142036" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{user.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <AcceptInviteForm action={boundAction} />
          </div>
        </div>
      </div>
    </div>
  );
}
