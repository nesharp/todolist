export type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type TaskItem = {
  id: string;
  text: string;
  completed: boolean;
  important: boolean;
  deadline: string | null;
  priority: TaskPriority;
  labels: string[];
  createdAt: string;
  updatedAt: string;
};
