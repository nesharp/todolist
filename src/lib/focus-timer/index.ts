export type {
  BreakKind,
  FocusPreset,
  FocusSegment,
  FocusTimerContext,
  FocusTimerMode,
  StoredFocusPrefs,
} from "./types";
export { FOCUS_TIMER_STORAGE_KEY } from "./types";

export {
  advanceAfterPhaseComplete,
  canApplyPresetChange,
  createIdleContext,
  getPhaseLabel,
  getRemainingMs,
  isIdle,
  isPaused,
  isRunning,
  pause,
  reset,
  resume,
  setPreset,
  skipPhase,
  start,
  tick,
} from "./machine";

export { DEFAULT_FOCUS_PRESETS, defaultStoredPrefs } from "./presets";

export { tryParseStoredFocusPrefs } from "./parse";
