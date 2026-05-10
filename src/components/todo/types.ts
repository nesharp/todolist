import type { ProjectItem, TaskItem } from "@/lib/types";
import type { StoredFocusPrefs } from "@/lib/focus-timer";

export type UiTask = TaskItem & { isPending?: boolean };

export type TodoAppProps = {
  initialTasks: TaskItem[];
  initialProjects: ProjectItem[];
  activeProjectId: string | null;
  activeProjectLabel: string;
  initialFocusTimerPrefs?: StoredFocusPrefs;
  persistFocusTimerPrefs?: boolean;
};

