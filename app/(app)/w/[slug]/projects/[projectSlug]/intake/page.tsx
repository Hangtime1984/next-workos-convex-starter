import Link from "next/link";
import {
  BrandedCard,
  PageHeader,
  StatusBadge,
} from "@/components/app/app-primitives";
import { Button } from "@/components/ui/button";
import { getProjectStageLabel } from "@/lib/frontend-contracts";
import { buildWorkspaceProjectsPath } from "@/lib/routes";
import { requireProjectRouteContext } from "@/lib/server/auth";
import { formatTimestamp } from "@/lib/utils";

export default async function ProjectIntakePlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}) {
  const { slug, projectSlug } = await params;
  const context = await requireProjectRouteContext({
    workspaceSlug: slug,
    projectSlug,
  });
  const project = context.project;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Project intake"
        title={project.name}
        description="The persistent intake wizard is the next phase. This protected route confirms the new project was created and routed correctly."
        action={
          <Button
            render={<Link href={buildWorkspaceProjectsPath(context.routeWorkspace.slug)} />}
            variant="outline"
          >
            Back to projects
          </Button>
        }
      />

      <BrandedCard className="grid gap-5 p-6 md:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <StatusBadge>
            {getProjectStageLabel(project)}
          </StatusBadge>
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--cpl-navy)]">
              Intake route ready
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This page is intentionally limited to route confirmation. Intake
              fields, autosave, delivery recommendations, procurement packages,
              approvals, and exports remain out of scope for Phase 2B.
            </p>
          </div>
        </div>

        <dl className="grid gap-3 rounded-lg border border-[color:var(--cpl-soft-border)] bg-muted/35 p-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Project ID
            </dt>
            <dd className="mt-1 font-medium text-[color:var(--cpl-navy)]">
              {project.slug}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Program
            </dt>
            <dd className="mt-1 text-muted-foreground">
              {project.programDepartment ?? "Not assigned"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Updated
            </dt>
            <dd className="mt-1 text-muted-foreground">
              {formatTimestamp(project.updatedAt)}
            </dd>
          </div>
        </dl>
      </BrandedCard>
    </div>
  );
}
