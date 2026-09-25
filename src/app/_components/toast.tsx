"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let listeners: Array<(toast: Toast) => void> = [];

export function toast(message: string, type: Toast["type"] = "info") {
  const id = Math.random().toString(36).slice(2, 9);
  listeners.forEach((listener) => listener({ id, message, type }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
              t.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : t.type === "error"
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-line bg-card text-foreground"
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
