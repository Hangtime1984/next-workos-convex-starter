import { LoadingState, PageHeader } from "@/components/app/app-primitives";

export default function WorkspaceProjectsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Project dashboard"
        title="Projects"
        description="Loading active organization projects."
      />
      <LoadingState label="Loading project list" />
    </div>
  );
}
