import { requirePermission } from "../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../components/portal/PhasePlaceholder";
export default async function SettingsPage() {
  await requirePermission("settings.manage");
  return <PhasePlaceholder title="Settings" description="System settings — business details, data retention configuration, and notification preferences — are implemented in Phase 4." phase="Phase 4" />;
}
