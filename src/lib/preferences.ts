import { prisma } from "@/lib/prisma";
import type { AppTheme } from "@/lib/theme-presets";
import { isAppTheme } from "@/lib/theme-presets";

const APP_PREF_ID = "global";

export async function getSavedThemePreference(): Promise<AppTheme> {
  try {
    const preference = await prisma.appPreference.findUnique({
      where: { id: APP_PREF_ID },
    });

    if (preference && isAppTheme(preference.theme)) {
      return preference.theme;
    }
  } catch {
    // Database can be unavailable during first setup.
  }

  return "light";
}

export { APP_PREF_ID };
