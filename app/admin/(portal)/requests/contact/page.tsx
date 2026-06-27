import { requirePermission } from "../../../../lib/auth-helpers";
import { PhasePlaceholder } from "../../../../components/portal/PhasePlaceholder";
export default async function ContactRequestsPage() {
  await requirePermission("contact.view");
  return <PhasePlaceholder title="Contact Requests" description="The contact request queue is implemented in Phase 2. All contact form submissions from the public site will appear here." phase="Phase 2" />;
}
