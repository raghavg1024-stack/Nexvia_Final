"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const initial =
    direction === "left"
      ? { opacity: 0, x: -36, filter: "blur(8px)" }
      : direction === "right"
        ? { opacity: 0, x: 36, filter: "blur(8px)" }
        : direction === "scale"
          ? { opacity: 0, y: 18, scale: 0.94, filter: "blur(8px)" }
          : { opacity: 0, y: 32, filter: "blur(8px)" };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.16, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.58, delay: Math.min(delay, 0.18), ease }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96, filter: "blur(7px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.52, ease },
  },
};

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.25,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-violet-400 via-cyan-300 to-fuchsia-400 shadow-[0_0_14px_rgba(69,216,255,.75)]"
      style={{ scaleX }}
    />
  );
}

export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const rotateX = useSpring(rotateXValue, { stiffness: 180, damping: 22 });
  const rotateY = useSpring(rotateYValue, { stiffness: 180, damping: 22 });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rotateXValue.set(y * -8);
    rotateYValue.set(x * 8);
  }

  function resetTilt() {
    rotateXValue.set(0);
    rotateYValue.set(0);
  }

  return (
    <motion.div
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}
