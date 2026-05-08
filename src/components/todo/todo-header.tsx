"use client";

import { useEffect, useState } from "react";
import { formatTodayDate, formatNowTime } from "./utils";
import { motion, AnimatePresence } from "framer-motion";

export function TodoHeader() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateLabel = now ? formatTodayDate(now) : "";
  const timeLabel = now ? formatNowTime(now) : "";

  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          My Tasks
        </h2>
        <p className="text-base text-muted-foreground">
          Organize your day efficiently
        </p>
      </div>
      <div className="flex items-center gap-3 md:text-right">
        <div className="hidden h-10 w-[1px] bg-border/50 md:block" />
        <div className="min-w-[120px] text-right">
          <p className="text-lg font-semibold capitalize text-foreground min-h-[28px]">
            {dateLabel}
          </p>
          <div className="flex justify-end overflow-hidden min-h-[20px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {timeLabel ? (
                <motion.p
                  key={timeLabel}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="text-sm font-medium tabular-nums text-muted-foreground whitespace-nowrap"
                >
                  {timeLabel}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
