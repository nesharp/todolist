import type { UiTask } from "./types";

export function sortByCreatedAtDesc(tasks: UiTask[]) {
  return [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function formatTodayDate(now: Date) {
  return now.toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatNowTime(now: Date) {
  return now.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTaskCreatedAt(createdAt: string) {
  return new Date(createdAt).toLocaleString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isTempTaskId(id: string) {
  return id.startsWith("temp-");
}

export function createOptimisticTask(text: string, optimisticId: string): UiTask {
  const created = new Date().toISOString();
  return {
    id: optimisticId,
    text,
    completed: false,
    createdAt: created,
    updatedAt: created,
    isPending: true,
  };
}

