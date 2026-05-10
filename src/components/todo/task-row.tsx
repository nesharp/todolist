"use client";

import type { UpdateTaskPayload } from "@/app/actions/tasks";
import type { TaskPriority } from "@/lib/types";
import { Trash2, Check, ListTree, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { normalizeLabels } from "@/lib/task-utils";

import type { UiTask } from "./types";
import { todoFieldControlClassName, todoFieldLabelClass } from "./form-controls";
import { LabelChipsInput } from "./label-chips-input";
import {
  dateInputValueToIsoEndOfDay,
  deadlineToDateInputValue,
  formatDeadlineShort,
} from "./schedule-utils";
import { formatTaskCreatedAt } from "./utils";

const priorityLabel: Record<TaskPriority, string> = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const priorityBadgeClass: Record<TaskPriority, string> = {
  NONE: "border-transparent bg-muted/50 text-muted-foreground",
  LOW: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  MEDIUM:
    "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  HIGH: "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200",
};

export function TaskRow({
  task,
  onToggle,
  onDelete,
  onUpdateTask,
}: {
  task: UiTask;
  onToggle: (task: UiTask) => void;
  onDelete: (task: UiTask) => void;
  onUpdateTask: (task: UiTask, patch: Omit<UpdateTaskPayload, "id">) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftDate, setDraftDate] = useState("");
  const [draftPriority, setDraftPriority] = useState<TaskPriority>("NONE");
  const [draftLabels, setDraftLabels] = useState<string[]>([]);
  const [draftImportant, setDraftImportant] = useState(false);

  const createdAtLabel = useMemo(
    () => formatTaskCreatedAt(task.createdAt),
    [task.createdAt]
  );

  const openEdit = () => {
    setDraftDate(deadlineToDateInputValue(task.deadline));
    setDraftPriority(task.priority);
    setDraftLabels([...task.labels]);
    setDraftImportant(task.important);
    setEditOpen(true);
  };

  const cancelEdit = () => {
    setEditOpen(false);
  };

  const saveEdit = () => {
    const iso = draftDate.trim()
      ? dateInputValueToIsoEndOfDay(draftDate)
      : null;
    onUpdateTask(task, {
      deadline: iso,
      priority: draftPriority,
      labels: normalizeLabels(draftLabels),
      important: draftImportant,
    });
    setEditOpen(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border border-border/40 bg-background/40 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-accent/10 hover:shadow-md",
        task.completed && "bg-muted/30 opacity-80",
        task.isPending && "animate-pulse border-primary/20 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggle(task)}
          disabled={task.isPending}
          className={cn(
            "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
            task.completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 hover:border-primary/50"
          )}
          aria-label={
            task.completed ? "Mark as incomplete" : "Mark as complete"
          }
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 45, opacity: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
          <div className="relative w-fit max-w-full">
            <motion.span
              animate={{
                color: task.completed
                  ? "var(--muted-foreground)"
                  : "var(--foreground)",
              }}
              className={cn(
                "block truncate text-base font-medium transition-colors",
                task.completed ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {task.text}
            </motion.span>
            <AnimatePresence>
              {task.completed && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-muted-foreground/60"
                />
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 gap-y-1">
            {task.important ? (
              <span
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
                title="Important"
              >
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                Important
              </span>
            ) : null}
            {task.deadline ? (
              <span className="text-xs font-medium text-muted-foreground">
                Due {formatDeadlineShort(task.deadline)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/70">No due date</span>
            )}
            {task.priority !== "NONE" ? (
              <Badge
                variant="outline"
                className={cn(
                  "h-5 rounded-md px-1.5 text-[10px] font-semibold uppercase tracking-wide",
                  priorityBadgeClass[task.priority]
                )}
              >
                {priorityLabel[task.priority]}
              </Badge>
            ) : null}
            {task.labels.map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="h-5 rounded-md px-1.5 text-[10px] font-normal"
              >
                {label}
              </Badge>
            ))}
          </div>
          <span className="text-xs text-muted-foreground/70">
            {createdAtLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            disabled={task.isPending}
            onClick={() =>
              onUpdateTask(task, { important: !task.important })
            }
            className={cn(
              "h-8 w-8 rounded-full text-muted-foreground opacity-0 transition-all hover:bg-accent/60 group-hover:opacity-100 focus:opacity-100",
              task.important &&
                "text-amber-600 opacity-100 hover:text-amber-600 dark:text-amber-400"
            )}
            aria-label={
              task.important ? "Remove from important" : "Mark as important"
            }
          >
            <Star
              className={cn("h-4 w-4", task.important && "fill-current")}
            />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => (editOpen ? cancelEdit() : openEdit())}
            className="h-8 w-8 rounded-full text-muted-foreground opacity-0 transition-all hover:bg-accent/60 group-hover:opacity-100 focus:opacity-100"
            aria-label={editOpen ? "Close task details" : "Edit task details"}
          >
            <ListTree className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(task)}
            className="h-8 w-8 rounded-full text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {editOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40 pt-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={cn(todoFieldLabelClass, "sm:col-span-1")}>
                Due date
                <Input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className={todoFieldControlClassName()}
                />
              </label>
              <label className={cn(todoFieldLabelClass, "sm:col-span-1")}>
                Priority
                <select
                  value={draftPriority}
                  onChange={(e) =>
                    setDraftPriority(e.target.value as TaskPriority)
                  }
                  className={todoFieldControlClassName()}
                >
                  {(Object.keys(priorityLabel) as TaskPriority[]).map((p) => (
                    <option key={p} value={p}>
                      {priorityLabel[p]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={cn(todoFieldLabelClass, "sm:col-span-2")}>
                Labels
                <LabelChipsInput
                  labels={draftLabels}
                  onChange={setDraftLabels}
                  disabled={task.isPending}
                  variant="comfortable"
                />
              </label>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Important
                </span>
                <Button
                  type="button"
                  variant={draftImportant ? "secondary" : "outline"}
                  size="sm"
                  className={cn(
                    "h-10 w-fit gap-2 rounded-xl px-3",
                    draftImportant &&
                      "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100"
                  )}
                  onClick={() => setDraftImportant((v) => !v)}
                  aria-pressed={draftImportant}
                >
                  <Star
                    className={cn("h-4 w-4", draftImportant && "fill-current")}
                  />
                  Starred
                </Button>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={saveEdit}
                disabled={task.isPending}
              >
                Save
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {task.isPending && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}
