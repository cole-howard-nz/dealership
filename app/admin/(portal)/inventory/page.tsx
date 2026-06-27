import { requirePermission } from "../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../components/portal/PhasePlaceholder";
export default async function InventoryPage() {
  await requirePermission("inventory.view");
  return <PhasePlaceholder title="Inventory" description="Vehicle inventory management — create, edit, and manage stock across all locations — is implemented in Phase 3." phase="Phase 3" />;
}
