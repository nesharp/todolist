"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { APP_PREF_ID, getSavedThemePreference } from "@/lib/preferences";
import type { AppTheme } from "@/lib/theme-presets";
import { isAppTheme } from "@/lib/theme-presets";

export async function saveThemePreferenceAction(theme: string): Promise<void> {
  if (!isAppTheme(theme)) {
    throw new Error("Invalid theme value");
  }

  await prisma.appPreference.upsert({
    where: { id: APP_PREF_ID },
    update: { theme },
    create: { id: APP_PREF_ID, theme },
  });

  revalidatePath("/");
}

export async function getThemePreferenceAction(): Promise<AppTheme> {
  return getSavedThemePreference();
}
