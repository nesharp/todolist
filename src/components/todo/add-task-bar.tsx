"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddTaskBar({
  value,
  onChange,
  onAdd,
}: {
  value: string;
  onChange: (next: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="group relative mb-8 flex items-center">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim()) onAdd();
        }}
        placeholder="Що потрібно зробити?"
        className="h-14 w-full rounded-2xl border-border/50 bg-background/50 pl-5 pr-32 text-base shadow-sm backdrop-blur-sm transition-all focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10"
      />
      <Button
        size="sm"
        className="absolute right-2 h-10 rounded-xl px-4 font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        onClick={onAdd}
        disabled={!value.trim()}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Додати
      </Button>
    </div>
  );
}

