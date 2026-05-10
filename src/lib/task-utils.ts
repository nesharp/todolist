import type { ProjectItem, TaskItem, TaskPriority } from "@/lib/types";

const PRIORITIES: ReadonlySet<TaskPriority> = new Set([
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const MAX_TASK_LABELS = 10;
export const MAX_TASK_LABEL_LENGTH = 32;

export function parsePriority(value: unknown): TaskPriority {
  if (typeof value === "string" && PRIORITIES.has(value as TaskPriority)) {
    return value as TaskPriority;
  }
  return "NONE";
}

export function normalizeLabels(raw: unknown): string[] {
  const list = Array.isArray(raw)
    ? raw.filter((x): x is string => typeof x === "string")
    : [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const t = item.trim().slice(0, MAX_TASK_LABEL_LENGTH);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= MAX_TASK_LABELS) break;
  }
  return out;
}

export function parseLabelsFromDb(value: unknown): string[] {
  return normalizeLabels(Array.isArray(value) ? value : []);
}

export function toTaskItem(task: {
  id: string;
  text: string;
  completed: boolean;
  important?: boolean;
  deadline: Date | null;
  priority: TaskPriority;
  labels: unknown;
  projectId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TaskItem {
  return {
    id: task.id,
    text: task.text,
    completed: task.completed,
    important: Boolean(task.important),
    deadline: task.deadline ? task.deadline.toISOString() : null,
    priority: parsePriority(task.priority),
    labels: parseLabelsFromDb(task.labels),
    projectId: task.projectId ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function toProjectItem(project: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}): ProjectItem {
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
