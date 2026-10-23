"use client";
import { LazyMotion, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
const loadFeatures = () =>
  import("./motion-features").then((module) => module.default);
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <LazyMotion features={loadFeatures}>
      <m.div
        className={className}
        initial={false}
        whileInView={reduced ? undefined : { y: [12, 0] }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
