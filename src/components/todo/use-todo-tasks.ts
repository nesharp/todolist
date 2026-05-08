"use client";

import { useMemo, useState } from "react";

import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskAction,
} from "@/app/actions/tasks";

import type { UiTask } from "./types";
import { createOptimisticTask, isTempTaskId, sortByCreatedAtDesc } from "./utils";

type UseTodoTasksArgs = {
  initialTasks: UiTask[];
};

export function useTodoTasks({ initialTasks }: UseTodoTasksArgs) {
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

  const addTask = () => {
    const text = newTask.trim();
    if (text.length < 2) {
      setError("Введи мінімум 2 символи.");
      return;
    }

    const optimisticId = `temp-${crypto.randomUUID()}`;
    const optimisticTask = createOptimisticTask(text, optimisticId);

    setError(null);
    setNewTask("");
    setTasks((prev) => sortByCreatedAtDesc([optimisticTask, ...prev]));

    beginMutation();
    void (async () => {
      try {
        const createdTask = await createTaskAction(text);
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
        setError("Не вдалося зберегти задачу в базі.");
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
        setError("Оновлення не збереглося в базі.");
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
        setError("Видалення не виконалось, спробуй ще раз.");
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
    toggleTask,
    deleteTask,
    clearError: () => setError(null),
  };
}

