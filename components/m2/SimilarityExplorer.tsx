"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import wordPairsData from "@/data/m2-embeddings.json";

const { wordPairs } = wordPairsData;

export default function SimilarityExplorer() {
  const [selected, setSelected] = useState(0);

  const pair = wordPairs[selected];

  return (
    <div className="bg-gray-900 border border-purple-900 rounded-xl p-6">
      {/* Word pair selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {wordPairs.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected === i
                ? "bg-purple-700 text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            {p.word1} / {p.word2}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {/* Word display */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">{pair.word1}</div>
              <div className="text-xs text-gray-500 mt-1">word A</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs text-gray-500">similarity</div>
              <div
                className={`text-2xl font-bold ${
                  pair.similarity >= 0.85
                    ? "text-green-400"
                    : pair.similarity >= 0.70
                    ? "text-yellow-400"
                    : "text-orange-400"
                }`}
              >
                {Math.round(pair.similarity * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">{pair.word2}</div>
              <div className="text-xs text-gray-500 mt-1">word B</div>
            </div>
          </div>

          {/* Similarity bar */}
          <div className="mb-4">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${pair.similarity * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>far apart</span>
              <span>identical</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-purple-950 border border-purple-900 rounded-lg p-4 text-sm text-purple-200">
            💡 {pair.explanation}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 2D map visualisation */}
      <div className="mt-6 border-t border-gray-800 pt-6">
        <p className="text-xs text-gray-500 mb-3 text-center">Simplified 2D "meaning space" — closer = more similar</p>
        <EmbeddingMap pair={pair} allPairs={wordPairs} selected={selected} />
      </div>
    </div>
  );
}

function EmbeddingMap({
  pair,
  allPairs,
  selected,
}: {
  pair: (typeof wordPairs)[0];
  allPairs: typeof wordPairs;
  selected: number;
}) {
  // Fixed 2D positions for each word across all pairs — consistent layout
  const positions: Record<string, { x: number; y: number }> = {
    cat:       { x: 30, y: 25 },
    kitten:    { x: 38, y: 30 },
    happy:     { x: 65, y: 20 },
    joyful:    { x: 72, y: 26 },
    doctor:    { x: 55, y: 55 },
    hospital:  { x: 65, y: 62 },
    apple:     { x: 20, y: 65 },
    company:   { x: 32, y: 72 },
    pizza:     { x: 75, y: 70 },
    delicious: { x: 82, y: 60 },
  };

  const w1 = positions[pair.word1] || { x: 30, y: 50 };
  const w2 = positions[pair.word2] || { x: 70, y: 50 };

  return (
    <svg viewBox="0 0 100 100" className="w-full max-w-xs mx-auto block" style={{ height: 200 }}>
      {/* Background grid */}
      {[20, 40, 60, 80].map((v) => (
        <g key={v}>
          <line x1={v} y1={0} x2={v} y2={100} stroke="#1f2937" strokeWidth="0.5" />
          <line x1={0} y1={v} x2={100} y2={v} stroke="#1f2937" strokeWidth="0.5" />
        </g>
      ))}

      {/* Other pairs (faded) */}
      {allPairs.map((p, i) => {
        if (i === selected) return null;
        const a = positions[p.word1] || { x: 50, y: 50 };
        const b = positions[p.word2] || { x: 50, y: 50 };
        return (
          <g key={i} opacity={0.2}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#6b7280" strokeWidth="0.4" strokeDasharray="1,1" />
            <circle cx={a.x} cy={a.y} r={1.5} fill="#374151" />
            <circle cx={b.x} cy={b.y} r={1.5} fill="#374151" />
          </g>
        );
      })}

      {/* Active connection line */}
      <motion.line
        x1={w1.x} y1={w1.y} x2={w2.x} y2={w2.y}
        stroke="#a855f7"
        strokeWidth="0.8"
        strokeDasharray="2,1"
        opacity={0.7}
      />

      {/* Active word dots */}
      <motion.circle
        cx={w1.x} cy={w1.y} r={3}
        fill="#7c3aed"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.circle
        cx={w2.x} cy={w2.y} r={3}
        fill="#9333ea"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />

      {/* Labels */}
      <text x={w1.x} y={w1.y - 4} textAnchor="middle" fontSize="4" fill="#d8b4fe">{pair.word1}</text>
      <text x={w2.x} y={w2.y - 4} textAnchor="middle" fontSize="4" fill="#d8b4fe">{pair.word2}</text>
    </svg>
  );
}
