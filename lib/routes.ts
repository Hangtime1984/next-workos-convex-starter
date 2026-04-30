export const projectRouteSections = [
  "intake",
  "delivery",
  "procurement",
  "exports",
] as const;

export const workspaceRouteSections = [
  "projects",
  "templates",
  "packages",
  "reports",
  "settings",
] as const;

export type ProjectRouteSection = (typeof projectRouteSections)[number];
export type WorkspaceRouteSection = (typeof workspaceRouteSections)[number];

function encodeSegment(value: string) {
  return encodeURIComponent(value);
}

export function buildAppPath() {
  return "/app";
}

export function buildProfileSettingsPath() {
  return "/settings/profile";
}

export function buildAdminUsersPath() {
  return "/admin/users";
}

export function buildAdminSsoPath() {
  return "/admin/sso";
}

export function buildWorkspacePath(workspaceSlug: string) {
  return `/w/${encodeSegment(workspaceSlug)}`;
}

export function buildWorkspaceSectionPath(
  workspaceSlug: string,
  section: WorkspaceRouteSection,
) {
  return `${buildWorkspacePath(workspaceSlug)}/${section}`;
}

export function buildWorkspaceProjectsPath(workspaceSlug: string) {
  return buildWorkspaceSectionPath(workspaceSlug, "projects");
}

export function buildWorkspaceTemplatesPath(workspaceSlug: string) {
  return buildWorkspaceSectionPath(workspaceSlug, "templates");
}

export function buildWorkspacePackagesPath(workspaceSlug: string) {
  return buildWorkspaceSectionPath(workspaceSlug, "packages");
}

export function buildWorkspaceReportsPath(workspaceSlug: string) {
  return buildWorkspaceSectionPath(workspaceSlug, "reports");
}

export function buildWorkspaceSettingsPath(workspaceSlug: string) {
  return buildWorkspaceSectionPath(workspaceSlug, "settings");
}

export function buildProjectPath(input: {
  workspaceSlug: string;
  projectSlug: string;
  section?: ProjectRouteSection;
}) {
  const basePath = `${buildWorkspaceProjectsPath(input.workspaceSlug)}/${encodeSegment(input.projectSlug)}`;

  return input.section ? `${basePath}/${input.section}` : basePath;
}
