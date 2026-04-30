import type { Role, WorkspaceSummary } from "@/lib/types";
import { getRoleLabel } from "@/lib/frontend-contracts";
import {
  BrandedCard,
  EmptyStateShell,
  PageHeader,
  StatusBadge,
} from "@/components/app/app-primitives";

export function WorkspaceSectionPlaceholder({
  workspace,
  role,
  eyebrow,
  title,
  description,
  emptyTitle,
  emptyDescription,
}: {
  workspace: WorkspaceSummary;
  role: Role;
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={<StatusBadge tone="green">Workspace loaded</StatusBadge>}
      />

      <BrandedCard className="grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </div>
          <div className="mt-2 truncate text-sm font-semibold text-[color:var(--cpl-navy)]">
            {workspace.name}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Route context
          </div>
          <div className="mt-2 truncate text-sm font-semibold text-[color:var(--cpl-navy)]">
            {workspace.slug}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current role
          </div>
          <div className="mt-2 text-sm font-semibold text-[color:var(--cpl-navy)]">
            {getRoleLabel(role)}
          </div>
        </div>
      </BrandedCard>

      <EmptyStateShell
        title={emptyTitle}
        description={emptyDescription}
      />
    </div>
  );
}
