"use client";

import { motion, AnimatePresence } from "framer-motion";

function AnimatedNumber({ value }: { value: number }) {
  return (
    <div className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="text-foreground"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

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
        <AnimatedNumber value={activeCount} />
        <span className="text-muted-foreground">active</span>
      </div>
      
      <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
        <AnimatedNumber value={completedCount} />
        <span className="text-muted-foreground">completed</span>
      </div>

      <div className="ml-auto text-sm font-medium text-muted-foreground">
        Total: <AnimatedNumber value={totalCount} />
      </div>
    </div>
  );
}
