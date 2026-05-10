import { cn } from "@/lib/utils";

/** Date inputs, selects, and similar native fields in todo UI */
export function todoFieldControlClassName(extra?: string) {
  return cn(
    "box-border h-10 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-sm leading-normal text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
    extra
  );
}

export const todoFieldLabelClass =
  "flex min-w-0 flex-col gap-2 text-xs font-medium text-muted-foreground";
