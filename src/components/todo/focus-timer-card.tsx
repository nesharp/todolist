"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FocusTimerContext, StoredFocusPrefs } from "@/lib/focus-timer";

import type { UiTask } from "./types";
import { useFocusTimer } from "./use-focus-timer";

function formatClock(ms: number): string {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function phaseTotalMs(ctx: FocusTimerContext): number {
  const { mode } = ctx;
  if (mode.type === "idle") return ctx.preset.focusMinutes * 60_000;
  if (mode.segment === "focus") return ctx.preset.focusMinutes * 60_000;
  if (mode.breakKind === "long") return ctx.preset.longBreakMinutes * 60_000;
  return ctx.preset.shortBreakMinutes * 60_000;
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function FocusTimerCard({
  tasks,
  linkedTaskId,
  onLinkedTaskChange,
  initialStoredPrefs,
  persistFocusTimerPrefs,
}: {
  tasks: UiTask[];
  linkedTaskId: string | null;
  onLinkedTaskChange: (taskId: string | null) => void;
  initialStoredPrefs?: StoredFocusPrefs;
  persistFocusTimerPrefs?: boolean;
}) {
  const [customOpen, setCustomOpen] = useState(false);

  useEffect(() => {
    if (!linkedTaskId) return;
    const exists = tasks.some((t) => t.id === linkedTaskId);
    if (!exists) onLinkedTaskChange(null);
  }, [tasks, linkedTaskId, onLinkedTaskChange]);

  const {
    ctx,
    storedPrefs,
    selectedPreset,
    remainingMs,
    phaseLabel,
    canEditPreset,
    isRunning,
    isPaused,
    isIdle,
    selectPresetId,
    commitPresetPatch,
    onStart,
    onPause,
    onResume,
    onSkip,
    onReset,
  } = useFocusTimer({
    initialStoredPrefs,
    persistFocusTimerPrefs,
  });

  const preset = selectedPreset;

  const totalMs = phaseTotalMs(ctx);
  const idleFullMs = preset.focusMinutes * 60_000;
  const displayRemaining = isIdle ? idleFullMs : remainingMs;
  const progress = totalMs > 0 ? 1 - displayRemaining / totalMs : 0;
  const ringProgress = Math.min(1, Math.max(0, progress));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const linkedTitle = useMemo(() => {
    if (!linkedTaskId) return null;
    const t = tasks.find((x) => x.id === linkedTaskId);
    return t?.text ?? null;
  }, [tasks, linkedTaskId]);

  const controlsLocked = isRunning;

  return (
    <Card
      data-testid="focus-timer-card"
      size="sm"
      className="rounded-2xl border border-border/40 bg-background/40 shadow-sm backdrop-blur-sm"
    >
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Timer className="h-4 w-4 text-muted-foreground" aria-hidden />
          Focus timer
        </CardTitle>
        {linkedTitle ? (
          <p
            className="line-clamp-2 text-xs text-muted-foreground"
            title={linkedTitle}
          >
            {linkedTitle}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No task selected</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative grid h-36 w-36 place-items-center"
            aria-hidden
          >
            <svg
              viewBox="0 0 100 100"
              className="col-start-1 row-start-1 h-full w-full -rotate-90"
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="fill-none stroke-muted/50"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="fill-none stroke-primary transition-[stroke-dashoffset] duration-300 ease-linear"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - ringProgress)}
              />
            </svg>
            <div className="col-start-1 row-start-1 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-semibold tabular-nums tracking-tight">
                {formatClock(displayRemaining)}
              </span>
              <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                {phaseLabel}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-2">
            {isIdle ? (
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={onStart}
              >
                Start
              </Button>
            ) : null}
            {isRunning ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-xl"
                onClick={onPause}
              >
                Pause
              </Button>
            ) : null}
            {isPaused ? (
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={onResume}
              >
                Resume
              </Button>
            ) : null}
            {!isIdle ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={onSkip}
                >
                  Skip phase
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={onReset}
                >
                  Reset
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Preset
            <select
              className={cn(
                "mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
                controlsLocked && "cursor-not-allowed opacity-60",
              )}
              value={storedPrefs.selectedPresetId}
              disabled={!canEditPreset || controlsLocked}
              onChange={(e) => selectPresetId(e.target.value)}
            >
              {storedPrefs.presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-muted-foreground">
            Link task
            <select
              className={cn(
                "mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
                controlsLocked && "cursor-not-allowed opacity-60",
              )}
              value={linkedTaskId ?? ""}
              disabled={controlsLocked}
              onChange={(e) => {
                const v = e.target.value;
                onLinkedTaskChange(v === "" ? null : v);
              }}
            >
              <option value="">No task</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.text}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setCustomOpen((o) => !o)}
            aria-expanded={customOpen}
          >
            Custom durations
            {customOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" />
            )}
          </button>
          {customOpen ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-medium text-muted-foreground">
                Focus (min)
                <Input
                  type="number"
                  min={1}
                  max={180}
                  className="mt-1 h-9 rounded-xl"
                  disabled={!canEditPreset || controlsLocked}
                  value={preset.focusMinutes}
                  onChange={(e) =>
                    commitPresetPatch(preset.id, {
                      focusMinutes: clampInt(Number(e.target.value), 1, 180),
                    })
                  }
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Short break (min)
                <Input
                  type="number"
                  min={1}
                  max={120}
                  className="mt-1 h-9 rounded-xl"
                  disabled={!canEditPreset || controlsLocked}
                  value={preset.shortBreakMinutes}
                  onChange={(e) =>
                    commitPresetPatch(preset.id, {
                      shortBreakMinutes: clampInt(
                        Number(e.target.value),
                        1,
                        120,
                      ),
                    })
                  }
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Long break (min)
                <Input
                  type="number"
                  min={1}
                  max={120}
                  className="mt-1 h-9 rounded-xl"
                  disabled={!canEditPreset || controlsLocked}
                  value={preset.longBreakMinutes}
                  onChange={(e) =>
                    commitPresetPatch(preset.id, {
                      longBreakMinutes: clampInt(
                        Number(e.target.value),
                        1,
                        120,
                      ),
                    })
                  }
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Long break every N focus blocks
                <Input
                  type="number"
                  min={1}
                  max={20}
                  className="mt-1 h-9 rounded-xl"
                  disabled={!canEditPreset || controlsLocked}
                  value={preset.longBreakEvery}
                  onChange={(e) =>
                    commitPresetPatch(preset.id, {
                      longBreakEvery: clampInt(Number(e.target.value), 1, 20),
                    })
                  }
                />
              </label>
            </div>
          ) : null}
        </div>

        {!isIdle ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            Sessions completed this cycle: {ctx.completedFocusSessions}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
