"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

import type { TodoAppProps } from "@/components/todo";
import {
  AddTaskBar,
  ErrorMessage,
  ScheduleSidebar,
  TaskList,
  TaskStats,
  TodoHeader,
  useTodoTasks,
  defaultTaskViewFilter,
  filterTasksForView,
  isNonDefaultTaskFilter,
  TaskFiltersBar,
} from "@/components/todo";

export function TodoApp({ initialTasks }: TodoAppProps) {
  const {
    tasks,
    newTask,
    error,
    remaining,
    completed,
    total,
    setNewTask,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useTodoTasks({ initialTasks });

  const [viewFilter, setViewFilter] = useState(defaultTaskViewFilter);

  const visibleTasks = useMemo(
    () => filterTasksForView(tasks, viewFilter),
    [tasks, viewFilter]
  );

  const filterNoMatch =
    tasks.length > 0 &&
    visibleTasks.length === 0 &&
    isNonDefaultTaskFilter(viewFilter);

  const emptyBecauseStatus =
    tasks.length > 0 &&
    visibleTasks.length === 0 &&
    !filterNoMatch;

  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <motion.section
        layout
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative min-w-0 flex-1 overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-6 shadow-2xl backdrop-blur-xl md:p-10"
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

        <TaskFiltersBar tasks={tasks} value={viewFilter} onChange={setViewFilter} />

        {tasks.length > 0 ? (
          <p className="mb-3 text-xs text-muted-foreground">
            Showing {visibleTasks.length} of {tasks.length} tasks
          </p>
        ) : null}

        <TaskList
          tasks={visibleTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onUpdateTask={updateTask}
          noMatchFilters={filterNoMatch}
          onClearFilters={() => setViewFilter(defaultTaskViewFilter())}
          emptyBecauseStatus={emptyBecauseStatus}
        />
      </motion.section>

      <ScheduleSidebar tasks={visibleTasks} />
    </div>
  );
}
