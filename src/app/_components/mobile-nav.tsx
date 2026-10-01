"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { getWorkspaceLinks, WorkspaceNavigation, type WorkspaceRole } from "./workspace-navigation";
import { useLanguage } from "./language-provider";
import { Bot, BriefcaseBusiness, CircleUserRound, LayoutDashboard, Map } from "lucide-react";

const bottomLinks = [
  { href: "/dashboard", label: "Home", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", labelKey: "roadmap", icon: Map },
  { href: "/mentor", label: "Mentor", labelKey: "mentor", icon: Bot },
  { href: "/jobs", label: "Jobs", labelKey: "jobs", icon: BriefcaseBusiness },
  { href: "/profile", label: "Profile", labelKey: "profile", icon: CircleUserRound },
] as const;

const subscribeToMount = () => () => {};

export function MobileNav({ role = "student" }: { role?: WorkspaceRole }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const navLinks = getWorkspaceLinks(role);
  const { t, locale } = useLanguage();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      closeRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      if (open) triggerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      {mounted && role === "student" && createPortal(<nav aria-label="Student bottom navigation" className="student-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t xl:hidden">{bottomLinks.map(({ href, label, labelKey, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium ${active ? "bg-accent-soft text-accent" : "hover:bg-accent-soft"}`}><Icon className="h-5 w-5" aria-hidden />{locale === "en" ? label : t(labelKey)}</Link>; })}</nav>, document.body)}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-accent-soft"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="workspace-menu"
      >
        <div className="flex flex-col gap-1.5">
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 ${
              open ? "-translate-y-[4px] -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      {mounted && createPortal(<AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-line bg-background shadow-xl"
              id="workspace-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Workspace menu"
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
                if (event.key === "Tab") {
                  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a,button,summary")).filter((element) => element.getClientRects().length > 0);
                  const first = controls[0];
                  const last = controls[controls.length - 1];
                  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
                }
              }}
            >
              <div className="flex h-16 items-center justify-end px-4">
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-accent-soft"
                  aria-label="Close menu"
                >
                  <span className="block h-0.5 w-5 rotate-45 rounded-full bg-foreground" />
                  <span className="absolute block h-0.5 w-5 -rotate-45 rounded-full bg-foreground" />
                </button>
              </div>
              <nav className="px-4 pb-8" onClick={(event) => { if ((event.target as Element).closest("a")) setOpen(false); }}>
                {role === "student" ? <WorkspaceNavigation role={role} /> : navLinks.map((link, index) => {
                  const linkPath = link.href.split("?")[0];
                  const isActive = pathname === linkPath || (linkPath !== "/dashboard" && pathname.startsWith(`${linkPath}/`));
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-accent-soft text-accent"
                            : "text-slate-400 hover:bg-accent-soft hover:text-accent"
                        }`}
                      >
                        {t(link.labelKey)}
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}
