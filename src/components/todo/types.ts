import type { TaskItem } from "@/lib/types";

export type UiTask = TaskItem & { isPending?: boolean };

export type TodoAppProps = {
  initialTasks: TaskItem[];
};

