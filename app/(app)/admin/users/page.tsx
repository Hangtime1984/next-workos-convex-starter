import { requireAdminContext } from "@/lib/server/auth";
import { WorkosWidgetPanel } from "@/components/widgets/workos-widget-panel";

export default async function UsersAdminPage() {
  await requireAdminContext();

  return (
    <WorkosWidgetPanel
      widget="users-management"
      title="User management"
      description="This route stays hidden for members and only mints widget tokens for roles that can manage users."
    />
  );
}
