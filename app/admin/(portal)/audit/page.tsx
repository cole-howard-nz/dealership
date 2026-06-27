import { requirePermission } from "../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../components/portal/PhasePlaceholder";
export default async function AuditPage() {
  await requirePermission("audit.view");
  return <PhasePlaceholder title="Audit Log" description="The full audit log with filtering and export is implemented in Phase 3. All system events are being recorded from Phase 1 onwards." phase="Phase 3" />;
}
