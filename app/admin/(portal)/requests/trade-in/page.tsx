import { requirePermission } from "../../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../../components/portal/PhasePlaceholder";
export default async function TradeInRequestsPage() {
  await requirePermission("tradein.view");
  return <PhasePlaceholder title="Trade-In Requests" description="The trade-in request queue is implemented in Phase 2. All trade-in valuations submitted through the public site will appear here." phase="Phase 2" />;
}
