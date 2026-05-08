"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { UiTask } from "./types";
import { TaskRow } from "./task-row";

export function TaskList({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: UiTask[];
  onToggle: (task: UiTask) => void;
  onDelete: (task: UiTask) => void;
}) {
  return (
    <motion.ul layout className="space-y-3">
      <AnimatePresence initial={false}>
        {tasks.length === 0 ? (
          <motion.li
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <span className="text-xl">📝</span>
            </div>
            <h3 className="mb-1 text-lg font-medium text-foreground">Немає задач</h3>
            <p className="text-sm text-muted-foreground">
              Додайте свою першу задачу, щоб почати планувати день.
            </p>
          </motion.li>
        ) : null}
        {tasks.map((task) => (
          <motion.li
            layout
            key={task.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <TaskRow task={task} onToggle={onToggle} onDelete={onDelete} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

