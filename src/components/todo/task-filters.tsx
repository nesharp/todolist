"use client";

import { Star } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import type { TaskPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

import type { UiTask } from "./types";
import { todoFieldControlClassName, todoFieldLabelClass } from "./form-controls";

/** Filter option: only tasks with no labels */
export const FILTER_UNTAGGED = "__untagged__";

export type TaskViewFilter = {
  completion: "all" | "active" | "completed";
  /** `null` = any label, `FILTER_UNTAGGED` = empty labels, else exact label */
  label: string | null;
  priority: TaskPriority | "ALL";
  importantOnly: boolean;
};

export const defaultTaskViewFilter = (): TaskViewFilter => ({
  completion: "active",
  label: null,
  priority: "ALL",
  importantOnly: false,
});

export function isNonDefaultTaskFilter(f: TaskViewFilter): boolean {
  const d = defaultTaskViewFilter();
  return (
    f.completion !== d.completion ||
    f.label !== d.label ||
    f.priority !== d.priority ||
    f.importantOnly !== d.importantOnly
  );
}

export function collectDistinctLabels(tasks: UiTask[]): string[] {
  const seen = new Set<string>();
  for (const t of tasks) {
    for (const l of t.labels) seen.add(l);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

export function filterTasksForView(
  tasks: UiTask[],
  f: TaskViewFilter
): UiTask[] {
  return tasks.filter((task) => {
    if (f.completion === "active" && task.completed) return false;
    if (f.completion === "completed" && !task.completed) return false;
    if (f.importantOnly && !task.important) return false;
    if (f.priority !== "ALL" && task.priority !== f.priority) return false;
    if (f.label === FILTER_UNTAGGED && task.labels.length > 0) return false;
    if (f.label && f.label !== FILTER_UNTAGGED && !task.labels.includes(f.label)) {
      return false;
    }
    return true;
  });
}

export function TaskFiltersBar({
  tasks,
  value,
  onChange,
}: {
  tasks: UiTask[];
  value: TaskViewFilter;
  onChange: (next: TaskViewFilter) => void;
}) {
  const labelOptions = useMemo(() => collectDistinctLabels(tasks), [tasks]);

  const hasCustomFilter = isNonDefaultTaskFilter(value);

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/40 bg-muted/20 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Filter list
        </span>
        {hasCustomFilter ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-lg text-xs"
            onClick={() => onChange(defaultTaskViewFilter())}
          >
            Reset
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-stretch gap-x-4 gap-y-4">
        <label className={cn(todoFieldLabelClass, "min-w-[9rem] flex-1")}>
          Status
          <select
            className={todoFieldControlClassName()}
            aria-label="Filter by completion status"
            value={value.completion}
            onChange={(e) =>
              onChange({
                ...value,
                completion: e.target.value as TaskViewFilter["completion"],
              })
            }
          >
            <option value="active">Active</option>
            <option value="completed">Done</option>
            <option value="all">All</option>
          </select>
        </label>
        <label className={cn(todoFieldLabelClass, "min-w-[10rem] flex-1")}>
          Label
          <select
            className={todoFieldControlClassName()}
            aria-label="Filter by label"
            value={value.label ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...value,
                label: v === "" ? null : v,
              });
            }}
          >
            <option value="">Any label</option>
            <option value={FILTER_UNTAGGED}>Untagged</option>
            {labelOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className={cn(todoFieldLabelClass, "min-w-[9rem] flex-1")}>
          Priority
          <select
            className={todoFieldControlClassName()}
            aria-label="Filter by priority"
            value={value.priority}
            onChange={(e) =>
              onChange({
                ...value,
                priority: e.target.value as TaskViewFilter["priority"],
              })
            }
          >
            <option value="ALL">Any</option>
            <option value="NONE">None</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <div className="flex min-w-[9rem] flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Important
          </span>
          <Button
            type="button"
            variant={value.importantOnly ? "secondary" : "outline"}
            size="sm"
            data-testid="filter-starred-only"
            className={cn(
              "h-10 gap-2 rounded-xl px-3",
              value.importantOnly &&
                "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100"
            )}
            onClick={() =>
              onChange({ ...value, importantOnly: !value.importantOnly })
            }
            aria-pressed={value.importantOnly}
          >
            <Star
              className={cn(
                "h-4 w-4",
                value.importantOnly && "fill-current"
              )}
            />
            Starred only
          </Button>
        </div>
      </div>
    </div>
  );
}
