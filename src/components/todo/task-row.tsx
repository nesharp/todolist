"use client";

import { Trash2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { UiTask } from "./types";
import { formatTaskCreatedAt } from "./utils";

export function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: UiTask;
  onToggle: (task: UiTask) => void;
  onDelete: (task: UiTask) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border border-border/40 bg-background/40 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-accent/5",
        task.completed && "bg-muted/10 opacity-75"
      )}
    >
      <button
        onClick={() => onToggle(task)}
        disabled={task.isPending}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          task.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 hover:border-primary/50"
        )}
        aria-label={
          task.completed ? "Позначити як не виконану" : "Позначити як виконану"
        }
      >
        {task.completed && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <span
          className={cn(
            "truncate text-base font-medium transition-all",
            task.completed && "text-muted-foreground line-through decoration-muted-foreground/50"
          )}
        >
          {task.text}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatTaskCreatedAt(task.createdAt)}
        </span>
      </div>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(task)}
        className="h-8 w-8 shrink-0 rounded-full text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
        aria-label="Видалити задачу"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

