"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOKENS = ["The", "cat", "sat", "on", "the", "mat"];

type HeadId = 0 | 1 | 2;

// Head 0: syntactic (grammar relationships)
// Head 1: semantic (meaning relationships)
// Head 2: positional (nearby words)
const ATTENTION_HEADS: number[][][] = [
  // Head 0 — syntactic
  [
    //  The   cat   sat   on    the   mat
    [0.05, 0.75, 0.05, 0.05, 0.05, 0.05], // The → cat
    [0.10, 0.10, 0.65, 0.05, 0.05, 0.05], // cat → sat
    [0.05, 0.45, 0.10, 0.20, 0.05, 0.15], // sat → cat (subject)
    [0.05, 0.05, 0.10, 0.05, 0.25, 0.50], // on → mat
    [0.05, 0.05, 0.05, 0.05, 0.05, 0.75], // the → mat
    [0.05, 0.15, 0.20, 0.10, 0.25, 0.25], // mat → (various)
  ],
  // Head 1 — semantic
  [
    //  The   cat   sat   on    the   mat
    [0.05, 0.55, 0.05, 0.05, 0.10, 0.20], // The → cat / mat
    [0.10, 0.15, 0.30, 0.05, 0.10, 0.30], // cat → sat, mat (semantically related)
    [0.05, 0.35, 0.10, 0.05, 0.05, 0.40], // sat → cat, mat
    [0.05, 0.10, 0.15, 0.05, 0.15, 0.50], // on → mat
    [0.05, 0.10, 0.05, 0.05, 0.05, 0.70], // the → mat
    [0.05, 0.35, 0.30, 0.10, 0.05, 0.15], // mat → cat, sat
  ],
  // Head 2 — positional (nearby words)
  [
    //  The   cat   sat   on    the   mat
    [0.20, 0.60, 0.10, 0.05, 0.05, 0.00], // The → nearby
    [0.30, 0.20, 0.40, 0.05, 0.05, 0.00], // cat → nearby
    [0.05, 0.35, 0.20, 0.35, 0.05, 0.00], // sat → nearby
    [0.00, 0.05, 0.35, 0.20, 0.35, 0.05], // on → nearby
    [0.00, 0.05, 0.05, 0.35, 0.20, 0.35], // the → nearby
    [0.00, 0.00, 0.05, 0.10, 0.45, 0.40], // mat → nearby
  ],
];

const HEAD_LABELS = [
  { id: 0, label: "Head 1: Syntactic", emoji: "📐", desc: "Grammar & structure" },
  { id: 1, label: "Head 2: Semantic", emoji: "💡", desc: "Meaning & concepts" },
  { id: 2, label: "Head 3: Positional", emoji: "📍", desc: "Nearby words" },
];

function attentionColor(score: number): string {
  const r = Math.round(20 + score * (236 - 20));
  const g = Math.round(10 + score * (72 - 10));
  const b = Math.round(30 + score * (153 - 30));
  return `rgb(${r},${g},${b})`;
}

function textColor(score: number): string {
  return score > 0.5 ? "text-white" : "text-gray-400";
}

