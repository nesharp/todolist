import type { ProjectItem, TaskItem } from "@/lib/types";

export type UiTask = TaskItem & { isPending?: boolean };

export type TodoAppProps = {
  initialTasks: TaskItem[];
  initialProjects: ProjectItem[];
  activeProjectId: string | null;
  activeProjectLabel: string;
};

