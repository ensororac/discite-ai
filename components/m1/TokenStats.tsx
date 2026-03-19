"use client";

import { motion } from "framer-motion";

const facts = [
  {
    emoji: "📏",
    stat: "~100,000",
    label: "Tokens in GPT-4's vocabulary",
    detail:
      "Modern AI models have a huge vocabulary of possible tokens — far more than the ~170,000 words in English.",
  },
  {
    emoji: "📖",
    stat: "128,000",
    label: "Token context window (Claude Sonnet)",
    detail:
      "That's roughly 90,000 words — about the length of a full novel that the AI can read at once.",
  },
  {
    emoji: "⚡",
    stat: "~0.75",
    label: "Words per token (average)",
    detail:
      "On average, every token is about three-quarters of a word. A 1,000-word essay is roughly 1,333 tokens.",
  },
  {
    emoji: "🌍",
    stat: "Varies",
    label: "Tokens per language",
    detail:
      "English text is efficient — ~4 characters per token. Some languages use 2–3× more tokens for the same meaning, making AI more expensive to run in those languages.",
  },
];

export default function TokenStats() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-5">Token facts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {facts.map((fact, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{fact.emoji}</span>
              <div>
                <div className="text-xl font-bold text-white">{fact.stat}</div>
                <div className="text-sm text-blue-400 font-medium mb-1">
                  {fact.label}
                </div>
                <div className="text-xs text-gray-400">{fact.detail}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
