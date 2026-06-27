import { requirePermission } from "../../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../../components/portal/PhasePlaceholder";
export default async function FinanceApplicationsPage() {
  await requirePermission("finance.view");
  return <PhasePlaceholder title="Finance Applications" description="The finance application queue is implemented in Phase 2. All applications from the public site will appear here." phase="Phase 2" />;
}
