"use client";

import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";

export type ByteEmotion = "happy" | "thinking" | "excited" | "oops" | "celebrating";

interface ByteProps {
  emotion?: ByteEmotion;
  message?: string;
  size?: number;
}

function ByteSVG({ emotion, size = 120 }: { emotion: ByteEmotion; size?: number }) {
  const isHappy = emotion === "happy";
  const isThinking = emotion === "thinking";
  const isExcited = emotion === "excited";
  const isOops = emotion === "oops";
  const isCelebrating = emotion === "celebrating";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Byte the robot feeling ${emotion}`}
    >
      {/* Antenna */}
      <line x1="60" y1="8" x2="60" y2="22" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="6" r="4" fill="#00d4ff" />

      {/* Head */}
      <rect x="28" y="22" width="64" height="52" rx="12" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="2" />

      {/* Eyes — change by emotion */}
      {(isHappy || isCelebrating) && (
        <>
          {/* Wide happy eyes */}
          <circle cx="47" cy="42" r="9" fill="#00d4ff" opacity="0.2" />
          <circle cx="47" cy="42" r="6" fill="#00d4ff" />
          <circle cx="47" cy="40" r="2" fill="white" />
          <circle cx="73" cy="42" r="9" fill="#00d4ff" opacity="0.2" />
          <circle cx="73" cy="42" r="6" fill="#00d4ff" />
          <circle cx="73" cy="40" r="2" fill="white" />
        </>
      )}
      {isThinking && (
        <>
          {/* Normal left eye, squinted right */}
          <circle cx="47" cy="42" r="6" fill="#00d4ff" />
          <circle cx="47" cy="40" r="2" fill="white" />
          {/* Squinted right eye = narrow ellipse */}
          <ellipse cx="73" cy="42" rx="7" ry="3" fill="#00d4ff" />
          <circle cx="73" cy="42" r="1.5" fill="white" />
        </>
      )}
      {isExcited && (
        <>
          {/* Star-shaped eyes */}
          <text x="38" y="50" fontSize="16" fill="#fbbf24">⭐</text>
          <text x="63" y="50" fontSize="16" fill="#fbbf24">⭐</text>
        </>
      )}
      {isOops && (
        <>
          {/* Swirly eyes represented as spirals */}
          <text x="35" y="50" fontSize="18" fill="#f87171">@</text>
          <text x="63" y="50" fontSize="18" fill="#f87171">@</text>
        </>
      )}

      {/* Mouth */}
      {(isHappy || isCelebrating) && (
        <path d="M 47 58 Q 60 68 73 58" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}
      {isThinking && (
        <path d="M 47 60 Q 60 60 73 60" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
      {isExcited && (
        <path d="M 45 56 Q 60 70 75 56" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}
      {isOops && (
        <path d="M 47 64 Q 60 54 73 64" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Thinking hand on chin */}
      {isThinking && (
        <ellipse cx="28" cy="62" rx="8" ry="5" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="1.5" />
      )}

      {/* Body */}
      <rect x="34" y="76" width="52" height="34" rx="8" fill="#162d4a" stroke="#00d4ff" strokeWidth="1.5" />

      {/* Chest panel */}
      <rect x="42" y="82" width="36" height="20" rx="4" fill="#0f1f33" stroke="#00d4ff" strokeWidth="1" opacity="0.8" />
      <circle cx="52" cy="92" r="3" fill={isExcited || isCelebrating ? "#fbbf24" : "#00d4ff"} />
      <circle cx="60" cy="92" r="3" fill={isOops ? "#f87171" : "#00d4ff"} opacity="0.6" />
      <circle cx="68" cy="92" r="3" fill="#00d4ff" opacity="0.3" />

      {/* Arms */}
      <rect x="14" y="78" width="18" height="10" rx="5" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="1.5" />
      <rect x="88" y="78" width="18" height="10" rx="5" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="1.5" />

      {/* Celebrating arms up */}
      {isCelebrating && (
        <>
          <rect x="8" y="60" width="10" height="20" rx="5" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="1.5" transform="rotate(-30 13 70)" />
          <rect x="102" y="60" width="10" height="20" rx="5" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="1.5" transform="rotate(30 107 70)" />
          {/* Confetti */}
          <circle cx="20" cy="30" r="3" fill="#fbbf24" opacity="0.9" />
          <circle cx="95" cy="25" r="2.5" fill="#f472b6" opacity="0.9" />
          <circle cx="15" cy="50" r="2" fill="#34d399" opacity="0.9" />
          <circle cx="100" cy="45" r="3" fill="#818cf8" opacity="0.9" />
          <circle cx="30" cy="18" r="2" fill="#fb923c" opacity="0.9" />
          <circle cx="88" cy="15" r="2" fill="#f87171" opacity="0.9" />
        </>
      )}

      {/* Feet */}
      <rect x="40" y="108" width="14" height="8" rx="4" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="1.5" />
      <rect x="66" y="108" width="14" height="8" rx="4" fill="#1e3a5f" stroke="#00d4ff" strokeWidth="1.5" />
    </svg>
  );
}

const containerVariants: Record<ByteEmotion, TargetAndTransition> = {
  happy: {
    y: [0, -6, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  thinking: {
    rotate: [-2, 2, -2],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  excited: {
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    transition: { rotate: { duration: 0.6, ease: "easeInOut" }, scale: { duration: 0.6, repeat: Infinity } },
  },
  oops: {
    x: [-4, 4, -4, 4, 0],
    transition: { duration: 0.5, repeat: Infinity },
  },
  celebrating: {
    y: [0, -10, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function Byte({ emotion = "happy", message, size = 120 }: ByteProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="relative max-w-[200px] bg-white text-gray-900 rounded-xl px-4 py-2 text-sm font-medium shadow-lg text-center"
          >
            {message}
            {/* Bubble tail */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid white",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot character */}
      <motion.div
        animate={containerVariants[emotion]}
        style={{ display: "inline-block" }}
      >
        <ByteSVG emotion={emotion} size={size} />
      </motion.div>
    </div>
  );
}
