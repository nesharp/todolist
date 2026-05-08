"use client";

import { motion, AnimatePresence } from "framer-motion";

import type { TodoAppProps } from "@/components/todo";
import {
  AddTaskBar,
  ErrorMessage,
  TaskList,
  TaskStats,
  TodoHeader,
  useTodoTasks,
} from "@/components/todo";

export function TodoApp({ initialTasks }: TodoAppProps) {
  const {
    tasks,
    newTask,
    error,
    isSaving,
    remaining,
    completed,
    total,
    setNewTask,
    addTask,
    toggleTask,
    deleteTask,
  } = useTodoTasks({ initialTasks });

  return (
    <div className="w-full">
      <motion.section
        layout
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-6 shadow-2xl backdrop-blur-xl md:p-10"
      >
        <TodoHeader />

        <AddTaskBar
          value={newTask}
          onChange={(next) => setNewTask(next)}
          onAdd={addTask}
          hasError={!!error}
        />

        <AnimatePresence mode="wait">
          {error && <ErrorMessage key="error" message={error} />}
        </AnimatePresence>

        <TaskStats
          activeCount={remaining}
          completedCount={completed}
          totalCount={total}
        />

        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
      </motion.section>
    </div>
  );
}
