"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "My Roadmap" },
  { href: "/jobs", label: "Jobs" },
  { href: "/scholarships", label: "Internships & Scholarships" },
  { href: "/recruiter", label: "Industry Dashboard" },
  { href: "/academia", label: "Academia Dashboard" },
  { href: "/mentor", label: "AI Mentor" },
  { href: "/mock-interview", label: "Mock Interview" },
  { href: "/resume-analysis", label: "Resume Analysis" },
  { href: "/community", label: "Community" },
  { href: "/certificates", label: "Certificates" },
  { href: "/readiness", label: "Career Readiness" },
  { href: "/rewards", label: "Rewards" },
  { href: "/profile", label: "Profile" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent-soft"
        aria-label={open ? "Close menu" : "Open menu"}
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

      <AnimatePresence>
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
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-line bg-background shadow-2xl"
            >
              <div className="flex h-16 items-center justify-end px-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent-soft"
                  aria-label="Close menu"
                >
                  <span className="block h-0.5 w-5 rotate-45 rounded-full bg-foreground" />
                  <span className="absolute block h-0.5 w-5 -rotate-45 rounded-full bg-foreground" />
                </button>
              </div>
              <nav className="px-4 pb-8">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-accent-soft text-accent"
                            : "text-slate-400 hover:bg-accent-soft hover:text-accent"
                        }`}
                      >
                        {link.label}
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
      </AnimatePresence>
    </div>
  );
}
