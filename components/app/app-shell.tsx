"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  FileChartColumnIcon,
  FolderKanbanIcon,
  LayoutTemplateIcon,
  PackageIcon,
  Settings2Icon,
  ShieldCheckIcon,
  Users2Icon,
} from "lucide-react";
import type { Role, WorkspaceSummary } from "@/lib/types";
import { canAccessAdminUi, getRoleLabel } from "@/lib/frontend-contracts";
import {
  buildAdminSsoPath,
  buildAdminUsersPath,
  buildAppPath,
  buildWorkspacePackagesPath,
  buildWorkspaceProjectsPath,
  buildWorkspaceReportsPath,
  buildWorkspaceSettingsPath,
  buildWorkspaceTemplatesPath,
} from "@/lib/routes";
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
import { StatusBadge } from "@/components/app/app-primitives";

function BrandMark() {
  return (
    <div
      aria-hidden="true"
      className="grid size-11 shrink-0 grid-cols-3 grid-rows-3 gap-0.5 rounded-md bg-white/95 p-1 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.8)]"
    >
      <span className="col-start-1 row-span-2 row-start-2 rounded-[2px] bg-[color:var(--cpl-navy)]" />
      <span className="col-start-2 row-span-3 row-start-1 rounded-[2px] bg-[color:var(--cpl-navy)]" />
      <span className="col-start-3 row-span-2 row-start-1 rounded-[2px] bg-[color:var(--cpl-orange)]" />
      <span className="col-span-2 col-start-1 row-start-3 rounded-[2px] bg-[color:var(--cpl-teal)]" />
    </div>
  );
}

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
  children: ReactNode;
}) {
  const pathname = usePathname();
  const workspaceSlug = activeWorkspace.slug;

  const navigation = [
    {
      href: buildWorkspaceProjectsPath(workspaceSlug),
      label: "Projects",
      icon: FolderKanbanIcon,
      active: pathname.startsWith(buildWorkspaceProjectsPath(workspaceSlug)),
    },
    {
      href: buildWorkspaceTemplatesPath(workspaceSlug),
      label: "Templates",
      icon: LayoutTemplateIcon,
      active: pathname.startsWith(buildWorkspaceTemplatesPath(workspaceSlug)),
    },
    {
      href: buildWorkspacePackagesPath(workspaceSlug),
      label: "Packages",
      icon: PackageIcon,
      active: pathname.startsWith(buildWorkspacePackagesPath(workspaceSlug)),
    },
    {
      href: buildWorkspaceReportsPath(workspaceSlug),
      label: "Reports",
      icon: FileChartColumnIcon,
      active: pathname.startsWith(buildWorkspaceReportsPath(workspaceSlug)),
    },
    {
      href: buildWorkspaceSettingsPath(workspaceSlug),
      label: "Settings",
      icon: Settings2Icon,
      active: pathname.startsWith(buildWorkspaceSettingsPath(workspaceSlug)),
    },
  ];

  const adminNavigation = [
    {
      href: buildAdminUsersPath(),
      label: "User management",
      icon: Users2Icon,
      active: pathname.startsWith(buildAdminUsersPath()),
    },
    {
      href: buildAdminSsoPath(),
      label: "SSO connection",
      icon: ShieldCheckIcon,
      active: pathname.startsWith(buildAdminSsoPath()),
    },
  ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
          "--sidebar-width-icon": "4.75rem",
        } as CSSProperties
      }
    >
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        className="border-r border-[color:var(--sidebar-border)] bg-[color:var(--cpl-deep-navy)]"
      >
        <SidebarHeader className="gap-5 px-4 py-5">
          <Link
            href={buildAppPath()}
            className="flex min-w-0 items-center gap-3 rounded-lg px-1 text-sidebar-foreground"
          >
            <BrandMark />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <div className="text-[0.94rem] font-black uppercase leading-[0.95] tracking-normal">
                Capital Project
              </div>
              <div className="text-[0.94rem] font-black uppercase leading-[0.95] tracking-normal">
                Launchpad
              </div>
              <div className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--cpl-orange)]">
                Owner SaaS
              </div>
            </div>
          </Link>
          <div className="group-data-[collapsible=icon]:hidden">
            <WorkspaceSwitcher
              activeWorkspace={activeWorkspace}
              workspaces={workspaces}
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup className="gap-2 p-2">
            <SidebarGroupLabel className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/[0.45]">
              Workspace
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navigation.map(({ href, label, icon: Icon, active }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={active}
                      render={<Link href={href} />}
                      size="lg"
                      tooltip={label}
                      className="h-10 rounded-md text-white/[0.76] hover:bg-white/[0.09] hover:text-white data-active:bg-white data-active:text-[color:var(--cpl-navy)] data-active:shadow-[0_16px_30px_-22px_rgba(0,0,0,0.9)]"
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
            <SidebarGroup className="gap-2 p-2">
              <SidebarGroupLabel className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/[0.45]">
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {adminNavigation.map(({ href, label, icon: Icon, active }) => (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        isActive={active}
                        render={<Link href={href} />}
                        size="lg"
                        tooltip={label}
                        className="h-10 rounded-md text-white/[0.7] hover:bg-white/[0.09] hover:text-white data-active:bg-white data-active:text-[color:var(--cpl-navy)]"
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

        <SidebarSeparator className="bg-white/[0.12]" />
        <SidebarFooter className="px-4 pb-4 group-data-[collapsible=icon]:px-3">
          <UserMenu role={role} user={user} />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-transparent">
        <header className="sticky top-0 z-10 flex min-h-16 items-center gap-3 border-b border-[color:var(--cpl-soft-border)] bg-background/95 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="text-[color:var(--cpl-navy)] hover:bg-card" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <Building2Icon className="size-4 shrink-0 text-[color:var(--cpl-teal)]" />
              <div className="truncate text-sm font-semibold text-[color:var(--cpl-navy)]">
                {activeWorkspace.name}
              </div>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              Active WorkOS organization workspace
            </div>
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <StatusBadge tone="green">Live context</StatusBadge>
            <Badge
              variant="outline"
              className="border-[color:var(--cpl-navy)]/[0.15] bg-card text-[color:var(--cpl-navy)]"
            >
              {getRoleLabel(role)}
            </Badge>
          </div>
        </header>
        <div className="page-shell">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
