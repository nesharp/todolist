"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { UpdateTaskPayload } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";

import type { UiTask } from "./types";
import { TaskRow } from "./task-row";

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdateTask,
  noMatchFilters,
  onClearFilters,
  emptyBecauseStatus,
  onFocusTask,
}: {
  tasks: UiTask[];
  onToggle: (task: UiTask) => void;
  onDelete: (task: UiTask) => void;
  onUpdateTask: (task: UiTask, patch: Omit<UpdateTaskPayload, "id">) => void;
  noMatchFilters?: boolean;
  onClearFilters?: () => void;
  /** Inbox has tasks but this view (e.g. active-only) is empty */
  emptyBecauseStatus?: boolean;
  onFocusTask?: (taskId: string) => void;
}) {
  return (
    <motion.ul layout className="space-y-3" aria-label="Task list">
      <AnimatePresence initial={false} mode="popLayout">
        {tasks.length === 0 ? (
          <motion.li
            key={
              noMatchFilters
                ? "filter-empty"
                : emptyBecauseStatus
                  ? "status-empty"
                  : "empty-state"
            }
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center"
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50"
            >
              <span className="text-xl">
                {noMatchFilters ? "🔍" : emptyBecauseStatus ? "✓" : "📝"}
              </span>
            </motion.div>
            <h3 className="mb-1 text-lg font-medium text-foreground">
              {noMatchFilters
                ? "Nothing matches"
                : emptyBecauseStatus
                  ? "Nothing in this view"
                  : "No tasks"}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {noMatchFilters
                ? "Try relaxing filters or reset them to see more tasks."
                : emptyBecauseStatus
                  ? "Switch status to All or Done, or loosen filters."
                  : "Add your first task to start planning your day."}
            </p>
            {noMatchFilters && onClearFilters ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-xl"
                onClick={onClearFilters}
              >
                Reset filters
              </Button>
            ) : null}
          </motion.li>
        ) : null}
        {tasks.map((task) => (
          <motion.li
            layout
            key={task.id}
            id={`task-row-${task.id}`}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.8,
            }}
          >
            <TaskRow
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdateTask={onUpdateTask}
              onFocusTask={onFocusTask}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
