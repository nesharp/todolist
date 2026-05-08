"use client";

import { motion } from "framer-motion";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="mb-4 text-sm font-medium text-destructive"
      role="alert"
    >
      {message}
    </motion.p>
  );
}
