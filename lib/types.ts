import type { Id } from "@/convex/_generated/dataModel";

export type Role = "owner" | "admin" | "member";

export type WidgetKey =
  | "user-profile"
  | "users-management"
  | "admin-portal-sso-connection";

export type WorkspaceSummary = {
  id: Id<"workspaces">;
  organizationId: string;
  name: string;
  slug: string;
  roleSlug: string;
};

export type Viewer = {
  userId: string;
  email: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  pictureUrl: string | null;
  activeOrganizationId: string | null;
  role: string | null;
  permissions: string[];
};

export type ProjectSummary = {
  _id: Id<"projects">;
  name: string;
  slug: string;
  status: "planning" | "active" | "archived";
  updatedAt: number;
};
