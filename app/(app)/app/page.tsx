import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppContext } from "@/lib/server/auth";
import { cn } from "@/lib/utils";

export default async function AppOverviewPage() {
  const context = await getAppContext();
  const projects = await fetchQuery(
    api.projects.listProjects,
    {
      workspaceId: context.activeWorkspace.id,
      organizationId: context.activeWorkspace.organizationId,
    },
    { token: context.auth.accessToken },
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="page-surface grid gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <Badge variant="secondary">Authenticated app shell</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {context.viewer.firstName ?? context.viewer.name ?? "Welcome back"}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Your active organization is mirrored from WorkOS into Convex as a workspace. The starter keeps tenancy in WorkOS and reserves Convex for app-specific data.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/w/${context.activeWorkspace.slug}`}
              className={cn(buttonVariants())}
            >
              Open workspace
            </Link>
            <Link
              href="/settings/profile"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Open profile widget
            </Link>
          </div>
        </div>
        <Card className="border-border/70 bg-background/70">
          <CardHeader>
            <CardTitle>Current tenant</CardTitle>
            <CardDescription>
              Role-aware navigation comes from WorkOS session claims.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Workspace</span>
              <span className="font-medium text-foreground">
                {context.activeWorkspace.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Role</span>
              <Badge variant="outline">{context.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Projects</span>
              <span className="font-medium text-foreground">{projects.length}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="page-surface">
          <CardHeader>
            <CardTitle>Realtime sample data</CardTitle>
            <CardDescription>
              `/w/[slug]` hydrates a Convex project panel with typed mutations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{projects.length}</CardContent>
        </Card>
        <Card className="page-surface">
          <CardHeader>
            <CardTitle>Accessible workspaces</CardTitle>
            <CardDescription>
              The workspace switcher uses WorkOS memberships and session switching.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {context.workspaces.length}
          </CardContent>
        </Card>
        <Card className="page-surface">
          <CardHeader>
            <CardTitle>Admin controls</CardTitle>
            <CardDescription>
              Widgets are loaded on demand and token issuance stays server-side.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {context.role === "owner" || context.role === "admin" ? "Enabled" : "Member"}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
