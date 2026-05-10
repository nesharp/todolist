"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  useMemo,
  useCallback,
  useState,
  useLayoutEffect,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import type { TodoAppProps } from "@/components/todo";
import type { TaskViewFilter } from "@/components/todo/task-filters";
import {
  AddTaskBar,
  ErrorMessage,
  FocusTimerCard,
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

const LG_QUERY = "(min-width: 1024px)";

function useMediaMinLg() {
  const [matches, setMatches] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(LG_QUERY);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return matches;
}

export function TodoApp({
  initialTasks,
  initialProjects,
  activeProjectId,
  activeProjectLabel,
  initialFocusTimerPrefs,
  persistFocusTimerPrefs,
}: TodoAppProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [focusLinkedTaskId, setFocusLinkedTaskId] = useState<string | null>(
    null,
  );

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

  const isLg = useMediaMinLg();
  const focusTasks = tasks.filter((t) => !t.completed);
  const focusTimerProps = {
    tasks: focusTasks,
    linkedTaskId: focusLinkedTaskId,
    onLinkedTaskChange: setFocusLinkedTaskId,
    initialStoredPrefs: initialFocusTimerPrefs,
    persistFocusTimerPrefs,
  };

  const sectionMotion = {
    layout: true as const,
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <ProjectSidebar
        projects={initialProjects}
        activeProjectId={activeProjectId}
      />

      {isLg ? (
        <div className="flex w-full flex-row items-start gap-10">
          <motion.section
            {...sectionMotion}
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
              onFocusTask={(taskId) => setFocusLinkedTaskId(taskId)}
            />
          </motion.section>

          <aside className="sticky top-8 flex w-full max-w-xs shrink-0 flex-col gap-4 self-start">
            <FocusTimerCard {...focusTimerProps} />
            <ScheduleSidebar tasks={visibleTasks} />
          </aside>
        </div>
      ) : (
        <motion.section
          {...sectionMotion}
          className="relative min-w-0 w-full overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-4 shadow-2xl backdrop-blur-xl sm:p-6 md:p-10"
        >
          <TodoHeader activeProjectLabel={activeProjectLabel} />

          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-6">
              <AddTaskBar
                value={newTask}
                onChange={(next) => setNewTask(next)}
                onAdd={addTask}
                hasError={!!error}
              />

              <AnimatePresence mode="wait">
                {error && <ErrorMessage key="error" message={error} />}
              </AnimatePresence>
            </div>

            <FocusTimerCard {...focusTimerProps} />

            <div className="flex min-w-0 flex-col gap-6">
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
                <p className="mb-1 text-xs text-muted-foreground">
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
                onFocusTask={(taskId) => setFocusLinkedTaskId(taskId)}
              />
            </div>

            <ScheduleSidebar tasks={visibleTasks} />
          </div>
        </motion.section>
      )}
    </div>
  );
}
