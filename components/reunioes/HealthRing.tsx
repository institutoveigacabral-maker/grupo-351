"use client";

import { motion } from "framer-motion";
import { healthColor } from "@/lib/reunioes/utils";

export function HealthRing({ score, size = 40 }: { score: number; size?: number }) {
  const { ring, text } = healthColor(score);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={3} className="text-black/[0.04]" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3}
          strokeLinecap="round"
          className={ring}
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${text}`}>
        {score}
      </span>
    </div>
  );
}
