import { requirePermission } from "../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../components/portal/PhasePlaceholder";
export default async function LocationsPage() {
  await requirePermission("locations.manage");
  return <PhasePlaceholder title="Locations" description="Location creation and management is implemented in Phase 3. Default locations (Wellington Yard, Auckland Yard) are already seeded." phase="Phase 3" />;
}
