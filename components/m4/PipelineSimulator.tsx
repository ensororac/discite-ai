"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpeakButton from "@/components/SpeakButton";

interface PipelineSimulatorProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

interface Station {
  id: string;
  emoji: string;
  name: string;
  description: string;
  speakText: string;
  renderOutput: (input: string) => React.ReactNode;
}

const STATIONS: Station[] = [
  {
    id: "tokeniser",
    emoji: "🔤",
    name: "Word Splitter",
    description: "Your sentence gets broken into tokens — small chunks the AI can process.",
    speakText: "Station 1: Word Splitter. Your sentence gets broken into tokens — small chunks the AI can process. Each word, and sometimes parts of words, becomes its own token.",
    renderOutput: (input: string) => {
      const tokens = input.trim().split(/\s+/).filter(Boolean);
      const colours = [
        "bg-blue-700", "bg-purple-700", "bg-pink-700",
        "bg-orange-700", "bg-green-700", "bg-teal-700",
        "bg-yellow-700", "bg-red-700",
      ];
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {tokens.map((tok, i) => (
            <span
              key={i}
              className={`${colours[i % colours.length]} text-white text-sm font-mono px-2 py-1 rounded-lg`}
            >
              {tok}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: "embeddings",
    emoji: "🗺️",
    name: "Meaning Finder",
    description: "Each token becomes a list of numbers that capture its meaning. Similar words get similar numbers.",
    speakText: "Station 2: Meaning Finder. Each token becomes a list of numbers that capture its meaning. Words with similar meanings end up with similar numbers — this is called an embedding.",
    renderOutput: (input: string) => {
      const tokens = input.trim().split(/\s+/).filter(Boolean).slice(0, 4);
      return (
        <div className="mt-3 space-y-1.5">
          {tokens.map((tok, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-300">
              <span className="text-orange-400 w-20 truncate">{tok}:</span>
              <span className="text-gray-500">[{Array.from({ length: 4 }, (_, j) => ((Math.sin(i * 7 + j) * 0.5 + 0.5)).toFixed(2)).join(", ")}, …]</span>
            </div>
          ))}
          {tokens.length < input.trim().split(/\s+/).filter(Boolean).length && (
            <p className="text-gray-600 text-xs">…and more</p>
          )}
        </div>
      );
    },
  },
  {
    id: "attention",
    emoji: "🔦",
    name: "Focus Helper",
    description: "The AI decides which words to focus on. Important connections glow brighter.",
    speakText: "Station 3: Focus Helper. The AI looks at all the words and decides which ones are most important for understanding each other. Words that are closely related glow with a stronger connection.",
    renderOutput: (input: string) => {
      const tokens = input.trim().split(/\s+/).filter(Boolean).slice(0, 5);
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {tokens.map((tok, i) => {
            const strength = Math.abs(Math.sin(i * 3.7));
            const opacity = 0.3 + strength * 0.7;
            return (
              <span
                key={i}
                className="px-2 py-1 rounded-lg text-sm font-mono text-white transition-all"
                style={{
                  background: `rgba(249, 115, 22, ${opacity})`,
                  boxShadow: `0 0 ${Math.round(strength * 12)}px rgba(249, 115, 22, ${opacity * 0.8})`,
                }}
              >
                {tok}
              </span>
            );
          })}
        </div>
      );
    },
  },
  {
    id: "layers",
    emoji: "🔄",
    name: "Thinking Layers",
    description: "The AI processes information through 12 layers of thinking — each one refines understanding.",
    speakText: "Station 4: Thinking Layers. The AI passes information through 12 layers of thinking. Each layer refines the AI's understanding a little more — like reading a sentence twelve times, getting smarter each time.",
    renderOutput: (_input: string) => (
      <div className="mt-3 flex gap-1 items-end">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${20 + i * 5}px` }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="w-5 rounded-t bg-orange-600 opacity-80"
            title={`Layer ${i + 1}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-2 self-end">12 layers</span>
      </div>
    ),
  },
  {
    id: "prediction",
    emoji: "🎯",
    name: "Word Guesser",
    description: "The AI picks the most likely next word based on everything it has learned.",
    speakText: "Station 5: Word Guesser. After all that processing, the AI predicts the most likely next word. It ranks every word in its vocabulary and picks the best one!",
    renderOutput: (input: string) => {
      const lastWord = (input.trim().split(/\s+/).filter(Boolean).pop() ?? "").toLowerCase();
      const suggestions: Record<string, string[]> = {
        "the": ["cat", "dog", "sun", "sky"],
        "i": ["think", "want", "love", "see"],
        "today": ["is", "was", "feels", "seems"],
        default: ["wonderful", "amazing", "great", "interesting"],
      };
      const options = suggestions[lastWord] ?? suggestions.default;
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((word, i) => (
            <span
              key={word}
              className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                i === 0
                  ? "border-orange-500 bg-orange-700 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-400"
              }`}
            >
              {i === 0 && "✓ "}{word}
            </span>
          ))}
        </div>
      );
    },
  },
];

export default function PipelineSimulator({ onXPEarned, onComplete }: PipelineSimulatorProps) {
  const [inputText, setInputText] = useState("");
  const [activeStation, setActiveStation] = useState(-1);
  const [revealedStations, setRevealedStations] = useState<Set<number>>(new Set());
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setStarted(true);
    setActiveStation(0);
    setRevealedStations(new Set());
    setCompleted(false);
    revealNext(0, new Set());
  };

  const revealNext = (idx: number, revealed: Set<number>) => {
    if (idx >= STATIONS.length) return;
    setTimeout(() => {
      const next = new Set(revealed);
      next.add(idx);
      setRevealedStations(next);
      setActiveStation(idx);
      if (onXPEarned) onXPEarned(15);

      if (idx === STATIONS.length - 1) {
        setTimeout(() => {
          setCompleted(true);
          if (onXPEarned) onXPEarned(30);
          if (onComplete) onComplete();
        }, 1200);
      } else {
        revealNext(idx + 1, next);
      }
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <label className="block text-sm text-gray-400 mb-2">Type a sentence to send through the pipeline:</label>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="e.g. The cat sat on the mat"
            maxLength={60}
            className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-600"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="min-h-[48px] px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-colors"
          >
            🚀 Send through pipeline
          </button>
        </div>
      </div>

      {/* Pipeline stations */}
      {started && (
        <div className="space-y-4">
          {STATIONS.map((station, i) => {
            const isRevealed = revealedStations.has(i);
            const isActive = activeStation === i;
            return (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isRevealed ? 1 : 0.3, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`border rounded-xl p-5 transition-all ${
                  isRevealed
                    ? "border-orange-700 bg-orange-950"
                    : "border-gray-700 bg-gray-900"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.span
                    className="text-2xl"
                    animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {station.emoji}
                  </motion.span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        Station {i + 1}: {station.name}
                      </span>
                      {isRevealed && (
                        <SpeakButton text={station.speakText} theme="amber" size="xs" />
                      )}
                    </div>
                    {isRevealed && (
                      <p className="text-orange-200 text-sm mt-1">{station.description}</p>
                    )}
                  </div>
                  {isRevealed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-orange-400 font-bold text-sm whitespace-nowrap"
                    >
                      +15 XP
                    </motion.span>
                  )}
                </div>
                {isRevealed && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.4 }}
                    >
                      {station.renderOutput(inputText)}
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed badge */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-950 border border-orange-600 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-2">🏭</div>
          <p className="text-orange-200 font-bold text-lg mb-1">Pipeline Pro Badge Unlocked!</p>
          <p className="text-orange-300 text-sm">You sent text through the full transformer pipeline — all 5 stations!</p>
          <p className="text-orange-400 font-bold mt-2">+30 Bonus XP</p>
        </motion.div>
      )}
    </div>
  );
}
