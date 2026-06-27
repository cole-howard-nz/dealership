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

  // Verify token is valid before rendering the form
  const user = await prisma.user.findFirst({
    where: {
      inviteToken: token,
      inviteAccepted: false,
      inviteTokenExpiry: { gt: new Date() },
    },
    select: { id: true, name: true, email: true, role: { select: { name: true } } },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#F5F5F4" }}>
        <div className="max-w-md w-full text-center">
          <div
            className="rounded-xl border bg-white shadow-sm p-8"
            style={{ borderColor: "#E4E5E8" }}
          >
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#FEF2F2" }}
            >
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="font-heading text-xl font-bold mb-2" style={{ color: "#13151A" }}>
              Invalid Invite Link
            </h1>
            <p className="text-sm" style={{ color: "#5B5F6B" }}>
              This invite link is invalid or has expired. Please ask your manager to send a new invite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const boundAction = acceptInvite.bind(null, token);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#F5F5F4" }}>
      <div className="max-w-md w-full">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4"
            style={{ backgroundColor: "#142036" }}
          >
            <span className="text-white font-bold text-xl font-heading">N</span>
          </div>
          <h1 className="font-heading text-xl font-bold" style={{ color: "#13151A" }}>
            Northbridge Motors
          </h1>
          <p className="text-sm mt-1" style={{ color: "#5B5F6B" }}>Staff Portal</p>
        </div>

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
          <div className="px-6 py-5 border-b" style={{ borderColor: "#E4E5E8" }}>
            <h2 className="font-heading text-lg font-bold" style={{ color: "#13151A" }}>
              Accept Your Invitation
            </h2>
            <p className="text-sm mt-1" style={{ color: "#5B5F6B" }}>
              Welcome, {user.name}. Set a password to activate your {user.role.name} account.
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-5 rounded-lg px-3 py-2.5"
              style={{ backgroundColor: "#F9FAFB", border: "1px solid #E4E5E8" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "#13151A" }}>{user.name}</p>
                <p className="text-xs" style={{ color: "#5B5F6B" }}>{user.email}</p>
              </div>
            </div>

            <AcceptInviteForm action={boundAction} />
          </div>
        </div>
      </div>
    </div>
  );
}
