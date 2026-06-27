import { requirePermission } from "../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../components/portal/PhasePlaceholder";
export default async function StaffPage() {
  await requirePermission("staff.view");
  return <PhasePlaceholder title="Staff" description="Staff account management, invitation flows, and location assignments are implemented in Phase 3." phase="Phase 3" />;
}
