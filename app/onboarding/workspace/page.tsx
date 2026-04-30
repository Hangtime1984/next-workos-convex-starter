import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkspaceForm } from "@/components/forms/create-workspace-form";
import { buildAppPath } from "@/lib/routes";
import { buildSignInPath } from "@/lib/utils";

export default async function WorkspaceOnboardingPage() {
  const auth = await withAuth();

  if (!auth.user) {
    redirect(buildSignInPath("/onboarding/workspace"));
  }

  if (auth.organizationId) {
    redirect(buildAppPath());
  }

  return (
    <main className="page-shell max-w-3xl">
      <Card className="page-surface">
        <CardHeader className="gap-3">
          <CardTitle className="text-3xl">Create your first workspace</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            The starter keeps WorkOS organizations as the tenancy source of truth. Creating a workspace provisions the org, adds your first membership, and mirrors the active workspace into Convex.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateWorkspaceForm />
        </CardContent>
      </Card>
    </main>
  );
}
