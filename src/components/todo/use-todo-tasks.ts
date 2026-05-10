"use client";

import { useMemo, useState } from "react";

import type { CreateTaskOptions, UpdateTaskPayload } from "@/app/actions/tasks";
import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskAction,
  updateTaskAction,
} from "@/app/actions/tasks";
import { normalizeLabels } from "@/lib/task-utils";

import type { UiTask } from "./types";
import {
  createOptimisticTask,
  isTempTaskId,
  sortByCreatedAtDesc,
} from "./utils";

type UseTodoTasksArgs = {
  initialTasks: UiTask[];
  activeProjectId: string | null;
};

export function useTodoTasks({ initialTasks, activeProjectId }: UseTodoTasksArgs) {
  const [tasks, setTasks] = useState<UiTask[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mutationCount, setMutationCount] = useState(0);

  const isSaving = mutationCount > 0;

  const beginMutation = () => setMutationCount((v) => v + 1);
  const endMutation = () =>
    setMutationCount((v) => {
      if (v <= 0) return 0;
      return v - 1;
    });

  const remaining = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks]
  );
  const completed = tasks.length - remaining;

  const addTask = (createOptions?: CreateTaskOptions) => {
    const text = newTask.trim();
    if (text.length < 2) {
      setError("Enter at least 2 characters.");
      return;
    }

    const labels = normalizeLabels(createOptions?.labels ?? []);
    const optimisticId = `temp-${crypto.randomUUID()}`;
    const optimisticTask = createOptimisticTask(text, optimisticId, {
      deadline: createOptions?.deadline ?? null,
      priority: createOptions?.priority,
      labels,
      important: createOptions?.important,
      projectId: activeProjectId,
    });

    setError(null);
    setNewTask("");
    setTasks((prev) => sortByCreatedAtDesc([optimisticTask, ...prev]));

    beginMutation();
    void (async () => {
      try {
        const createdTask = await createTaskAction(text, {
          ...createOptions,
          labels,
          projectId: activeProjectId,
        });
        setTasks((prev) =>
          sortByCreatedAtDesc(
            prev.map((task) =>
              task.id === optimisticId
                ? { ...createdTask, isPending: false }
                : task
            )
          )
        );
      } catch {
        setTasks((prev) => prev.filter((task) => task.id !== optimisticId));
        setNewTask(text);
        setError("Failed to save task to database.");
      } finally {
        endMutation();
      }
    })();
  };

  const updateTask = (task: UiTask, patch: Omit<UpdateTaskPayload, "id">) => {
    if (isTempTaskId(task.id)) return;

    const previous = { ...task };

    setError(null);
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? {
              ...item,
              ...patch,
              isPending: true,
            }
          : item
      )
    );

    beginMutation();
    void (async () => {
      try {
        const updated = await updateTaskAction({ id: task.id, ...patch });
        setTasks((prev) =>
          sortByCreatedAtDesc(
            prev.map((item) =>
              item.id === task.id ? { ...updated, isPending: false } : item
            )
          )
        );
      } catch {
        setTasks((prev) =>
          prev.map((item) =>
            item.id === task.id
              ? { ...previous, isPending: false }
              : item
          )
        );
        setError("Failed to update task details.");
      } finally {
        endMutation();
      }
    })();
  };

  const toggleTask = (task: UiTask) => {
    if (isTempTaskId(task.id)) return;

    const previousCompleted = task.completed;
    const nextCompleted = !task.completed;

    setError(null);
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? { ...item, completed: nextCompleted, isPending: true }
          : item
      )
    );

    beginMutation();
    void (async () => {
      try {
        await toggleTaskAction(task.id, nextCompleted);
        setTasks((prev) =>
          prev.map((item) =>
            item.id === task.id ? { ...item, isPending: false } : item
          )
        );
      } catch {
        setTasks((prev) =>
          prev.map((item) =>
            item.id === task.id
              ? {
                  ...item,
                  completed: previousCompleted,
                  isPending: false,
                }
              : item
          )
        );
        setError("Failed to update task.");
      } finally {
        endMutation();
      }
    })();
  };

  const deleteTask = (task: UiTask) => {
    setError(null);

    if (isTempTaskId(task.id)) {
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
      return;
    }

    const deletedTask = task;
    setTasks((prev) => prev.filter((item) => item.id !== task.id));

    beginMutation();
    void (async () => {
      try {
        await deleteTaskAction(task.id);
      } catch {
        setTasks((prev) => {
          const exists = prev.some((item) => item.id === deletedTask.id);
          if (exists) return prev;
          return sortByCreatedAtDesc([
            ...prev,
            { ...deletedTask, isPending: false },
          ]);
        });
        setError("Failed to delete task, please try again.");
      } finally {
        endMutation();
      }
    })();
  };

  return {
    tasks,
    newTask,
    error,
    isSaving,
    remaining,
    completed,
    total: tasks.length,
    setNewTask,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearError: () => setError(null),
  };
}
