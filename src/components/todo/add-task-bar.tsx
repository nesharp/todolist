"use client";

import { Plus, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import type { CreateTaskOptions } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaskPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

import { todoFieldControlClassName, todoFieldLabelClass } from "./form-controls";
import { LabelChipsInput } from "./label-chips-input";
import { dateInputValueToIsoEndOfDay } from "./schedule-utils";

const priorityLabel: Record<TaskPriority, string> = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export function AddTaskBar({
  value,
  onChange,
  onAdd,
  hasError,
}: {
  value: string;
  onChange: (next: string) => void;
  onAdd: (options: CreateTaskOptions) => void;
  hasError?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [draftDate, setDraftDate] = useState("");
  const [draftPriority, setDraftPriority] = useState<TaskPriority>("NONE");
  const [draftLabels, setDraftLabels] = useState<string[]>([]);
  const [important, setImportant] = useState(false);

  const detailsOpen = Boolean(value.trim());

  useEffect(() => {
    if (!value.trim()) {
      setDraftDate("");
      setDraftPriority("NONE");
      setDraftLabels([]);
      setImportant(false);
    }
  }, [value]);

  const buildOptions = (): CreateTaskOptions => {
    const deadline = draftDate.trim()
      ? dateInputValueToIsoEndOfDay(draftDate) ?? null
      : null;
    return {
      deadline,
      priority: draftPriority,
      labels: draftLabels,
      important,
    };
  };

  const submit = () => {
    if (!value.trim()) return;
    onAdd(buildOptions());
  };

  return (
    <motion.div
      animate={hasError ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="group relative mb-8 flex flex-col gap-3"
    >
      <div className="relative flex items-center">
        <Input
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && value.trim()) submit();
          }}
          placeholder="What needs to be done?"
          className="h-14 w-full rounded-2xl border-border/50 bg-background/50 px-5 py-3 pr-36 text-base leading-snug shadow-sm backdrop-blur-sm transition-all focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10"
        />

        <AnimatePresence>
          {value.trim() ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <Button
                size="sm"
                className="h-10 rounded-xl px-4 font-medium"
                onClick={submit}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          initial={false}
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1 : 0.95,
          }}
          className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-primary/5 ring-1 ring-primary/20 transition-opacity"
        />
      </div>

      <AnimatePresence initial={false}>
        {detailsOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl border border-border/40 bg-background/40 px-5 py-5 shadow-sm backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-stretch gap-x-4 gap-y-4">
              <label className={cn(todoFieldLabelClass, "min-w-[11rem] flex-1")}>
                Due date
                <Input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  aria-label="New task due date"
                  className={todoFieldControlClassName()}
                />
              </label>
              <label className={cn(todoFieldLabelClass, "min-w-[9.5rem] flex-1")}>
                Priority
                <select
                  value={draftPriority}
                  onChange={(e) =>
                    setDraftPriority(e.target.value as TaskPriority)
                  }
                  aria-label="New task priority"
                  className={todoFieldControlClassName()}
                >
                  {(Object.keys(priorityLabel) as TaskPriority[]).map((p) => (
                    <option key={p} value={p}>
                      {priorityLabel[p]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex min-w-[8.5rem] shrink-0 flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Important
                </span>
                <Button
                  type="button"
                  variant={important ? "secondary" : "outline"}
                  className={cn(
                    "h-10 w-full gap-2 rounded-xl px-3 sm:w-auto sm:min-w-[7.5rem]",
                    important &&
                      "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100"
                  )}
                  onClick={() => setImportant((v) => !v)}
                  aria-pressed={important}
                  aria-label="New task important (star)"
                >
                  <Star
                    className={cn("h-4 w-4", important && "fill-current")}
                  />
                  Star
                </Button>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Labels
              </span>
              <LabelChipsInput
                labels={draftLabels}
                onChange={setDraftLabels}
                placeholder="e.g. work — Enter to add"
                variant="comfortable"
                inputAriaLabel="New task label"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
