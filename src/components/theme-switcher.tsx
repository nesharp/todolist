"use client";

import { Check } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { APP_THEMES, type AppTheme } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {APP_THEMES.map((themeName) => {
        const active = theme === themeName;

        return (
          <button
            key={themeName}
            type="button"
            onClick={() => setTheme(themeName as AppTheme)}
            className={cn(
              "flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-left text-sm",
              "transition-colors hover:bg-accent",
              active && "border-primary"
            )}
          >
            <span className="capitalize">{themeName.replace(/-/g, " ")}</span>
            {active ? <Check className="h-4 w-4 text-primary" /> : null}
          </button>
        );
      })}
    </div>
  );
}
