import { requireAdminContext } from "@/lib/server/auth";
import { WorkosWidgetPanel } from "@/components/widgets/workos-widget-panel";

export default async function SsoAdminPage() {
  await requireAdminContext();

  return (
    <WorkosWidgetPanel
      widget="admin-portal-sso-connection"
      title="SSO connection"
      description="The SSO widget is lazy-loaded and uses the same server-side token issuance path as the other embedded WorkOS surfaces."
    />
  );
}
