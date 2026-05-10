"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { saveFocusTimerPrefsAction } from "@/app/actions/preferences";
import {
  type FocusPreset,
  type FocusTimerContext,
  type StoredFocusPrefs,
  FOCUS_TIMER_STORAGE_KEY,
  canApplyPresetChange,
  createIdleContext,
  defaultStoredPrefs,
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
} from "@/lib/focus-timer";

function loadStoredPrefs(): StoredFocusPrefs {
  if (typeof window === "undefined") return defaultStoredPrefs();
  try {
    const raw = localStorage.getItem(FOCUS_TIMER_STORAGE_KEY);
    if (!raw) return defaultStoredPrefs();
    const parsed = JSON.parse(raw) as StoredFocusPrefs;
    if (
      !parsed ||
      typeof parsed.selectedPresetId !== "string" ||
      !Array.isArray(parsed.presets) ||
      parsed.presets.length === 0
    ) {
      return defaultStoredPrefs();
    }
    return {
      selectedPresetId: parsed.selectedPresetId,
      presets: parsed.presets.map((p) => ({ ...p })),
    };
  } catch {
    return defaultStoredPrefs();
  }
}

function presetById(
  prefs: StoredFocusPrefs,
  id: string,
): FocusPreset | undefined {
  return prefs.presets.find((p) => p.id === id);
}

export type UseFocusTimerOptions = {
  initialStoredPrefs?: StoredFocusPrefs;
  persistFocusTimerPrefs?: boolean;
};

export function useFocusTimer(options?: UseFocusTimerOptions) {
  const serverPrefs = options?.initialStoredPrefs;
  const persistFocusTimerPrefs = options?.persistFocusTimerPrefs ?? false;

  const [storedPrefs, setStoredPrefs] = useState<StoredFocusPrefs>(() =>
    serverPrefs ?? defaultStoredPrefs(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [ctx, setCtx] = useState<FocusTimerContext>(() => {
    const base = serverPrefs ?? defaultStoredPrefs();
    const preset =
      presetById(base, base.selectedPresetId) ?? base.presets[0];
    return createIdleContext(preset);
  });

  useEffect(() => {
    if (serverPrefs) {
      const preset =
        presetById(serverPrefs, serverPrefs.selectedPresetId) ??
        serverPrefs.presets[0];
      queueMicrotask(() => {
        setStoredPrefs(serverPrefs);
        setCtx((prev) =>
          isIdle(prev) ? createIdleContext(preset) : setPreset(prev, preset),
        );
        setHydrated(true);
      });
      return;
    }
    queueMicrotask(() => {
      const loaded = loadStoredPrefs();
      setStoredPrefs(loaded);
      const preset =
        presetById(loaded, loaded.selectedPresetId) ?? loaded.presets[0];
      setCtx((prev) =>
        isIdle(prev) ? createIdleContext(preset) : setPreset(prev, preset),
      );
      setHydrated(true);
    });
  }, [serverPrefs]);

  useEffect(() => {
    if (!hydrated) return;
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(
          FOCUS_TIMER_STORAGE_KEY,
          JSON.stringify(storedPrefs),
        );
      } catch {
        // ignore quota / private mode
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [storedPrefs, hydrated]);

  useEffect(() => {
    if (!hydrated || !persistFocusTimerPrefs) return;
    const handle = window.setTimeout(() => {
      saveFocusTimerPrefsAction(storedPrefs).catch(() => {});
    }, 800);
    return () => window.clearTimeout(handle);
  }, [storedPrefs, hydrated, persistFocusTimerPrefs]);

  const selectedPreset = useMemo(() => {
    return (
      presetById(storedPrefs, storedPrefs.selectedPresetId) ??
      storedPrefs.presets[0]
    );
  }, [storedPrefs]);

  const running = isRunning(ctx);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNowTick(t);
      setCtx((c) => tick(c, t));
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const remainingMs = getRemainingMs(ctx, nowTick);
  const phaseLabel = useMemo(() => getPhaseLabel(ctx), [ctx]);
  const canEditPreset = canApplyPresetChange(ctx);

  const selectPresetId = useCallback((presetId: string) => {
    setStoredPrefs((prev) => {
      const next = { ...prev, selectedPresetId: presetId };
      const preset = presetById(next, presetId) ?? next.presets[0];
      setCtx((c) => (canApplyPresetChange(c) ? setPreset(c, preset) : c));
      return next;
    });
  }, []);

  const commitPresetPatch = useCallback(
    (presetId: string, patch: Partial<Omit<FocusPreset, "id" | "name">>) => {
      setStoredPrefs((prev) => {
        const presets = prev.presets.map((p) =>
          p.id === presetId ? { ...p, ...patch } : p,
        );
        const next = { ...prev, presets };
        const updated = presets.find((p) => p.id === presetId);
        if (updated && presetId === prev.selectedPresetId) {
          setCtx((c) => (canApplyPresetChange(c) ? setPreset(c, updated) : c));
        }
        return next;
      });
    },
    [],
  );

  const onStart = useCallback(() => {
    setCtx((c) => start(c, Date.now()));
  }, []);

  const onPause = useCallback(() => {
    setCtx((c) => pause(c, Date.now()));
  }, []);

  const onResume = useCallback(() => {
    setCtx((c) => resume(c, Date.now()));
  }, []);

  const onSkip = useCallback(() => {
    setCtx((c) => skipPhase(c, Date.now()));
  }, []);

  const onReset = useCallback(() => {
    setCtx((c) => reset(c));
  }, []);

  return {
    ctx,
    storedPrefs,
    selectedPreset,
    remainingMs,
    phaseLabel,
    canEditPreset,
    isRunning: running,
    isPaused: isPaused(ctx),
    isIdle: isIdle(ctx),
    selectPresetId,
    commitPresetPatch,
    onStart,
    onPause,
    onResume,
    onSkip,
    onReset,
  };
}
