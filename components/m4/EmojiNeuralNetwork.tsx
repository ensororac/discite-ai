"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type AnimationPhase = "idle" | "input" | "features" | "combination" | "output" | "done";

interface EmojiConfig {
  emoji: string;
  features: string[];
  combination: string[];
  outputs: { label: string; confidence: number }[];
}

const EMOJI_CONFIG: Record<string, EmojiConfig> = {
  "😊": {
    emoji: "😊",
    features: ["Curved mouth", "Round shape", "Dot eyes", "Yellow color"],
    combination: ["Face shape", "Positive expression", "Human emoji"],
    outputs: [
      { label: "Happy", confidence: 94 },
      { label: "Face", confidence: 88 },
      { label: "Positive", confidence: 91 },
    ],
  },
  "😢": {
    emoji: "😢",
    features: ["Tear drop", "Downturned mouth", "Round shape", "Blue tint"],
    combination: ["Face shape", "Sad expression", "Human emoji"],
    outputs: [
      { label: "Sad", confidence: 92 },
      { label: "Face", confidence: 87 },
      { label: "Negative", confidence: 89 },
    ],
  },
  "😡": {
    emoji: "😡",
    features: ["Furrowed brows", "Red color", "Clenched mouth", "Sharp angles"],
    combination: ["Face shape", "Angry expression", "Human emoji"],
    outputs: [
      { label: "Angry", confidence: 96 },
      { label: "Face", confidence: 85 },
      { label: "Negative", confidence: 93 },
    ],
  },
  "🐱": {
    emoji: "🐱",
    features: ["Pointed ears", "Whiskers", "Round eyes", "Fur texture"],
    combination: ["Animal shape", "Feline features", "Pet"],
    outputs: [
      { label: "Cat", confidence: 97 },
      { label: "Animal", confidence: 91 },
      { label: "Pet", confidence: 85 },
    ],
  },
  "🌳": {
    emoji: "🌳",
    features: ["Green color", "Branching shape", "Brown trunk", "Leaf pattern"],
    combination: ["Plant shape", "Tall structure", "Nature"],
    outputs: [
      { label: "Tree", confidence: 95 },
      { label: "Plant", confidence: 90 },
      { label: "Nature", confidence: 88 },
    ],
  },
  "🔥": {
    emoji: "🔥",
    features: ["Orange/red color", "Flickering shape", "Pointed top", "Warm glow"],
    combination: ["Element shape", "Energy pattern", "Danger signal"],
    outputs: [
      { label: "Fire", confidence: 96 },
      { label: "Element", confidence: 82 },
      { label: "Danger", confidence: 79 },
    ],
  },
};

const EMOJIS = ["😊", "😢", "😡", "🐱", "🌳", "🔥"];

// Phase helpers
const phaseGte = (current: AnimationPhase, target: AnimationPhase): boolean => {
  const order: AnimationPhase[] = ["idle", "input", "features", "combination", "output", "done"];
  return order.indexOf(current) >= order.indexOf(target);
};

