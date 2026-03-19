"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Token = {
  token: string;
  probability: number;
  color: string;
};

type Scenario = {
  id: string;
  prompt: string;
  description: string;
  topTokens: Token[];
  chosenToken: string;
  continuations: string[];
};

const COLOR_MAP: Record<string, { bar: string; badge: string; text: string }> = {
  blue:   { bar: "bg-blue-500",   badge: "bg-blue-900 border-blue-700 text-blue-200",   text: "text-blue-400" },
  purple: { bar: "bg-purple-500", badge: "bg-purple-900 border-purple-700 text-purple-200", text: "text-purple-400" },
  green:  { bar: "bg-green-500",  badge: "bg-green-900 border-green-700 text-green-200",  text: "text-green-400" },
  orange: { bar: "bg-orange-500", badge: "bg-orange-900 border-orange-700 text-orange-200", text: "text-orange-400" },
  pink:   { bar: "bg-pink-500",   badge: "bg-pink-900 border-pink-700 text-pink-200",   text: "text-pink-400" },
  teal:   { bar: "bg-teal-500",   badge: "bg-teal-900 border-teal-700 text-teal-200",   text: "text-teal-400" },
};

const SCENARIO_LABELS = [
  "🔒 High confidence",
  "🤔 Ambiguous",
  "✨ Creative",
  "📝 Grammar-aware",
  "🌍 World knowledge",
  "💬 Idiom",
];

export default function PredictionExplorer({ scenarios }: { scenarios: Scenario[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const active = scenarios[activeIdx];

  const handleSelect = (i: number) => {
    setActiveIdx(i);
    setRevealed(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => handleSelect(i)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
              i === activeIdx
                ? "bg-green-700 border-green-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
            }`}
          >
            {SCENARIO_LABELS[i]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {/* Prompt display */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg px-5 py-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Prompt</p>
            <p className="text-white text-lg font-mono">
              {active.prompt}
              <span className="ml-2 inline-block w-2 h-5 bg-green-400 animate-pulse rounded-sm align-middle" />
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm">{active.description}</p>

          {/* Probability bars */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Top 8 predicted tokens:</p>
            <div className="space-y-2">
              {active.topTokens.map((t, i) => {
                const colors = COLOR_MAP[t.color] ?? COLOR_MAP.blue;
                const pct = Math.round(t.probability * 100);
                const isChosen = t.token === active.chosenToken;
                return (
                  <motion.div
                    key={t.token}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className={`flex items-center gap-3 ${isChosen ? "opacity-100" : "opacity-75"}`}
                  >
                    {/* Token label */}
                    <div className={`w-28 shrink-0 text-right`}>
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-xs font-mono ${
                          isChosen
                            ? colors.badge + " ring-1 ring-white ring-opacity-30"
                            : "bg-gray-800 border-gray-700 text-gray-400"
                        }`}
                      >
                        {t.token}
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.04 + 0.1, duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${isChosen ? colors.bar : "bg-gray-600"}`}
                      />
                    </div>
                    {/* Percentage */}
                    <div className="w-10 shrink-0 text-right">
                      <span className={`text-xs font-mono ${isChosen ? colors.text : "text-gray-500"}`}>
                        {pct}%
                      </span>
                    </div>
                    {isChosen && (
                      <span className="text-xs text-green-400 font-semibold shrink-0">← chosen</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Reveal continuations */}
          <div>
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="w-full py-2.5 rounded-lg border border-green-700 bg-green-900 bg-opacity-30
                  text-green-300 text-sm font-medium hover:bg-opacity-60 transition-all"
              >
                Show how the sentence could continue →
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                  Possible continuations (each starts with &ldquo;{active.chosenToken}&rdquo;):
                </p>
                {active.continuations.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 font-mono"
                  >
                    {c}
                  </motion.div>
                ))}
                <p className="text-xs text-gray-600 mt-1">
                  The AI would then predict the <em>next</em> token after each of these, and so on — one token at a time.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
