"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { WorkspaceNavigation, type WorkspaceRole } from "./workspace-navigation";

const subscribe = () => () => {};

export function MobileNav({ role = "student", description }: { role?: WorkspaceRole; description?: string }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const elements = drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}
        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-medium transition-colors hover:bg-accent-soft"
        aria-label="Open features" aria-expanded={open} aria-controls="workspace-features">
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Features</span>
      </button>
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }} className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)} aria-hidden="true" />
              <motion.div ref={drawerRef} id="workspace-features" role="dialog" aria-modal="true"
                aria-labelledby="workspace-features-title"
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="industry-sidebar fixed inset-y-0 left-0 z-[120] flex w-[min(22rem,100%)] flex-col border-r border-line shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-line p-5">
                  <div>
                    <h2 id="workspace-features-title" className="font-semibold text-sidebar-strong">Features</h2>
                    <p className="mt-1 text-xs leading-5 text-sidebar-text">{description}</p>
                  </div>
                  <button type="button" onClick={() => setOpen(false)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sidebar-strong hover:bg-accent-soft"
                    aria-label="Close features"><X className="h-5 w-5" aria-hidden="true" /></button>
                </div>
                <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Workspace links"
                  onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}>
                  <WorkspaceNavigation role={role} />
                </nav>
                <p className="border-t border-line p-5 text-xs text-sidebar-text">Private workspace · your data stays protected</p>
              </motion.div>
            </>
          )}
        </AnimatePresence>, document.body
      )}
    </>
  );
}
