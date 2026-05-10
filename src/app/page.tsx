import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { TodoApp } from "@/components/todo-app";
import { getSavedThemePreference } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { toProjectItem, toTaskItem } from "@/lib/task-utils";

export const dynamic = "force-dynamic";

function firstString(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ project?: string | string[] }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const sp = await searchParams;
  const rawProject = firstString(sp.project)?.trim();

  const userId = session?.user?.id;

  const [projectsRows, savedTheme] = await Promise.all([
    userId
      ? prisma.project
          .findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
          })
          .catch(() => [])
      : Promise.resolve([]),
    getSavedThemePreference(session?.user?.id),
  ]);

  const initialProjects = projectsRows.map(toProjectItem);

  let activeProjectId: string | null = null;
  if (
    rawProject &&
    rawProject.toLowerCase() !== "inbox" &&
    initialProjects.some((p) => p.id === rawProject)
  ) {
    activeProjectId = rawProject;
  }

  const tasks = userId
    ? await prisma.task
        .findMany({
          where: {
            userId,
            projectId: activeProjectId,
          },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => [])
    : [];

  const serializedTasks = tasks.map(toTaskItem);

  const activeProjectLabel =
    activeProjectId === null
      ? "Inbox"
      : (initialProjects.find((p) => p.id === activeProjectId)?.name ?? "Inbox");

  return (
    <div className="min-h-screen w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 md:px-8 md:pt-16">
        <AppHeader initialTheme={savedTheme} />
        <TodoApp
          key={activeProjectId ?? "inbox"}
          initialTasks={serializedTasks}
          initialProjects={initialProjects}
          activeProjectId={activeProjectId}
          activeProjectLabel={activeProjectLabel}
        />
      </div>
    </div>
  );
}
