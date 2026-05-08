"use client";

import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useState, useTransition } from "react";

import { saveThemePreferenceAction } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_THEMES, type AppTheme, isAppTheme } from "@/lib/theme-presets";

type AppHeaderProps = {
  initialTheme: AppTheme;
};

const labelsEn: Record<AppTheme, string> = {
  light: "Light",
  dark: "Dark",
  "ocean-light": "Ocean (Day)",
  "ocean-dark": "Ocean (Night)",
  "forest-light": "Forest (Day)",
  "forest-dark": "Forest (Night)",
  "sunset-light": "Sunset (Day)",
  "sunset-dark": "Sunset (Night)",
  "lavender-light": "Lavender (Day)",
  "lavender-dark": "Lavender (Night)",
  "rose-light": "Rose (Day)",
  "rose-dark": "Rose (Night)",
  "mint-light": "Mint (Day)",
  "mint-dark": "Mint (Night)",
  "amber-light": "Amber (Day)",
  "amber-dark": "Amber (Night)",
  "slate-light": "Slate (Day)",
  "slate-dark": "Slate (Night)",
  "cyber-light": "Cyber (Day)",
  "cyber-dark": "Cyber (Night)",
  "mono-light": "Mono (Day)",
  "mono-dark": "Mono (Night)",
};

export function AppHeader({ initialTheme }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, startTransition] = useTransition();

  const activeTheme: AppTheme = useMemo(() => {
    if (theme && isAppTheme(theme)) return theme;
    return initialTheme;
  }, [theme, initialTheme]);

  const selectedLabel = labelsEn[activeTheme];

  const onThemeChange = (nextTheme: AppTheme) => {
    setTheme(nextTheme);

    startTransition(async () => {
      try {
        await saveThemePreferenceAction(nextTheme);
      } catch {
        /* persistence optional */
      }
    });

    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10 flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="mr-1.5 flex h-2 w-2 rounded-full bg-primary"></span>
          Todo App
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Todo List
        </h1>
      </div>

      <div className="relative sm:ml-auto">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 rounded-xl px-4 text-sm sm:w-auto"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select color theme"
        >
          <Palette className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-left">
            {selectedLabel}
          </span>
        </Button>

        {isOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-20 cursor-default bg-transparent"
              aria-label="Close theme selection"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="absolute right-0 top-[calc(100%+0.5rem)] z-30 max-h-[min(22rem,70vh)] w-full min-w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-border bg-popover shadow-lg sm:min-w-[22rem]"
              role="listbox"
            >
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {APP_THEMES.length} palettes — choose your style
                </p>
                {isSaving ? (
                  <span className="text-xs text-muted-foreground">
                    saving...
                  </span>
                ) : null}
              </div>
              <div className="grid max-h-[min(18rem,55vh)] grid-cols-1 gap-1 overflow-y-auto p-2 sm:grid-cols-2">
                {APP_THEMES.map((themeName) => {
                  const active = activeTheme === themeName;
                  return (
                    <button
                      key={themeName}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => onThemeChange(themeName)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-left text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        active && "border-primary bg-accent/80"
                      )}
                    >
                      <span className="truncate">{labelsEn[themeName]}</span>
                      {active ? (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </motion.header>
  );
}
