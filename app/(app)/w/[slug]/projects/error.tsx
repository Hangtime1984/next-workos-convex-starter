"use client";

import { Button } from "@/components/ui/button";
import { PageHeader, PermissionNotice } from "@/components/app/app-primitives";

export default function WorkspaceProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isPermissionError =
    error.message.toLowerCase().includes("access denied") ||
    error.message.toLowerCase().includes("permission");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Project dashboard"
        title="Projects"
        description="The project list could not be loaded for this workspace."
        action={
          <Button type="button" variant="outline" onClick={reset}>
            Retry
          </Button>
        }
      />
      <PermissionNotice
        title={isPermissionError ? "Permission denied" : "Project list unavailable"}
        description={
          isPermissionError
            ? "Your current workspace context does not grant access to these projects."
            : "Refresh the route or retry after the project service is available."
        }
      />
    </div>
  );
}
