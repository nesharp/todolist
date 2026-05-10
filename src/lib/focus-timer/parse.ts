import type { FocusPreset, StoredFocusPrefs } from "./types";

function isValidPreset(p: unknown): p is FocusPreset {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.focusMinutes === "number" &&
    typeof o.shortBreakMinutes === "number" &&
    typeof o.longBreakMinutes === "number" &&
    typeof o.longBreakEvery === "number"
  );
}

export function tryParseStoredFocusPrefs(
  value: unknown,
): StoredFocusPrefs | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  if (typeof o.selectedPresetId !== "string") return null;
  if (!Array.isArray(o.presets) || o.presets.length === 0) return null;
  const presets = o.presets.filter(isValidPreset);
  if (presets.length === 0) return null;
  if (!presets.some((p) => p.id === o.selectedPresetId)) return null;
  return {
    selectedPresetId: o.selectedPresetId,
    presets: presets.map((p) => ({ ...p })),
  };
}
