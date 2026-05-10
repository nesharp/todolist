"use client";

import { Calendar, Star } from "lucide-react";

import { cn } from "@/lib/utils";

import type { UiTask } from "./types";
import { formatDeadlineShort, partitionScheduleTasks } from "./schedule-utils";

const priorityDot: Record<string, string> = {
  NONE: "bg-muted-foreground/30",
  LOW: "bg-sky-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-rose-500",
};

function scrollToTask(taskId: string) {
  const el = document.getElementById(`task-row-${taskId}`);
  el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function SidebarSection({
  title,
  tasks,
  emptyHint,
}: {
  title: string;
  tasks: UiTask[];
  emptyHint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/40 p-3 shadow-sm backdrop-blur-sm">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" aria-hidden />
        {title}
      </h3>
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground/80">{emptyHint}</p>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => scrollToTask(task.id)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-xl px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50",
                  task.completed && "opacity-60"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    priorityDot[task.priority] ?? priorityDot.NONE
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-medium leading-snug">
                    {task.text}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    {task.important ? (
                      <Star
                        className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500"
                        aria-label="Important"
                      />
                    ) : null}
                    <span>{formatDeadlineShort(task.deadline)}</span>
                    {task.labels.slice(0, 2).map((label) => (
                      <span
                        key={label}
                        className="rounded-md bg-muted/80 px-1.5 py-px text-[10px] font-medium text-foreground/80"
                      >
                        {label}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ScheduleSidebar({ tasks }: { tasks: UiTask[] }) {
  const scheduled = tasks.filter((t) => !t.completed);
  const { today, upcoming } = partitionScheduleTasks(scheduled);

  return (
    <aside className="flex w-full flex-col gap-4">
      <SidebarSection
        title="Today"
        tasks={today}
        emptyHint="No tasks due today or earlier."
      />
      <SidebarSection
        title="Upcoming"
        tasks={upcoming}
        emptyHint="Nothing scheduled ahead."
      />
    </aside>
  );
}
