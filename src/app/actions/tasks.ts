"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import type { TaskItem } from "@/lib/types";

function toTaskItem(task: {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}): TaskItem {
  return {
    id: task.id,
    text: task.text,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function createTaskAction(text: string): Promise<TaskItem> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const normalized = text.trim();
  if (normalized.length < 2) {
    throw new Error("Task text must be at least 2 characters");
  }

  const task = await prisma.task.create({
    data: { text: normalized, userId: session.user.id },
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