export default function AttentionMatrix() {
  const [activeHead, setActiveHead] = useState<HeadId>(0);
  const [tooltip, setTooltip] = useState<{
    row: number;
    col: number;
    score: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  const matrix = ATTENTION_HEADS[activeHead];

  const handleHeadChange = (id: HeadId) => {
    setActiveHead(id);
    setMounted(false);
    setTimeout(() => setMounted(true), 50);
  };

  // Trigger animation on first render
  if (!mounted) {
    setTimeout(() => setMounted(true), 100);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-pink-400 font-bold">🧮 Attention Matrix</h3>
        <span className="text-xs text-gray-500">Yr 9–10</span>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Sentence:{" "}
        <span className="text-white font-medium">
          &ldquo;{TOKENS.join(" ")}&rdquo;
        </span>
      </p>

      {/* Head selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {HEAD_LABELS.map((h) => (
          <button
            key={h.id}
            onClick={() => handleHeadChange(h.id as HeadId)}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all
              ${
                activeHead === h.id
                  ? "bg-pink-700 border-pink-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-pink-700"
              }`}
          >
            {h.emoji} {h.label}
            <span className="block text-gray-500 font-normal text-[10px]">
              {h.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Matrix grid */}
      <div className="overflow-x-auto mb-6">
        <div
          className="inline-grid gap-1"
          style={{
            gridTemplateColumns: `80px repeat(${TOKENS.length}, minmax(52px, 1fr))`,
          }}
        >
          {/* Column headers */}
          <div className="text-xs text-gray-600 flex items-end justify-end pb-1 pr-1">
            Query ↓ / Key →
          </div>
          {TOKENS.map((t, j) => (
            <div
              key={j}
              className="text-center text-xs text-pink-300 font-semibold pb-1"
            >
              {t}
            </div>
          ))}

          {/* Rows */}
          {TOKENS.map((rowWord, i) => (
            <>
              {/* Row label */}
              <div
                key={`label-${i}`}
                className="text-xs text-pink-300 font-semibold flex items-center justify-end pr-2"
              >
                {rowWord}
              </div>

              {/* Cells */}
              {TOKENS.map((_, j) => {
                const score = matrix[i][j];
                const isHovered =
                  tooltip?.row === i && tooltip?.col === j;

                return (
                  <motion.div
                    key={`${i}-${j}`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={
                      mounted
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.6 }
                    }
                    transition={{
                      delay: mounted ? i * 0.08 + j * 0.01 : 0,
                      duration: 0.25,
                    }}
                    onMouseEnter={() => setTooltip({ row: i, col: j, score })}
                    onMouseLeave={() => setTooltip(null)}
                    onTouchStart={() => setTooltip({ row: i, col: j, score })}
                    style={{ backgroundColor: attentionColor(score) }}
                    className={`relative rounded-md flex items-center justify-center
                      text-xs font-mono font-semibold cursor-default
                      min-h-[44px] transition-transform
                      ${textColor(score)}
                      ${isHovered ? "scale-110 z-10 ring-2 ring-white" : ""}
                    `}
                  >
                    {Math.round(score * 100)}%
                  </motion.div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Tooltip panel */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mb-4 bg-pink-950 border border-pink-800 rounded-xl px-4 py-3 text-sm text-pink-200"
          >
            When reading{" "}
            <strong className="text-white">
              &ldquo;{TOKENS[tooltip.row]}&rdquo;
            </strong>
            , the model pays{" "}
            <strong className="text-pink-300">
              {Math.round(tooltip.score * 100)}%
            </strong>{" "}
            attention to{" "}
            <strong className="text-white">
              &ldquo;{TOKENS[tooltip.col]}&rdquo;
            </strong>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Colour legend */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-gray-500">Low</span>
        <div
          className="flex-1 h-3 rounded-full"
          style={{
            background:
              "linear-gradient(to right, rgb(20,10,30), rgb(236,72,153))",
          }}
        />
        <span className="text-xs text-gray-500">High attention</span>
      </div>

      {/* Explanation panel */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3">
        <h4 className="text-sm font-bold text-white">
          What is multi-head attention?
        </h4>
        <p className="text-sm text-gray-400">
          A transformer doesn&apos;t just look at one type of relationship — it
          runs <strong className="text-white">multiple attention heads</strong>{" "}
          at the same time. Each head learns to focus on different aspects of
          language.
        </p>
        <div className="space-y-2">
          {HEAD_LABELS.map((h) => (
            <div key={h.id} className="flex gap-2 text-sm">
              <span className="text-lg leading-tight">{h.emoji}</span>
              <div>
                <p className="text-gray-300 font-medium">{h.label}</p>
                <p className="text-gray-500 text-xs">{h.desc} — e.g. {h.id === 0 ? "subject-verb agreement" : h.id === 1 ? "cat relates to mat" : "adjacent word connections"}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 pt-1">
          Real transformers use{" "}
          <strong className="text-white">8 to 96 attention heads</strong> per
          layer, and stack many layers — each building a deeper understanding of
          the sentence.
        </p>
        <div className="bg-pink-950 border border-pink-900 rounded-xl p-3 mt-2">
          <p className="text-pink-200 text-xs">
            🧠 <strong>Why multiple heads?</strong> Just like how you might
            re-read a sentence to understand its grammar, then again for its
            meaning — multiple heads let the model understand language from
            several angles simultaneously.
          </p>
        </div>
      </div>
    </div>
  );
}
