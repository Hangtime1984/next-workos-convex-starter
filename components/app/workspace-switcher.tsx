"use client";

import { startTransition, useState } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { ChevronsUpDownIcon, Loader2Icon } from "lucide-react";
import type { WorkspaceSummary } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceSwitcher({
  activeWorkspace,
  workspaces,
}: {
  activeWorkspace: WorkspaceSummary;
  workspaces: WorkspaceSummary[];
}) {
  const { switchToOrganization } = useAuth();
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between"
          />
        }
      >
        <span className="truncate">{activeWorkspace.name}</span>
        <ChevronsUpDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="start">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuGroup>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => {
                if (workspace.id === activeWorkspace.id) {
                  return;
                }

                setPendingWorkspaceId(workspace.id);
                startTransition(async () => {
                  try {
                    await switchToOrganization(workspace.organizationId, {
                      returnTo: `/w/${workspace.slug}`,
                    });
                  } finally {
                    setPendingWorkspaceId(null);
                  }
                });
              }}
            >
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{workspace.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    Role: {workspace.roleSlug}
                  </div>
                </div>
                {pendingWorkspaceId === workspace.id ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : workspace.id === activeWorkspace.id ? (
                  <Badge variant="secondary">Current</Badge>
                ) : null}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
