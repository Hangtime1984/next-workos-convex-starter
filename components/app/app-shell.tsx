"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanbanIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  ShieldCheckIcon,
  Users2Icon,
} from "lucide-react";
import type { Role, WorkspaceSummary } from "@/lib/types";
import { canAccessAdminUi, getRoleLabel } from "@/lib/frontend-contracts";
import { buildAppPath, buildWorkspacePath } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { UserMenu } from "@/components/app/user-menu";

export function AppShell({
  activeWorkspace,
  role,
  user,
  workspaces,
  children,
}: {
  activeWorkspace: WorkspaceSummary;
  role: Role;
  user: {
    email: string | null;
    name: string | null;
    pictureUrl: string | null;
  };
  workspaces: WorkspaceSummary[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    {
      href: buildAppPath(),
      label: "Overview",
      icon: LayoutDashboardIcon,
      active: pathname === buildAppPath(),
    },
    {
      href: buildWorkspacePath(activeWorkspace.slug),
      label: "Projects",
      icon: FolderKanbanIcon,
      active: pathname.startsWith(buildWorkspacePath(activeWorkspace.slug)),
    },
    {
      href: "/settings/profile",
      label: "Profile",
      icon: Settings2Icon,
      active: pathname.startsWith("/settings/profile"),
    },
  ];

  const adminNavigation = [
    {
      href: "/admin/users",
      label: "User management",
      icon: Users2Icon,
      active: pathname.startsWith("/admin/users"),
    },
    {
      href: "/admin/sso",
      label: "SSO connection",
      icon: ShieldCheckIcon,
      active: pathname.startsWith("/admin/sso"),
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader className="gap-4 px-3 py-3">
          <Link
            href={buildAppPath()}
            className="flex items-center gap-3 rounded-2xl px-1"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheckIcon />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">
                Next WorkOS Convex Starter
              </div>
              <div className="truncate text-xs text-muted-foreground">
                Public SaaS starter template
              </div>
            </div>
          </Link>
          <WorkspaceSwitcher activeWorkspace={activeWorkspace} workspaces={workspaces} />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map(({ href, label, icon: Icon, active }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={active}
                      render={<Link href={href} />}
                      tooltip={label}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {canAccessAdminUi(role) && (
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavigation.map(({ href, label, icon: Icon, active }) => (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        isActive={active}
                        render={<Link href={href} />}
                        tooltip={label}
                      >
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarSeparator />
        <SidebarFooter className="px-3 pb-3">
          <UserMenu role={role} user={user} />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{activeWorkspace.name}</div>
            <div className="text-xs text-muted-foreground">
              Active organization workspace
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary">{getRoleLabel(role)}</Badge>
          </div>
        </header>
        <div className="page-shell">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
