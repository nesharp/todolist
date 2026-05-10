import type { FocusPreset, StoredFocusPrefs } from "./types";

export const DEFAULT_FOCUS_PRESETS: FocusPreset[] = [
  {
    id: "classic",
    name: "Classic",
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakEvery: 4,
  },
  {
    id: "deep",
    name: "Deep work",
    focusMinutes: 45,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    longBreakEvery: 2,
  },
  {
    id: "sprints",
    name: "Short sprints",
    focusMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 15,
    longBreakEvery: 4,
  },
];

export function defaultStoredPrefs(): StoredFocusPrefs {
  return {
    selectedPresetId: DEFAULT_FOCUS_PRESETS[0].id,
    presets: DEFAULT_FOCUS_PRESETS.map((p) => ({ ...p })),
  };
}
