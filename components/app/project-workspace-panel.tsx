"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import {
  ArrowRightIcon,
  Building2Icon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  filterProjects,
  getProjectStage,
  getProjectStageLabel,
  getProjectStatusLabel,
  projectStatuses,
  type ProjectStage,
} from "@/lib/frontend-contracts";
import { buildProjectPath } from "@/lib/routes";
import { formatTimestamp } from "@/lib/utils";
import {
  BrandedCard,
  EmptyStateShell,
  LoadingState,
  PageHeader,
  PermissionNotice,
  StatusBadge,
  StatusDot,
  type StatusTone,
} from "@/components/app/app-primitives";
import { ProjectCreateDialog } from "@/components/app/project-create-dialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

const stageTone = {
  draft: "orange",
  intake: "teal",
  active: "green",
  archived: "muted",
} satisfies Record<ProjectStage, StatusTone>;

function DashboardPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-28 w-52 overflow-hidden rounded-lg border border-[color:var(--cpl-soft-border)] bg-[color:var(--cpl-warm-bg)]"
    >
      <div className="absolute inset-x-0 bottom-0 h-12 bg-[color:var(--cpl-teal)]/10" />
      <div className="absolute bottom-6 left-5 h-12 w-7 rounded-t-sm bg-[color:var(--cpl-navy)]/10" />
      <div className="absolute bottom-6 left-16 h-16 w-9 rounded-t-sm bg-[color:var(--cpl-navy)]/15" />
      <div className="absolute bottom-6 right-12 h-20 w-10 rounded-t-sm bg-[color:var(--cpl-orange)]/15" />
      <div className="absolute bottom-20 right-8 h-px w-24 origin-left rotate-[-18deg] bg-[color:var(--cpl-orange)]/35" />
      <div className="absolute bottom-14 right-8 h-16 w-px bg-[color:var(--cpl-orange)]/35" />
      <div className="absolute bottom-24 right-5 size-2 rounded-full bg-[color:var(--cpl-orange)]/60" />
    </div>
  );
}

function projectSearchText(project: {
  name: string;
  slug: string;
  programDepartment?: string;
  location?: string;
  projectType?: string;
}) {
  return [
    project.slug,
    project.programDepartment,
    project.location,
    project.projectType,
  ]
    .filter(Boolean)
    .join(" / ");
}

export function ProjectDashboard({
  workspaceId,
  workspaceSlug,
  workspaceName,
}: {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  workspaceName: string;
}) {
  const convexAuth = useConvexAuth();
  const projects = useQuery(
    api.projects.listProjects,
    convexAuth.isAuthenticated ? { workspaceId } : "skip",
  );
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<
    "all" | (typeof projectStatuses)[number]
  >("all");
  const [createOpen, setCreateOpen] = useState(false);
  const canCreateProject = convexAuth.isAuthenticated;

  const filteredProjects = useMemo(
    () =>
      projects
        ? filterProjects(projects, {
            search: deferredSearch,
            status: statusFilter,
          })
        : [],
    [deferredSearch, projects, statusFilter],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Project dashboard"
        title="Projects"
        description={`Create and resume owner-side capital projects for ${workspaceName}.`}
        action={
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={!canCreateProject}
          >
            <PlusIcon data-icon="inline-start" />
            New Project
          </Button>
        }
      />

      <BrandedCard className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_12rem] md:items-center">
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>
              <SearchIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search projects"
            placeholder="Search projects"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        <select
          aria-label="Filter projects by status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as "all" | (typeof projectStatuses)[number],
            )
          }
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">All statuses</option>
          {projectStatuses.map((status) => (
            <option key={status} value={status}>
              {getProjectStatusLabel(status)}
            </option>
          ))}
        </select>
      </BrandedCard>

      {!convexAuth.isLoading && !convexAuth.isAuthenticated ? (
        <PermissionNotice
          title="Permission denied"
          description="Convex could not confirm the active WorkOS session for this project list."
        />
      ) : projects === undefined ? (
        <LoadingState label="Loading project list" />
      ) : projects.length === 0 ? (
        <EmptyStateShell
          icon={<DashboardPlaceholder />}
          title="No projects yet"
          description="Create the first project for this organization to begin intake, delivery recommendation, and procurement package work."
          action={
            <Button
              onClick={() => setCreateOpen(true)}
              disabled={!canCreateProject}
            >
              <PlusIcon data-icon="inline-start" />
              New Project
            </Button>
          }
          className="min-h-[24rem]"
        />
      ) : filteredProjects.length === 0 ? (
        <PermissionNotice
          title="No matching projects"
          description="Adjust the search text or status filter to return to the organization project list."
        />
      ) : (
        <BrandedCard className="overflow-hidden">
          <div className="hidden grid-cols-[minmax(14rem,1.35fr)_minmax(11rem,0.8fr)_8rem_9rem_8rem] border-b border-[color:var(--cpl-soft-border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:grid">
            <div>Project</div>
            <div>Program</div>
            <div>Stage</div>
            <div>Updated</div>
            <div className="text-right">Action</div>
          </div>
          <div className="divide-y divide-[color:var(--cpl-soft-border)]">
            {filteredProjects.map((project) => {
              const projectPath = buildProjectPath({
                workspaceSlug,
                projectSlug: project.slug,
                section: "intake",
              });
              const stage = getProjectStage(project);
              const metadata = projectSearchText(project);

              return (
                <Link
                  key={project._id}
                  href={projectPath}
                  className="group grid gap-3 px-4 py-4 transition-colors hover:bg-muted/45 lg:grid-cols-[minmax(14rem,1.35fr)_minmax(11rem,0.8fr)_8rem_9rem_8rem] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusDot tone={stageTone[stage]} />
                      <div className="truncate font-semibold text-[color:var(--cpl-navy)]">
                        {project.name}
                      </div>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {metadata || project.slug}
                    </div>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Building2Icon className="size-3.5 shrink-0 text-[color:var(--cpl-teal)]" />
                      <span className="truncate">
                        {project.programDepartment ?? "Unassigned program"}
                      </span>
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1.5 lg:hidden">
                      <MapPinIcon className="size-3.5 shrink-0 text-[color:var(--cpl-orange)]" />
                      <span className="truncate">
                        {project.location ?? "Location pending"}
                      </span>
                    </span>
                  </div>
                  <div>
                    <StatusBadge tone={stageTone[stage]}>
                      {getProjectStageLabel(project)}
                    </StatusBadge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimestamp(project.updatedAt)}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm font-medium text-[color:var(--cpl-navy)] lg:justify-end">
                    <span className="lg:hidden">Open intake</span>
                    <span className="hidden lg:inline">Open</span>
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </BrandedCard>
      )}

      <ProjectCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}
