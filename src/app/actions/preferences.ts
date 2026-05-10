"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { getSavedThemePreference } from "@/lib/preferences";
import type { AppTheme } from "@/lib/theme-presets";
import { isAppTheme } from "@/lib/theme-presets";
import { tryParseStoredFocusPrefs } from "@/lib/focus-timer";

export async function saveThemePreferenceAction(theme: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  if (!isAppTheme(theme)) {
    throw new Error("Invalid theme value");
  }

  await prisma.appPreference.upsert({
    where: { userId: session.user.id },
    update: { theme },
    create: { id: session.user.id, userId: session.user.id, theme },
  });

  revalidatePath("/");
}

export async function getThemePreferenceAction(): Promise<AppTheme> {
  const session = await auth.api.getSession({ headers: await headers() });
  return getSavedThemePreference(session?.user?.id);
}

export async function saveFocusTimerPrefsAction(raw: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const prefs = tryParseStoredFocusPrefs(raw);
  if (!prefs) throw new Error("Invalid focus timer prefs");

  await prisma.appPreference.upsert({
    where: { userId: session.user.id },
    update: { focusTimerPrefs: prefs },
    create: {
      id: session.user.id,
      userId: session.user.id,
      theme: "light",
      focusTimerPrefs: prefs,
    },
  });

  revalidatePath("/");
}
