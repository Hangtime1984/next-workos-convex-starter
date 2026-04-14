import { WorkosWidgetPanel } from "@/components/widgets/workos-widget-panel";

export default function ProfileSettingsPage() {
  return (
    <WorkosWidgetPanel
      widget="user-profile"
      title="Profile settings"
      description="The User Profile widget demonstrates a low-friction embedded WorkOS surface with server-issued widget tokens."
    />
  );
}
