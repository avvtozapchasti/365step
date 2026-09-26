"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  Github,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import clsx from "clsx";

import { deleteProjectAction, saveProjectAction } from "@/actions/projects";
import { PROJECT_CATEGORIES } from "@/lib/taxonomy";
import type { Project, ProjectStatus } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
} from "./ui";
import { useReward } from "./reward-toast";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Idea",
  in_progress: "In progress",
  shipped: "Shipped",
  paused: "Paused",
};

const STATUS_TONE: Record<ProjectStatus, "neutral" | "soon" | "done" | "outline"> = {
  idea: "neutral",
  in_progress: "soon",
  shipped: "done",
  paused: "outline",
};

/**
 * Portfolio management: list, add, edit, delete.
 *
 * Kept in one client component because the form and the list share edit state,
 * and the mutations are ordinary server actions.
 */
export function ProjectManager({ projects }: { projects: Project[] }) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [adding, setAdding] = useState(false);

  const open = adding || editing !== null;

  return (
    <div className="space-y-5">
      {!open ? (
        <Button onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Add a project
        </Button>
      ) : (
        <ProjectForm
          project={editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}

      {projects.length === 0 && !open ? (
        <EmptyState
          icon={<Plus className="size-5" />}
          title="No projects yet"
          description="A finished small project is worth more than an ambitious unfinished one. Start by writing down the problem it solves."
          action={<Button onClick={() => setAdding(true)}>Add your first project</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => {
                setAdding(false);
                setEditing(project);
              }}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectForm({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const reward = useReward();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);

    const result = await saveProjectAction(formData);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not save that.");
      return;
    }

    reward({
      xp: result.xpAwarded,
      achievements: result.newAchievements,
      message: project ? "Project updated" : "Project added",
    });
    onClose();
    router.refresh();
  }

  return (
    <Panel className="animate-[rise_0.3s_both] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          {project ? "Edit project" : "New project"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="subtle rounded-full p-1.5 transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)]"
        >
          <X className="size-4" />
        </button>
      </div>

      <form action={onSubmit} className="space-y-4">
        {project ? <input type="hidden" name="id" value={project.id} /> : null}

        <Field label="Project name">
          <Input
            name="name"
            required
            minLength={2}
            maxLength={120}
            defaultValue={project?.name ?? ""}
            placeholder="Solar tracker for a school greenhouse"
          />
        </Field>

        <Field
          label="What problem does it solve?"
          hint="One or two sentences. Who has the problem, and what is hard about it."
        >
          <Textarea
            name="description"
            rows={3}
            maxLength={2000}
            defaultValue={project?.description ?? ""}
            placeholder="A specific person needs to do something, but something gets in the way…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select name="category" defaultValue={project?.category ?? "other"}>
              {PROJECT_CATEGORIES.map((category) => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Status">
            <Select name="status" defaultValue={project?.status ?? "idea"}>
              {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Skills used" hint="Comma separated, e.g. Python, Arduino, 3D printing">
          <Input
            name="skills"
            defaultValue={project?.skills.join(", ") ?? ""}
            placeholder="Python, Pandas, Matplotlib"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="GitHub" hint="Optional">
            <Input
              name="githubUrl"
              type="url"
              defaultValue={project?.githubUrl ?? ""}
              placeholder="https://github.com/…"
            />
          </Field>

          <Field label="Live demo" hint="Optional">
            <Input
              name="demoUrl"
              type="url"
              defaultValue={project?.demoUrl ?? ""}
              placeholder="https://…"
            />
          </Field>
        </div>

        {error ? <ErrorNote>{error}</ErrorNote> : null}

        <div className="hairline flex items-center gap-2.5 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {project ? "Save changes" : "Add project"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function ProjectCard({
  project,
  onEdit,
  index,
}: {
  project: Project;
  onEdit: () => void;
  index: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <Card
      className="flex flex-col p-5"
      style={{ animation: `rise 0.4s ${Math.min(index, 8) * 0.05}s both` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${project.name}`}
            className="subtle rounded-full p-1.5 transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)]"
          >
            <Pencil className="size-3.5" />
          </button>

          {confirming ? (
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                await deleteProjectAction(project.id);
                setDeleting(false);
                router.refresh();
              }}
              className="rounded-full px-2 py-1 text-[11px] font-medium text-[var(--color-urgent)] transition-colors hover:bg-[color-mix(in_oklab,var(--color-urgent)_10%,transparent)]"
            >
              {deleting ? <Loader2 className="size-3 animate-spin" /> : "Delete?"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${project.name}`}
              className="subtle rounded-full p-1.5 transition-colors hover:bg-[color-mix(in_oklab,var(--color-urgent)_10%,transparent)] hover:text-[var(--color-urgent)]"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-base font-semibold leading-snug">{project.name}</h3>
      <p className="subtle mt-0.5 text-[11px] capitalize">{project.category}</p>

      {project.description ? (
        <p className="muted mt-2.5 flex-1 text-[13px] leading-relaxed">{project.description}</p>
      ) : (
        <div className="flex-1" />
      )}

      {project.skills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="sunken rounded-full px-2 py-0.5 text-[10px] font-medium">
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      {project.githubUrl || project.demoUrl ? (
        <div className="hairline mt-4 flex flex-wrap items-center gap-3 pt-3.5">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="muted inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors hover:text-[var(--fg)]"
            >
              <Github className="size-3.5" />
              Code
            </a>
          ) : null}
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="muted inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors hover:text-[var(--fg)]"
            >
              <ExternalLink className="size-3.5" />
              Live demo
            </a>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
