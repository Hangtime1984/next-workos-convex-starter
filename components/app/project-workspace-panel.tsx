"use client";

import { useDeferredValue, useState, useTransition } from "react";
import { useMutation, usePreloadedQuery, type Preloaded } from "convex/react";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTimestamp } from "@/lib/utils";

export function ProjectWorkspacePanel({
  workspaceId,
  preloadedProjects,
}: {
  workspaceId: Id<"workspaces">;
  preloadedProjects: Preloaded<typeof api.projects.listProjects>;
}) {
  const projects = usePreloadedQuery(preloadedProjects);
  const createProject = useMutation(api.projects.createProject);
  const renameProject = useMutation(api.projects.renameProject);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{
    id: Id<"projects">;
    name: string;
  } | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(deferredSearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <InputGroup className="md:max-w-sm">
          <InputGroupAddon>
            <InputGroupText>
              <SearchIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search projects"
            placeholder="Search projects"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        <div className="md:ml-auto">
          <Button onClick={() => setCreateOpen(true)}>Create project</Button>
        </div>
      </div>

      <div className="page-surface overflow-hidden">
        {filteredProjects.length === 0 ? (
          <Empty className="border-0 p-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No projects yet</EmptyTitle>
              <EmptyDescription>
                Create the first realtime project in this workspace to exercise the starter Convex wiring.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="capitalize">{project.status}</TableCell>
                  <TableCell>{formatTimestamp(project.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRenameTarget({ id: project._id, name: project.name });
                        setRenameValue(project.name);
                      }}
                    >
                      Rename
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a project</DialogTitle>
            <DialogDescription>
              The project list is backed by Convex and updates instantly for authenticated clients.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const name = newProjectName.trim();

              if (!name) {
                return;
              }

              startTransition(async () => {
                try {
                  await createProject({ workspaceId, name });
                  toast.success(`Created ${name}`);
                  setNewProjectName("");
                  setCreateOpen(false);
                } catch (error) {
                  console.error(error);
                  toast.error("Unable to create the project.");
                }
              });
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="project-name">Project name</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      id="project-name"
                      value={newProjectName}
                      onChange={(event) => setNewProjectName(event.target.value)}
                      placeholder="Signal response redesign"
                    />
                  </InputGroup>
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Keep the sample domain minimal while still exercising authenticated mutations.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (!renameTarget || !renameValue.trim()) {
                return;
              }

              startTransition(async () => {
                try {
                  await renameProject({
                    projectId: renameTarget.id,
                    name: renameValue.trim(),
                  });
                  toast.success("Project renamed.");
                  setRenameTarget(null);
                  setRenameValue("");
                } catch (error) {
                  console.error(error);
                  toast.error("Unable to rename the project.");
                }
              });
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="rename-project-name">New name</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      id="rename-project-name"
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                    />
                  </InputGroup>
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Save rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
