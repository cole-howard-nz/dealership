import { requirePermission } from "../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../components/portal/PhasePlaceholder";
export default async function RolesPage() {
  await requirePermission("staff.roles");
  return <PhasePlaceholder title="Roles" description="Role creation and the permission toggle matrix are implemented in Phase 3. Default roles (Owner, Manager, Sales Staff, Viewer) are already seeded and active." phase="Phase 3" />;
}
