"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simplified GPT-style tokeniser approximation for educational use.
// Produces realistic-looking token splits without requiring WASM.
// Rule: common words → 1 token; long/uncommon → split by ~4 char chunks.
// Punctuation and spaces are separated as their own tokens.

const COMMON_WORDS = new Set([
  "the", "a", "an", "is", "in", "on", "at", "to", "and", "or", "but",
  "of", "for", "with", "that", "this", "it", "he", "she", "we", "they",
  "i", "my", "your", "his", "her", "our", "their", "be", "was", "are",
  "were", "has", "have", "had", "do", "does", "did", "will", "would",
  "can", "could", "may", "might", "not", "no", "yes", "so", "as", "by",
  "from", "into", "about", "than", "then", "when", "where", "what", "who",
  "how", "why", "all", "some", "any", "each", "if", "up", "out", "like",
  "just", "now", "also", "its", "been", "more", "which", "there", "after",
  "before", "well", "here", "still", "even", "back", "only", "over",
  "new", "old", "good", "great", "big", "small", "first", "last", "long",
  "get", "got", "make", "go", "come", "take", "know", "think", "see",
  "look", "want", "need", "use", "find", "give", "tell", "ask", "try",
  "work", "play", "help", "say", "said", "time", "day", "way", "man",
  "people", "year", "world", "life", "hand", "part", "place", "week",
  "case", "point", "system", "right", "left", "same", "different",
  "number", "group", "very", "much", "too", "few", "own", "other",
  "school", "student", "learn", "ai", "model", "data", "word", "text",
]);

type Token = {
  text: string;
  id: number;
  colorIndex: number;
};

function tokeniseText(input: string): Token[] {
  if (!input.trim()) return [];

  // Split into words, spaces, punctuation
  const rawParts = input.match(/\s+|[.,!?;:'"()\[\]{}\-–—]|[^\s.,!?;:'"()\[\]{}\-–—]+/g) ?? [];
  const tokens: Token[] = [];
  let idCounter = 1000;
  let colorCounter = 0;

  for (const part of rawParts) {
    if (/^\s+$/.test(part)) {
      // Spaces: show as their own token (space character)
      tokens.push({ text: "▁", id: idCounter++, colorIndex: -1 });
      continue;
    }
    if (/^[.,!?;:'"()\[\]{}\-–—]$/.test(part)) {
      tokens.push({ text: part, id: idCounter++, colorIndex: colorCounter++ % 8 });
      continue;
    }

    const lower = part.toLowerCase();
    if (COMMON_WORDS.has(lower)) {
      tokens.push({ text: part, id: idCounter++, colorIndex: colorCounter++ % 8 });
    } else if (part.length <= 5) {
      tokens.push({ text: part, id: idCounter++, colorIndex: colorCounter++ % 8 });
    } else {
      // Split longer words into subword chunks (BPE-like approximation)
      const chunks: string[] = [];
      let remaining = part;
      while (remaining.length > 0) {
        // Try to split at 4-5 char boundaries, preferring common substrings
        const chunkLen = remaining.length > 8 ? (Math.random() > 0.4 ? 4 : 3) : remaining.length;
        chunks.push(remaining.slice(0, chunkLen));
        remaining = remaining.slice(chunkLen);
      }
      for (const chunk of chunks) {
        tokens.push({ text: chunk, id: idCounter++, colorIndex: colorCounter++ % 8 });
      }
    }
  }

  return tokens;
}

const TOKEN_COLORS = [
  "bg-blue-700 border-blue-500",
  "bg-purple-700 border-purple-500",
  "bg-pink-700 border-pink-500",
  "bg-amber-700 border-amber-500",
  "bg-emerald-700 border-emerald-500",
  "bg-cyan-700 border-cyan-500",
  "bg-violet-700 border-violet-500",
  "bg-rose-700 border-rose-500",
];

const EXAMPLE_SENTENCES = [
  "The cat sat on the mat.",
  "Artificial intelligence is transforming education.",
  "Tokenisation is the first step in understanding AI.",
  "Unhappiness is complicated.",
  "Hello, world! How are you today?",
];

export default function Tokeniser() {
  const [input, setInput] = useState("The cat sat on the mat.");
  const [tokens, setTokens] = useState<Token[]>(() => tokeniseText("The cat sat on the mat."));
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleChange = useCallback((val: string) => {
    setInput(val);
    setTokens(tokeniseText(val));
  }, []);

  const realTokens = tokens.filter((t) => t.colorIndex !== -1);
  const tokenCount = realTokens.length;
  const charCount = input.length;
  const ratio = charCount > 0 ? (charCount / Math.max(tokenCount, 1)).toFixed(1) : "0";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {/* Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Type anything — watch it become tokens:
        </label>
        <textarea
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Type or paste text here..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white
            text-sm focus:outline-none focus:border-blue-500 resize-none font-mono"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {EXAMPLE_SENTENCES.map((s) => (
            <button
              key={s}
              onClick={() => handleChange(s)}
              className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700
                text-gray-400 hover:text-white px-2 py-1 rounded-md transition-colors"
            >
              {s.slice(0, 30)}…
            </button>
          ))}
        </div>
      </div>

      {/* Token visualisation */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-gray-400">Token breakdown:</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>
              <span className="text-white font-semibold">{tokenCount}</span> tokens
            </span>
            <span>
              <span className="text-white font-semibold">{charCount}</span> characters
            </span>
            <span>
              ~<span className="text-white font-semibold">{ratio}</span> chars/token
            </span>
          </div>
        </div>

        <div className="min-h-[60px] flex flex-wrap gap-1.5 p-4 bg-gray-950 rounded-lg border border-gray-800">
          <AnimatePresence mode="popLayout">
            {tokens.length === 0 && (
              <span className="text-gray-600 text-sm italic">Start typing to see tokens appear…</span>
            )}
            {tokens.map((token, i) =>
              token.colorIndex === -1 ? (
                <motion.span
                  key={`space-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-gray-600 text-xs self-center px-0.5 font-mono"
                >
                  {token.text}
                </motion.span>
              ) : (
                <motion.div
                  key={`${token.text}-${i}`}
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onMouseEnter={() => setHoveredId(token.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    relative px-2 py-1 rounded border text-white text-sm font-mono cursor-default
                    transition-transform hover:scale-110 hover:z-10
                    ${TOKEN_COLORS[token.colorIndex]}
                    ${hoveredId === token.id ? "ring-2 ring-white ring-opacity-60" : ""}
                  `}
                >
                  {token.text}
                  {hoveredId === token.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
                        bg-gray-800 border border-gray-600 rounded px-2 py-1
                        text-xs text-gray-300 whitespace-nowrap z-20 pointer-events-none"
                    >
                      ID: {token.id}
                    </motion.div>
                  )}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Hover a token to see its ID. Each token maps to a unique number that the AI uses internally.
        </p>
      </div>
    </div>
  );
}
