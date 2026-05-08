"use client";

import { Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border border-border/40 bg-background/40 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-accent/10 hover:shadow-md",
        task.completed && "bg-muted/30 opacity-80",
        task.isPending && "animate-pulse border-primary/20 bg-primary/5"
      )}
    >
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

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <div className="relative w-fit max-w-full">
          <motion.span
            animate={{ 
              color: task.completed ? "var(--muted-foreground)" : "var(--foreground)",
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
        <span className="text-xs text-muted-foreground/70">
          {formatTaskCreatedAt(task.createdAt)}
        </span>
      </div>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(task)}
        className="h-8 w-8 shrink-0 rounded-full text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      {task.isPending && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}
