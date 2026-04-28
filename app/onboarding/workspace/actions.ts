"use server";

import { refreshSession, withAuth } from "@workos-inc/authkit-nextjs";
import { fetchMutation } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { getWorkOS } from "@/lib/server/workos";
import { slugify } from "@/lib/utils";

export type CreateWorkspaceState = {
  error?: string;
};

async function attachMembership(userId: string, organizationId: string) {
  const workos = getWorkOS();

  try {
    await workos.userManagement.createOrganizationMembership({
      organizationId,
      userId,
      roleSlug: "owner",
    });
    return;
  } catch {}

  try {
    await workos.userManagement.createOrganizationMembership({
      organizationId,
      userId,
      roleSlug: "admin",
    });
    return;
  } catch {}

  await workos.userManagement.createOrganizationMembership({
    organizationId,
    userId,
  });
}

export async function createWorkspaceAction(
  _previousState: CreateWorkspaceState,
  formData: FormData,
) {
  const auth = await withAuth();

  if (!auth.user || !auth.accessToken) {
    return {
      error: "Session expired. Sign in again.",
    } satisfies CreateWorkspaceState;
  }

  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 3) {
    return {
      error: "Workspace names should be at least 3 characters long.",
    } satisfies CreateWorkspaceState;
  }

  try {
    const workos = getWorkOS();
    const organization = await workos.organizations.createOrganization({
      name,
      externalId: slugify(name),
    });

    await attachMembership(auth.user.id, organization.id);

    const slug =
      slugify(organization.name) ||
      `workspace-${organization.id.slice(-6).toLowerCase()}`;

    await fetchMutation(
      api.workspaces.syncWorkspaceFromOrganization,
      {
        organizationId: organization.id,
        name: organization.name,
        slug,
        externalId: organization.externalId ?? undefined,
        domain: organization.domains[0]?.domain ?? undefined,
      },
      { token: auth.accessToken },
    );

    await refreshSession({ organizationId: organization.id });
  } catch (error) {
    console.error("Failed to create starter workspace", error);
    return {
      error:
        "We couldn't provision the workspace. Check your WorkOS roles and API credentials, then try again.",
    } satisfies CreateWorkspaceState;
  }

  redirect("/app");
}