export default function EmojiNeuralNetwork() {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [phase, setPhase] = useState<AnimationPhase>("idle");

  const config = selectedEmoji ? EMOJI_CONFIG[selectedEmoji] : null;

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmoji(emoji);
    setPhase("input");
    setTimeout(() => setPhase("features"), 800);
    setTimeout(() => setPhase("combination"), 1600);
    setTimeout(() => setPhase("output"), 2400);
    setTimeout(() => setPhase("done"), 3200);
  };

  const handleReset = () => {
    setSelectedEmoji(null);
    setPhase("idle");
  };

  // SVG layout — nodes only, no text labels inside SVG
  const W = 400;
  const H = 220;
  const R = 14;
  const layerX = [60, 160, 260, 340];
  const inputY = H / 2;
  const featY = [40, 80, 120, 160];
  const comboY = [60, 110, 160];
  const outY = [60, 110, 160];

  const nodeColor = (active: boolean, top?: boolean) =>
    active ? (top ? "#22c55e" : "#f97316") : "#374151";

  return (
    <div className="space-y-4">
      {/* Emoji selector */}
      <div className="flex justify-center gap-2 flex-wrap">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className={`text-2xl px-3 py-2 rounded-lg transition-all border-2 ${
              selectedEmoji === emoji
                ? "border-orange-500 bg-orange-950 scale-110"
                : "border-gray-700 hover:border-gray-500 bg-gray-800/50"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Network SVG — clean nodes and connections only */}
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-md"
          style={{ background: "#111827", borderRadius: "0.75rem", padding: "8px" }}
        >
          {/* Connections: input → features */}
          {featY.map((fy, fi) => (
            <line
              key={`c-if-${fi}`}
              x1={layerX[0]} y1={inputY} x2={layerX[1]} y2={fy}
              stroke={phaseGte(phase, "features") ? "#f97316" : "#374151"}
              strokeWidth="1"
              opacity={phaseGte(phase, "features") ? 0.6 : 0.2}
              style={{ transition: "stroke 0.5s, opacity 0.5s" }}
            />
          ))}
          {/* Connections: features → combination */}
          {featY.map((fy, fi) =>
            comboY.map((cy, ci) => (
              <line
                key={`c-fc-${fi}-${ci}`}
                x1={layerX[1]} y1={fy} x2={layerX[2]} y2={cy}
                stroke={phaseGte(phase, "combination") ? "#f97316" : "#374151"}
                strokeWidth="1"
                opacity={phaseGte(phase, "combination") ? 0.5 : 0.15}
                style={{ transition: "stroke 0.5s, opacity 0.5s" }}
              />
            ))
          )}
          {/* Connections: combination → output */}
          {comboY.map((cy, ci) =>
            outY.map((oy, oi) => (
              <line
                key={`c-co-${ci}-${oi}`}
                x1={layerX[2]} y1={cy} x2={layerX[3]} y2={oy}
                stroke={phaseGte(phase, "output") ? "#f97316" : "#374151"}
                strokeWidth="1"
                opacity={phaseGte(phase, "output") ? 0.6 : 0.15}
                style={{ transition: "stroke 0.5s, opacity 0.5s" }}
              />
            ))
          )}

          {/* Input node */}
          <circle
            cx={layerX[0]} cy={inputY} r={R}
            fill={phaseGte(phase, "input") ? "#f97316" : "#374151"}
            stroke="#4b5563" strokeWidth="1"
            style={{ transition: "fill 0.4s" }}
          />
          {selectedEmoji && phaseGte(phase, "input") && (
            <text x={layerX[0]} y={inputY + 1} textAnchor="middle" dominantBaseline="middle" fontSize="16">
              {selectedEmoji}
            </text>
          )}

          {/* Feature nodes */}
          {featY.map((y, i) => (
            <circle
              key={`fn-${i}`}
              cx={layerX[1]} cy={y} r={R}
              fill={phaseGte(phase, "features") ? "#f97316" : "#374151"}
              stroke="#4b5563" strokeWidth="1"
              style={{ transition: `fill 0.4s ${i * 0.1}s` }}
            />
          ))}

          {/* Combination nodes */}
          {comboY.map((y, i) => (
            <circle
              key={`cn-${i}`}
              cx={layerX[2]} cy={y} r={R}
              fill={phaseGte(phase, "combination") ? "#f97316" : "#374151"}
              stroke="#4b5563" strokeWidth="1"
              style={{ transition: `fill 0.4s ${i * 0.1}s` }}
            />
          ))}

          {/* Output nodes */}
          {outY.map((y, i) => (
            <circle
              key={`on-${i}`}
              cx={layerX[3]} cy={y} r={R}
              fill={phaseGte(phase, "output") ? (i === 0 ? "#22c55e" : "#f97316") : "#374151"}
              stroke="#4b5563" strokeWidth="1"
              style={{ transition: `fill 0.4s ${i * 0.12}s` }}
            />
          ))}

          {/* Layer labels at bottom */}
          <text x={layerX[0]} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize="9">Input</text>
          <text x={layerX[1]} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize="9">Detect</text>
          <text x={layerX[2]} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize="9">Combine</text>
          <text x={layerX[3]} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize="9">Output</text>
        </svg>
      </div>

      {/* Results panel — accumulates all phases */}
      {phase === "idle" && (
        <p className="text-center text-gray-500 text-sm">
          👆 Pick an emoji to see how a neural network processes it
        </p>
      )}

      {phase !== "idle" && config && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Classification Results</p>

          {/* Phase 1: Input */}
          {phaseGte(phase, "input") && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 pb-2 border-b border-gray-700"
            >
              <span className="text-orange-400 text-xs font-bold w-20 shrink-0">📥 Input</span>
              <span className="text-xl">{config.emoji}</span>
              <span className="text-gray-400 text-xs">Raw data enters the network</span>
            </motion.div>
          )}

          {/* Phase 2: Feature Detection */}
          {phaseGte(phase, "features") && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-2 border-b border-gray-700"
            >
              <p className="text-orange-400 text-xs font-bold mb-1.5">🔍 Feature Detection</p>
              <div className="flex flex-wrap gap-1.5">
                {config.features.map((f, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-2 py-0.5 bg-orange-950 border border-orange-800 rounded text-orange-200 text-xs"
                  >
                    {f}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 3: Feature Combination */}
          {phaseGte(phase, "combination") && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-2 border-b border-gray-700"
            >
              <p className="text-orange-400 text-xs font-bold mb-1.5">🧩 Feature Combination</p>
              <div className="flex flex-wrap gap-1.5">
                {config.combination.map((c, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-2 py-0.5 bg-orange-950 border border-orange-800 rounded text-orange-200 text-xs"
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 4: Classification Output */}
          {phaseGte(phase, "output") && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-green-400 text-xs font-bold mb-2">✅ Classification Output</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {config.outputs.map((out, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12 }}
                    className={`px-3 py-2 rounded-lg border text-center min-w-[80px] ${
                      i === 0
                        ? "bg-green-950 border-green-700"
                        : "bg-gray-900 border-gray-700"
                    }`}
                  >
                    <p className={`text-sm font-bold ${i === 0 ? "text-green-400" : "text-gray-400"}`}>
                      {out.label}
                    </p>
                    <p className={`text-lg font-bold ${i === 0 ? "text-green-300" : "text-gray-500"}`}>
                      {out.confidence}%
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Reset button */}
      {selectedEmoji && (
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-lg bg-orange-950 border border-orange-700 text-orange-300 hover:text-orange-200 hover:border-orange-500 transition-all text-sm font-medium"
          >
            Try another emoji
          </button>
        </div>
      )}
    </div>
  );
}
