import { AppShell } from "@/components/app/app-shell";
import { AppProviders } from "@/components/providers";
import { getAppContext } from "@/lib/server/auth";

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getAppContext();

  return (
    <AppProviders>
      <AppShell
        activeWorkspace={context.activeWorkspace}
        role={context.role}
        user={{
          email: context.viewer.email,
          name: context.viewer.name,
          pictureUrl: context.viewer.pictureUrl,
        }}
        workspaces={context.workspaces}
      >
        {children}
      </AppShell>
    </AppProviders>
  );
}
