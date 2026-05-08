export const APP_THEMES = [
  "light",
  "dark",
  "ocean-light",
  "ocean-dark",
  "forest-light",
  "forest-dark",
  "sunset-light",
  "sunset-dark",
  "lavender-light",
  "lavender-dark",
  "rose-light",
  "rose-dark",
  "mint-light",
  "mint-dark",
  "amber-light",
  "amber-dark",
  "slate-light",
  "slate-dark",
  "cyber-light",
  "cyber-dark",
  "mono-light",
  "mono-dark",
] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export function isAppTheme(value: string): value is AppTheme {
  return (APP_THEMES as readonly string[]).includes(value);
}
