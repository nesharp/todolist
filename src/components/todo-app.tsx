"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import type { TodoAppProps } from "@/components/todo";
import type { TaskViewFilter } from "@/components/todo/task-filters";
import {
  AddTaskBar,
  ErrorMessage,
  ProjectSidebar,
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

export function TodoApp({
  initialTasks,
  initialProjects,
  activeProjectId,
  activeProjectLabel,
}: TodoAppProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  } = useTodoTasks({ initialTasks, activeProjectId });

  const viewFilter = useMemo<TaskViewFilter>(() => {
    return {
      completion: (searchParams.get("completion") as any) || "active",
      label: searchParams.get("label") || null,
      priority: (searchParams.get("priority") as any) || "ALL",
      importantOnly: searchParams.get("important") === "true",
    };
  }, [searchParams]);

  const setViewFilter = useCallback(
    (filter: TaskViewFilter) => {
      const params = new URLSearchParams(searchParams.toString());

      if (filter.completion === "active") params.delete("completion");
      else params.set("completion", filter.completion);

      if (!filter.label) params.delete("label");
      else params.set("label", filter.label);

      if (filter.priority === "ALL") params.delete("priority");
      else params.set("priority", filter.priority);

      if (!filter.importantOnly) params.delete("important");
      else params.set("important", "true");

      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const visibleTasks = useMemo(
    () => filterTasksForView(tasks, viewFilter),
    [tasks, viewFilter],
  );

  const filterNoMatch =
    tasks.length > 0 &&
    visibleTasks.length === 0 &&
    isNonDefaultTaskFilter(viewFilter);

  const emptyBecauseStatus =
    tasks.length > 0 && visibleTasks.length === 0 && !filterNoMatch;

  return (
    <div className="flex w-full flex-col gap-8">
      <ProjectSidebar
        projects={initialProjects}
        activeProjectId={activeProjectId}
      />

      <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <motion.section
          layout
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-w-0 flex-1 overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-6 shadow-2xl backdrop-blur-xl md:p-10"
        >
          <TodoHeader activeProjectLabel={activeProjectLabel} />

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

          <TaskFiltersBar
            tasks={tasks}
            value={viewFilter}
            onChange={setViewFilter}
          />

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
    </div>
  );
}
