export type FocusPreset = {
  id: string;
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** After every N completed focus sessions, take a long break */
  longBreakEvery: number;
};

export type BreakKind = "short" | "long";

export type FocusSegment = "focus" | "break";

export type FocusTimerMode =
  | { type: "idle" }
  | {
      type: "running";
      segment: FocusSegment;
      breakKind?: BreakKind;
      endsAt: number;
    }
  | {
      type: "paused";
      segment: FocusSegment;
      breakKind?: BreakKind;
      remainingMs: number;
    };

export type FocusTimerContext = {
  mode: FocusTimerMode;
  /** Increments when a focus phase completes */
  completedFocusSessions: number;
  preset: FocusPreset;
};

export const FOCUS_TIMER_STORAGE_KEY = "todolist-focus-timer-prefs-v1";

export type StoredFocusPrefs = {
  selectedPresetId: string;
  presets: FocusPreset[];
};
