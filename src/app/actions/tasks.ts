"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeLabels, parsePriority, toTaskItem } from "@/lib/task-utils";
import type { TaskItem, TaskPriority } from "@/lib/types";

async function resolveProjectIdForCreate(
  userId: string,
  raw: string | null | undefined
): Promise<string | null> {
  if (raw === undefined || raw === null) return null;
  const id = String(raw).trim();
  if (!id || id.toLowerCase() === "inbox") return null;
  const project = await prisma.project.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!project) throw new Error("Project not found");
  return project.id;
}

export type CreateTaskOptions = {
  deadline?: string | null;
  priority?: TaskPriority;
  labels?: string[];
  important?: boolean;
  /** Target project; omit or `null` / empty for inbox (no project). */
  projectId?: string | null;
};

export async function createTaskAction(
  text: string,
  options?: CreateTaskOptions
): Promise<TaskItem> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const normalized = text.trim();
  if (normalized.length < 2) {
    throw new Error("Task text must be at least 2 characters");
  }

  const deadline =
    options?.deadline && options.deadline.trim()
      ? new Date(options.deadline.trim())
      : null;
  if (deadline && Number.isNaN(deadline.getTime())) {
    throw new Error("Invalid deadline");
  }

  const priority = parsePriority(options?.priority);
  const labels = normalizeLabels(options?.labels ?? []);
  const important = Boolean(options?.important);
  const projectId = await resolveProjectIdForCreate(
    session.user.id,
    options?.projectId
  );

  const task = await prisma.task.create({
    data: {
      text: normalized,
      userId: session.user.id,
      important,
      deadline,
      priority,
      labels,
      projectId,
    },
  });

  revalidatePath("/");
  return toTaskItem(task);
}

export type UpdateTaskPayload = {
  id: string;
  text?: string;
  deadline?: string | null;
  priority?: TaskPriority;
  labels?: string[];
  important?: boolean;
};

export async function updateTaskAction(
  payload: UpdateTaskPayload
): Promise<TaskItem> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const { id } = payload;
  if (!id) throw new Error("Missing task id");

  const data: {
    text?: string;
    important?: boolean;
    deadline?: Date | null;
    priority?: TaskPriority;
    labels?: string[];
  } = {};

  if (payload.text !== undefined) {
    const t = payload.text.trim();
    if (t.length < 2) throw new Error("Task text must be at least 2 characters");
    data.text = t;
  }

  if (payload.deadline !== undefined) {
    if (payload.deadline === null || !String(payload.deadline).trim()) {
      data.deadline = null;
    } else {
      const d = new Date(String(payload.deadline).trim());
      if (Number.isNaN(d.getTime())) throw new Error("Invalid deadline");
      data.deadline = d;
    }
  }

  if (payload.priority !== undefined) {
    data.priority = parsePriority(payload.priority);
  }

  if (payload.labels !== undefined) {
    data.labels = normalizeLabels(payload.labels);
  }

  if (payload.important !== undefined) {
    data.important = Boolean(payload.important);
  }

  if (Object.keys(data).length === 0) {
    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) throw new Error("Task not found");
    return toTaskItem(existing);
  }

  const updated = await prisma.task.updateMany({
    where: { id, userId: session.user.id },
    data,
  });

  if (updated.count === 0) throw new Error("Task not found");

  const task = await prisma.task.findFirstOrThrow({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/");
  return toTaskItem(task);
}

export async function toggleTaskAction(
  id: string,
  completed: boolean
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.task.updateMany({
    where: { id, userId: session.user.id },
    data: { completed },
  });

  revalidatePath("/");
}

export async function deleteTaskAction(id: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.task.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/");
}
