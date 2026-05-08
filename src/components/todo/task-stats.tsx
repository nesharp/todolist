"use client";

import { Badge } from "@/components/ui/badge";

export function TaskStats({
  activeCount,
  completedCount,
  totalCount,
}: {
  activeCount: number;
  completedCount: number;
  totalCount: number;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
        </span>
        <span className="text-foreground">{activeCount}</span>
        <span className="text-muted-foreground">активних</span>
      </div>
      
      <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
        <span className="text-foreground">{completedCount}</span>
        <span className="text-muted-foreground">виконано</span>
      </div>

      <div className="ml-auto text-sm font-medium text-muted-foreground">
        Всього: <span className="text-foreground">{totalCount}</span>
      </div>
    </div>
  );
}

