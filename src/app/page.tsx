import { AppHeader } from "@/components/app-header";
import { TodoApp } from "@/components/todo-app";
import { getSavedThemePreference } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [tasks, savedTheme] = await Promise.all([
    prisma.task
      .findMany({
        orderBy: { createdAt: "desc" },
      })
      .catch(() => []),
    getSavedThemePreference(),
  ]);

  const serializedTasks = tasks.map((task) => ({
    id: task.id,
    text: task.text,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 md:px-8 md:pt-16">
        <AppHeader initialTheme={savedTheme} />
        <TodoApp initialTasks={serializedTasks} />
      </div>
    </div>
  );
}
