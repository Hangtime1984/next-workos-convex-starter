import { redirect } from "next/navigation";
import { requireWorkspaceRouteContext } from "@/lib/server/auth";
import { buildWorkspaceProjectsPath } from "@/lib/routes";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const context = await requireWorkspaceRouteContext(slug, {
    returnTo: buildWorkspaceProjectsPath(slug),
  });

  redirect(buildWorkspaceProjectsPath(context.routeWorkspace.slug));
}
