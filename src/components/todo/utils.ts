import type { TaskItem } from "@/lib/types";

import type { UiTask } from "./types";

export function sortByCreatedAtDesc(tasks: UiTask[]) {
  return [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function formatTodayDate(now: Date) {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatNowTime(now: Date) {
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatTaskCreatedAt(createdAt: string) {
  return new Date(createdAt).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function isTempTaskId(id: string) {
  return id.startsWith("temp-");
}

export function createOptimisticTask(
  text: string,
  optimisticId: string,
  extras?: {
    deadline?: string | null;
    priority?: TaskItem["priority"];
    labels?: string[];
    important?: boolean;
  }
): UiTask {
  const created = new Date().toISOString();
  return {
    id: optimisticId,
    text,
    completed: false,
    important: Boolean(extras?.important),
    deadline: extras?.deadline ?? null,
    priority: extras?.priority ?? "NONE",
    labels: extras?.labels ?? [],
    createdAt: created,
    updatedAt: created,
    isPending: true,
  };
}

