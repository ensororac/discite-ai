"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

export interface XPBarProps {
  xp: number;
  previousXp?: number;
}

export type LevelInfo = {
  name: string;
  min: number;
  max: number;
  color: string;
  textColor: string;
};

export const LEVELS: LevelInfo[] = [
  { name: "Beginner",   min: 0,   max: 50,  color: "from-gray-500 to-gray-400",     textColor: "text-gray-300" },
  { name: "Explorer",   min: 51,  max: 150, color: "from-blue-600 to-cyan-500",      textColor: "text-cyan-300" },
  { name: "Discoverer", min: 151, max: 300, color: "from-purple-600 to-violet-500",  textColor: "text-violet-300" },
  { name: "Innovator",  min: 301, max: 500, color: "from-amber-500 to-orange-400",   textColor: "text-amber-300" },
  { name: "AI Champion",min: 501, max: 9999,color: "from-emerald-500 to-teal-400",   textColor: "text-emerald-300" },
];

export function getLevelInfo(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    return rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
  }, [rounded]);

  return <span ref={ref}>{value}</span>;
}

export default function XPBar({ xp, previousXp }: XPBarProps) {
  const level = getLevelInfo(xp);
  const nextLevel = LEVELS.find((l) => l.min > xp);
  const prevXp = previousXp ?? xp;

  const rangeMin = level.min;
  const rangeMax = nextLevel ? nextLevel.min : level.max;
  const rangeSize = rangeMax - rangeMin;

  const progressPct = rangeSize > 0 ? Math.min(((xp - rangeMin) / rangeSize) * 100, 100) : 100;
  const prevProgressPct = rangeSize > 0 ? Math.min(((prevXp - rangeMin) / rangeSize) * 100, 100) : 100;

  const isNewXP = xp > prevXp;

  return (
    <motion.div
      className="bg-gray-900 border border-gray-800 rounded-xl p-4"
      animate={isNewXP ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${level.textColor}`}>{level.name}</span>
          {nextLevel && (
            <span className="text-xs text-gray-500">→ {nextLevel.name}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <motion.span
            className="text-white font-bold"
            animate={isNewXP ? { scale: [1, 1.3, 1], color: ["#ffffff", "#00d4ff", "#ffffff"] } : {}}
            transition={{ duration: 0.5 }}
          >
            <AnimatedNumber value={xp} />
          </motion.span>
          {nextLevel && (
            <span className="text-gray-500 text-xs">/ {nextLevel.min} XP</span>
          )}
          {!nextLevel && (
            <span className="text-xs text-emerald-400 font-semibold">MAX ✨</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        {/* Old fill (baseline) */}
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${level.color} opacity-30 rounded-full`}
          style={{ width: `${prevProgressPct}%` }}
        />
        {/* Animated fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${level.color} rounded-full`}
          initial={{ width: `${prevProgressPct}%` }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Shimmer */}
        {isNewXP && (
          <motion.div
            className="absolute inset-y-0 w-8 bg-white rounded-full opacity-30"
            initial={{ left: `${prevProgressPct}%` }}
            animate={{ left: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </div>

      {nextLevel && (
        <p className="text-xs text-gray-600 mt-1.5 text-right">
          {Math.max(0, nextLevel.min - xp)} XP to {nextLevel.name}
        </p>
      )}
    </motion.div>
  );
}
