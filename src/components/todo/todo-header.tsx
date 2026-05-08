"use client";

export function TodoHeader({
  dateLabel,
  timeLabel,
}: {
  dateLabel: string;
  timeLabel: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Мої задачі
        </h2>
        <p className="text-base text-muted-foreground">
          Організуйте свій день ефективно
        </p>
      </div>
      <div className="flex items-center gap-3 md:text-right">
        <div className="hidden h-10 w-[1px] bg-border/50 md:block" />
        <div>
          <p className="text-lg font-semibold capitalize text-foreground">
            {dateLabel}
          </p>
          <p className="text-sm font-medium tabular-nums text-muted-foreground">
            {timeLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

