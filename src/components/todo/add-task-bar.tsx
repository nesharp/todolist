"use client";

import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddTaskBar({
  value,
  onChange,
  onAdd,
  hasError,
}: {
  value: string;
  onChange: (next: string) => void;
  onAdd: () => void;
  hasError?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      animate={hasError ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="group relative mb-8 flex items-center"
    >
      <Input
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim()) onAdd();
        }}
        placeholder="What needs to be done?"
        className="h-14 w-full rounded-2xl border-border/50 bg-background/50 pl-5 pr-32 text-base shadow-sm backdrop-blur-sm transition-all focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10"
      />
      
      <AnimatePresence>
        {value.trim() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute right-2"
          >
            <Button
              size="sm"
              className="h-10 rounded-xl px-4 font-medium"
              onClick={onAdd}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{
          opacity: isFocused ? 1 : 0,
          scale: isFocused ? 1 : 0.95,
        }}
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-primary/5 ring-1 ring-primary/20 transition-opacity"
      />
    </motion.div>
  );
}
