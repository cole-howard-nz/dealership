import type { Metadata } from "next";
import { requireAuth } from "../../../lib/auth-helpers";
import { AccountForm } from "./AccountForm";

export const metadata: Metadata = {
  title: "My Account — Northbridge Motors Staff Portal",
};

export default async function AccountPage() {
  const session = await requireAuth();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
          My Account
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5B5F6B" }}>
          Manage your profile and change your password.
        </p>
      </div>

      {/* Profile info card */}
      <div
        className="rounded-xl border bg-white shadow-sm mb-6"
        style={{ borderColor: "#E4E5E8" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "#E4E5E8" }}
        >
          <h2 className="font-heading text-base font-bold" style={{ color: "#13151A" }}>
            Profile
          </h2>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-0.5" style={{ color: "#5B5F6B" }}>Name</p>
            <p style={{ color: "#13151A" }}>{session.user.name}</p>
          </div>
          <div>
            <p className="font-semibold mb-0.5" style={{ color: "#5B5F6B" }}>Email</p>
            <p style={{ color: "#13151A" }}>{session.user.email}</p>
          </div>
          <div>
            <p className="font-semibold mb-0.5" style={{ color: "#5B5F6B" }}>Role</p>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: session.user.role.isSystem ? "#142036" : "#E15A2C15",
                color: session.user.role.isSystem ? "#FFFFFF" : "#E15A2C",
              }}
            >
              {session.user.role.name}
            </span>
          </div>
          <div>
            <p className="font-semibold mb-0.5" style={{ color: "#5B5F6B" }}>
              Assigned Locations
            </p>
            {session.user.locations.length === 0 ? (
              <p className="italic" style={{ color: "#5B5F6B" }}>None assigned</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {session.user.locations.map((loc: {id: string, name: string}) => (
                  <span
                    key={loc.id}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: "#E4E5E8", color: "#13151A" }}
                  >
                    {loc.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change password card */}
      <AccountForm userId={session.user.id} />
    </div>
  );
}
