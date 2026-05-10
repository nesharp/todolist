"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProjectItem } from "@/lib/task-utils";
import type { ProjectItem } from "@/lib/types";

const MIN_NAME = 2;
const MAX_NAME = 120;

function normalizeProjectName(raw: string): string {
  return raw.trim().slice(0, MAX_NAME);
}

export async function createProjectAction(name: string): Promise<ProjectItem> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const normalized = normalizeProjectName(name);
  if (normalized.length < MIN_NAME) {
    throw new Error(`Project name must be at least ${MIN_NAME} characters`);
  }

  const project = await prisma.project.create({
    data: { name: normalized, userId: session.user.id },
  });

  revalidatePath("/");
  return toProjectItem(project);
}

export async function renameProjectAction(
  id: string,
  name: string
): Promise<ProjectItem> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const normalized = normalizeProjectName(name);
  if (normalized.length < MIN_NAME) {
    throw new Error(`Project name must be at least ${MIN_NAME} characters`);
  }

  const updated = await prisma.project.updateMany({
    where: { id, userId: session.user.id },
    data: { name: normalized },
  });

  if (updated.count === 0) throw new Error("Project not found");

  const project = await prisma.project.findFirstOrThrow({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/");
  return toProjectItem(project);
}

export async function deleteProjectAction(id: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const owned = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) throw new Error("Project not found");

  await prisma.$transaction([
    prisma.task.updateMany({
      where: { userId: session.user.id, projectId: id },
      data: { projectId: null },
    }),
    prisma.project.deleteMany({
      where: { id, userId: session.user.id },
    }),
  ]);

  revalidatePath("/");
}
