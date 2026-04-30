import * as React from "react";
import Link from "next/link";
import { AlertTriangleIcon, InboxIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type StatusTone = "navy" | "orange" | "teal" | "green" | "muted";

const statusToneClasses = {
  navy: "border-[color:var(--cpl-navy)]/[0.15] bg-[color:var(--cpl-navy)]/[0.08] text-[color:var(--cpl-navy)]",
  orange:
    "border-[color:var(--cpl-orange)]/[0.25] bg-[color:var(--cpl-orange)]/10 text-[color:var(--cpl-orange)]",
  teal: "border-[color:var(--cpl-teal)]/[0.25] bg-[color:var(--cpl-teal)]/10 text-[color:var(--cpl-teal)]",
  green:
    "border-[color:var(--cpl-success)]/[0.25] bg-[color:var(--cpl-success)]/10 text-[color:var(--cpl-success)]",
  muted: "border-border bg-muted text-muted-foreground",
} satisfies Record<StatusTone, string>;

export function BrandedCard({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("cpl-card", className)} {...props}>
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cpl-orange)]">
            {eyebrow}
          </div>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-normal text-[color:var(--cpl-navy)] md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function StatusDot({
  tone = "muted",
  className,
}: {
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-2 rounded-full",
        tone === "navy" && "bg-[color:var(--cpl-navy)]",
        tone === "orange" && "bg-[color:var(--cpl-orange)]",
        tone === "teal" && "bg-[color:var(--cpl-teal)]",
        tone === "green" && "bg-[color:var(--cpl-success)]",
        tone === "muted" && "bg-muted-foreground/45",
        className,
      )}
    />
  );
}

export function StatusBadge({
  tone = "muted",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 gap-1.5 rounded-full", statusToneClasses[tone], className)}
    >
      <StatusDot tone={tone} />
      {children}
    </Badge>
  );
}

export function EmptyStateShell({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <BrandedCard
      className={cn(
        "flex min-h-72 flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-[color:var(--cpl-teal)]/10 text-[color:var(--cpl-teal)]">
        {icon ?? <InboxIcon className="size-7" />}
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-semibold text-[color:var(--cpl-navy)]">
          {title}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </BrandedCard>
  );
}

export function LoadingState({
  label = "Loading workspace",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-40 items-center justify-center gap-3 rounded-lg border border-dashed border-[color:var(--cpl-soft-border)] bg-card/70 text-sm text-muted-foreground",
        className,
      )}
    >
      <Spinner className="text-[color:var(--cpl-teal)]" />
      <span>{label}</span>
    </div>
  );
}

export function PermissionNotice({
  title = "Permission required",
  description,
  actionHref,
  actionLabel,
  className,
}: {
  title?: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-[color:var(--cpl-orange)]/[0.25] bg-[color:var(--cpl-orange)]/[0.08] p-4 text-sm sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--cpl-orange)]/[0.12] text-[color:var(--cpl-orange)]">
        <AlertTriangleIcon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[color:var(--cpl-navy)]">{title}</div>
        <p className="mt-1 leading-6 text-muted-foreground">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Button render={<Link href={actionHref} />} variant="outline">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
