import type { StoredFocusPrefs } from "@/lib/focus-timer";
import { tryParseStoredFocusPrefs } from "@/lib/focus-timer";
import { prisma } from "@/lib/prisma";
import type { AppTheme } from "@/lib/theme-presets";
import { isAppTheme } from "@/lib/theme-presets";

export async function getSavedThemePreference(userId?: string): Promise<AppTheme> {
  if (!userId) return "light";
  try {
    const preference = await prisma.appPreference.findUnique({
      where: { userId },
    });

    if (preference && isAppTheme(preference.theme)) {
      return preference.theme;
    }
  } catch {
    // Database can be unavailable during first setup.
  }

  return "light";
}

export async function getSavedFocusTimerPrefs(
  userId?: string,
): Promise<StoredFocusPrefs | undefined> {
  if (!userId) return undefined;
  try {
    const preference = await prisma.appPreference.findUnique({
      where: { userId },
    });
    const raw = preference?.focusTimerPrefs;
    if (raw == null) return undefined;
    const parsed = tryParseStoredFocusPrefs(raw);
    return parsed ?? undefined;
  } catch {
    return undefined;
  }
}
