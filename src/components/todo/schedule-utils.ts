import type { UiTask } from "./types";

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Tasks with a deadline on or before today's calendar day (includes overdue). */
export function partitionScheduleTasks(tasks: UiTask[], now = new Date()) {
  const todayStart = startOfLocalDay(now);
  const today: UiTask[] = [];
  const upcoming: UiTask[] = [];

  for (const task of tasks) {
    if (!task.deadline) continue;
    const dayStart = startOfLocalDay(new Date(task.deadline));
    if (dayStart.getTime() <= todayStart.getTime()) {
      today.push(task);
    } else {
      upcoming.push(task);
    }
  }

  const byDeadlineAsc = (a: UiTask, b: UiTask) =>
    new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();

  today.sort(byDeadlineAsc);
  upcoming.sort(byDeadlineAsc);

  return { today, upcoming };
}

export function formatDeadlineShort(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function deadlineToDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateInputValueToIsoEndOfDay(ymd: string): string | null {
  const trimmed = ymd.trim();
  if (!trimmed) return null;
  const [y, mo, d] = trimmed.split("-").map((n) => Number.parseInt(n, 10));
  if (!y || !mo || !d) return null;
  const local = new Date(y, mo - 1, d, 23, 59, 59, 999);
  return local.toISOString();
}
