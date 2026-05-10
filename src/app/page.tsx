import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { TodoApp } from "@/components/todo-app";
import { getSavedThemePreference } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { toTaskItem } from "@/lib/task-utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  const [tasks, savedTheme] = await Promise.all([
    session?.user?.id
      ? prisma.task
          .findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
          })
          .catch(() => [])
      : Promise.resolve([]),
    getSavedThemePreference(session?.user?.id),
  ]);

  const serializedTasks = tasks.map(toTaskItem);

  return (
    <div className="min-h-screen w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 md:px-8 md:pt-16">
        <AppHeader initialTheme={savedTheme} />
        <TodoApp initialTasks={serializedTasks} />
      </div>
    </div>
  );
}
