"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
    },
  },
};

export const cardHoverVariants: Variants = {
  initial: { y: 0 },
  hover: {
    y: -3,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

/**
 * AnimatedNumber: Counts smoothly to the target number
 */
export function AnimatedNumber({
  value,
  decimals = 1,
  duration = 800,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const targetValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (targetValue - startValue) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration, shouldReduceMotion]);

  return (
    <span>
      {new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(displayValue)}
    </span>
  );
}

/**
 * Skeleton Loader with subtle shimmer
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#121f19] rounded-lg border border-[#192b22] ${className}`}
    />
  );
}
