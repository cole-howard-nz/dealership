import { requireAuth } from "../../lib/auth-helpers";
import { PortalShell } from "../../components/portal/PortalShell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <PortalShell
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        locations: session.user.locations,
      }}
    >
      {children}
    </PortalShell>
  );
}
