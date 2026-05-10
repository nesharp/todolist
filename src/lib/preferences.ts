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
