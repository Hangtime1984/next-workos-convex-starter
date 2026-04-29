export const projectRouteSections = [
  "intake",
  "delivery",
  "procurement",
  "exports",
] as const;

export type ProjectRouteSection = (typeof projectRouteSections)[number];

function encodeSegment(value: string) {
  return encodeURIComponent(value);
}

export function buildAppPath() {
  return "/app";
}

export function buildWorkspacePath(workspaceSlug: string) {
  return `/w/${encodeSegment(workspaceSlug)}`;
}

export function buildWorkspaceProjectsPath(workspaceSlug: string) {
  return `${buildWorkspacePath(workspaceSlug)}/projects`;
}

export function buildProjectPath(input: {
  workspaceSlug: string;
  projectSlug: string;
  section?: ProjectRouteSection;
}) {
  const basePath = `${buildWorkspaceProjectsPath(input.workspaceSlug)}/${encodeSegment(input.projectSlug)}`;

  return input.section ? `${basePath}/${input.section}` : basePath;
}
