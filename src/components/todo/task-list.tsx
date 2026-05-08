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
      <AnimatePresence initial={false} mode="popLayout">
        {tasks.length === 0 ? (
          <motion.li
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center"
          >
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5, ease: "easeInOut" }}
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50"
            >
              <span className="text-xl">📝</span>
            </motion.div>
            <h3 className="mb-1 text-lg font-medium text-foreground">No tasks</h3>
            <p className="text-sm text-muted-foreground">
              Add your first task to start planning your day.
            </p>
          </motion.li>
        ) : null}
        {tasks.map((task) => (
          <motion.li
            layout
            key={task.id}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30, 
              mass: 0.8 
            }}
          >
            <TaskRow task={task} onToggle={onToggle} onDelete={onDelete} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
