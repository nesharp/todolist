import type {
  BreakKind,
  FocusPreset,
  FocusTimerContext,
} from "./types";

export function createIdleContext(preset: FocusPreset): FocusTimerContext {
  return {
    mode: { type: "idle" },
    completedFocusSessions: 0,
    preset,
  };
}

export function setPreset(ctx: FocusTimerContext, preset: FocusPreset): FocusTimerContext {
  return { ...ctx, preset };
}

export function start(ctx: FocusTimerContext, now: number): FocusTimerContext {
  if (ctx.mode.type !== "idle") return ctx;
  const ms = ctx.preset.focusMinutes * 60_000;
  return {
    ...ctx,
    mode: {
      type: "running",
      segment: "focus",
      endsAt: now + ms,
    },
  };
}

export function pause(ctx: FocusTimerContext, now: number): FocusTimerContext {
  if (ctx.mode.type !== "running") return ctx;
  const remainingMs = Math.max(0, ctx.mode.endsAt - now);
  return {
    ...ctx,
    mode: {
      type: "paused",
      segment: ctx.mode.segment,
      breakKind: ctx.mode.breakKind,
      remainingMs,
    },
  };
}

export function resume(ctx: FocusTimerContext, now: number): FocusTimerContext {
  if (ctx.mode.type !== "paused") return ctx;
  return {
    ...ctx,
    mode: {
      type: "running",
      segment: ctx.mode.segment,
      breakKind: ctx.mode.breakKind,
      endsAt: now + ctx.mode.remainingMs,
    },
  };
}

function nextBreakKind(
  completedFocusSessions: number,
  longBreakEvery: number
): BreakKind {
  if (longBreakEvery < 1) return "short";
  return completedFocusSessions % longBreakEvery === 0 ? "long" : "short";
}

export function advanceAfterPhaseComplete(
  ctx: FocusTimerContext,
  now: number
): FocusTimerContext {
  const { mode } = ctx;
  if (mode.type !== "running") return ctx;

  if (mode.segment === "focus") {
    const completedFocusSessions = ctx.completedFocusSessions + 1;
    const kind = nextBreakKind(completedFocusSessions, ctx.preset.longBreakEvery);
    const breakMinutes =
      kind === "long"
        ? ctx.preset.longBreakMinutes
        : ctx.preset.shortBreakMinutes;
    return {
      ...ctx,
      completedFocusSessions,
      mode: {
        type: "running",
        segment: "break",
        breakKind: kind,
        endsAt: now + breakMinutes * 60_000,
      },
    };
  }

  return {
    ...ctx,
    mode: {
      type: "running",
      segment: "focus",
      endsAt: now + ctx.preset.focusMinutes * 60_000,
    },
  };
}

export function tick(ctx: FocusTimerContext, now: number): FocusTimerContext {
  if (ctx.mode.type !== "running") return ctx;
  if (now < ctx.mode.endsAt) return ctx;
  return advanceAfterPhaseComplete(ctx, now);
}

export function skipPhase(ctx: FocusTimerContext, now: number): FocusTimerContext {
  if (ctx.mode.type === "idle") return ctx;
  if (ctx.mode.type === "paused") {
    const synthetic: FocusTimerContext = {
      ...ctx,
      mode: {
        type: "running",
        segment: ctx.mode.segment,
        breakKind: ctx.mode.breakKind,
        endsAt: now,
      },
    };
    return advanceAfterPhaseComplete(synthetic, now);
  }
  return advanceAfterPhaseComplete(ctx, now);
}

export function reset(ctx: FocusTimerContext): FocusTimerContext {
  return createIdleContext(ctx.preset);
}

/** Remaining milliseconds for display; 0 if idle */
export function getRemainingMs(ctx: FocusTimerContext, now: number): number {
  const { mode } = ctx;
  if (mode.type === "idle") return 0;
  if (mode.type === "paused") return mode.remainingMs;
  return Math.max(0, mode.endsAt - now);
}

export function isRunning(ctx: FocusTimerContext): boolean {
  return ctx.mode.type === "running";
}

export function isPaused(ctx: FocusTimerContext): boolean {
  return ctx.mode.type === "paused";
}

export function isIdle(ctx: FocusTimerContext): boolean {
  return ctx.mode.type === "idle";
}

export function getPhaseLabel(ctx: FocusTimerContext): string {
  const { mode } = ctx;
  if (mode.type === "idle") return "Ready";
  if (mode.segment === "focus") return "Focus";
  if (mode.breakKind === "long") return "Long break";
  return "Short break";
}

export function canApplyPresetChange(ctx: FocusTimerContext): boolean {
  return ctx.mode.type === "idle" || ctx.mode.type === "paused";
}
