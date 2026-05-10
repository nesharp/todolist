"use client";

import { X } from "lucide-react";
import { useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MAX_TASK_LABELS, normalizeLabels } from "@/lib/task-utils";
import { cn } from "@/lib/utils";

type LabelChipsInputProps = {
  labels: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Roomier padding (e.g. add-task expanded panel) */
  variant?: "default" | "comfortable";
  inputAriaLabel?: string;
};

export function LabelChipsInput({
  labels,
  onChange,
  disabled,
  placeholder = "Type a label and press Enter",
  className,
  variant = "default",
  inputAriaLabel = "Task label",
}: LabelChipsInputProps) {
  const [draft, setDraft] = useState("");

  const commitDraft = useCallback(() => {
    const t = draft.trim();
    if (!t || disabled) return;
    const next = normalizeLabels([...labels, t]);
    if (next.length === labels.length) {
      setDraft("");
      return;
    }
    onChange(next);
    setDraft("");
  }, [draft, disabled, labels, onChange]);

  const removeAt = (label: string) => {
    if (disabled) return;
    onChange(labels.filter((l) => l !== label));
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "flex flex-wrap rounded-xl border border-border/60 bg-background/50",
          variant === "comfortable"
            ? "min-h-10 gap-2 px-3 py-2.5"
            : "min-h-9 gap-1.5 px-2 py-1.5"
        )}
      >
        {labels.map((label) => (
          <Badge
            key={label}
            variant="secondary"
            className="h-6 gap-0.5 pr-0.5 pl-2 text-xs font-normal"
          >
            {label}
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeAt(label)}
              className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none"
              aria-label={`Remove label ${label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          disabled={disabled}
          aria-label={inputAriaLabel}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
            }
            if (e.key === "Backspace" && !draft && labels.length > 0) {
              removeAt(labels[labels.length - 1]!);
            }
          }}
          onBlur={() => {
            if (draft.includes(",") || draft.includes(";")) {
              const parts = draft.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
              if (parts.length > 1) {
                const next = normalizeLabels([...labels, ...parts]);
                onChange(next);
                setDraft("");
                return;
              }
            }
            if (draft.trim()) commitDraft();
          }}
          placeholder={
            labels.length >= MAX_TASK_LABELS
              ? `Max ${MAX_TASK_LABELS} labels`
              : labels.length === 0
                ? placeholder
                : "Add another…"
          }
          className={cn(
            "min-w-[8rem] flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0",
            variant === "comfortable" ? "h-8 px-1 py-1" : "h-7 p-0"
          )}
        />
      </div>
      {variant === "default" ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Enter adds a chip. Backspace removes the last one.
        </p>
      ) : null}
    </div>
  );
}
