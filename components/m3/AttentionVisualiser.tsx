"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Token {
  word: string;
  pos: "DET" | "ADJ" | "NOUN" | "VERB" | "PREP" | "PRON" | "ADV" | "CONJ";
}

interface SentenceData {
  tokens: Token[];
  // attention[i][j] = how much token i attends to token j
  attention: number[][];
  explanations: Record<number, Record<number, string>>;
}

// Linguistic rules for simulated attention
function buildAttention(tokens: Token[]): number[][] {
  const n = tokens.length;
  // Start with small baseline
  const mat: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(0.05)
  );

  tokens.forEach((t, i) => {
    // Diagonal: every word attends to itself a bit
    mat[i][i] = 0.2;

    tokens.forEach((t2, j) => {
      if (i === j) return;

      // DET → next NOUN
      if (t.pos === "DET" && t2.pos === "NOUN" && j > i) {
        mat[i][j] = Math.max(mat[i][j], 0.7 + 0.2 * (j === i + 1 ? 1 : 0));
      }
      // ADJ → adjacent NOUN
      if (t.pos === "ADJ" && t2.pos === "NOUN") {
        const dist = Math.abs(i - j);
        mat[i][j] = Math.max(mat[i][j], dist <= 2 ? 0.8 : 0.3);
      }
      // VERB → NOUN to left (subject)
      if (t.pos === "VERB" && t2.pos === "NOUN" && j < i) {
        mat[i][j] = Math.max(mat[i][j], 0.7);
      }
      // VERB → NOUN to right (object) - a bit less
      if (t.pos === "VERB" && t2.pos === "NOUN" && j > i) {
        mat[i][j] = Math.max(mat[i][j], 0.6);
      }
      // PRON → first NOUN in sentence
      if (t.pos === "PRON" && t2.pos === "NOUN") {
        mat[i][j] = Math.max(mat[i][j], 0.65);
      }
      // PREP → next token
      if (t.pos === "PREP" && j === i + 1) {
        mat[i][j] = Math.max(mat[i][j], 0.75);
      }
      // Nearby word bias
      const dist = Math.abs(i - j);
      if (dist === 1) mat[i][j] = Math.max(mat[i][j], 0.25);
    });
  });

  // Normalise each row so max = 1.0
  mat.forEach((row, i) => {
    const maxVal = Math.max(...row);
    if (maxVal > 0) {
      mat[i] = row.map((v) => Math.round((v / maxVal) * 100) / 100);
    }
  });

  return mat;
}

function buildExplanations(tokens: Token[]): Record<number, Record<number, string>> {
  const exp: Record<number, Record<number, string>> = {};
  tokens.forEach((t, i) => {
    exp[i] = {};
    tokens.forEach((t2, j) => {
      if (i === j) {
        exp[i][j] = `"${t.word}" always attends to itself.`;
        return;
      }
      if (t.pos === "DET" && t2.pos === "NOUN")
        exp[i][j] = `Articles like "${t.word}" point to the noun they describe — "${t2.word}".`;
      else if (t.pos === "ADJ" && t2.pos === "NOUN")
        exp[i][j] = `The adjective "${t.word}" modifies the noun "${t2.word}".`;
      else if (t.pos === "VERB" && t2.pos === "NOUN" && j < i)
        exp[i][j] = `The verb "${t.word}" looks back at its subject "${t2.word}".`;
      else if (t.pos === "VERB" && t2.pos === "NOUN" && j > i)
        exp[i][j] = `The verb "${t.word}" attends to its object "${t2.word}".`;
      else if (t.pos === "PRON" && t2.pos === "NOUN")
        exp[i][j] = `Pronouns like "${t.word}" refer back to nouns — here "${t2.word}".`;
      else if (t.pos === "PREP")
        exp[i][j] = `Prepositions like "${t.word}" link to the word they introduce.`;
      else
        exp[i][j] = `"${t.word}" has some relationship with "${t2.word}" in context.`;
    });
  });
  return exp;
}

const SENTENCES: SentenceData[] = (() => {
  const raw: Token[][] = [
    [
      { word: "The", pos: "DET" },
      { word: "quick", pos: "ADJ" },
      { word: "brown", pos: "ADJ" },
      { word: "fox", pos: "NOUN" },
      { word: "jumps", pos: "VERB" },
      { word: "over", pos: "PREP" },
      { word: "the", pos: "DET" },
      { word: "lazy", pos: "ADJ" },
      { word: "dog", pos: "NOUN" },
    ],
    [
      { word: "She", pos: "PRON" },
      { word: "found", pos: "VERB" },
      { word: "the", pos: "DET" },
      { word: "key", pos: "NOUN" },
      { word: "under", pos: "PREP" },
      { word: "the", pos: "DET" },
      { word: "old", pos: "ADJ" },
      { word: "wooden", pos: "ADJ" },
      { word: "box", pos: "NOUN" },
    ],
    [
      { word: "They", pos: "PRON" },
      { word: "said", pos: "VERB" },
      { word: "the", pos: "DET" },
      { word: "movie", pos: "NOUN" },
      { word: "was", pos: "VERB" },
      { word: "better", pos: "ADJ" },
      { word: "than", pos: "PREP" },
      { word: "the", pos: "DET" },
      { word: "book", pos: "NOUN" },
    ],
  ];
  return raw.map((tokens) => ({
    tokens,
    attention: buildAttention(tokens),
    explanations: buildExplanations(tokens),
  }));
})();

function attentionColor(score: number): string {
  // dark → bright pink
  const r = Math.round(15 + score * (236 - 15));
  const g = Math.round(15 + score * (72 - 15));
  const b = Math.round(30 + score * (153 - 30));
  return `rgb(${r},${g},${b})`;
}

export default function AttentionVisualiser() {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);
  const [showWhy, setShowWhy] = useState(false);

  const data = SENTENCES[sentenceIdx];
  const { tokens, attention, explanations } = data;

  const topAttended =
    selectedToken !== null
      ? attention[selectedToken]
          .map((score, j) => ({ j, score }))
          .filter(({ j }) => j !== selectedToken)
          .sort((a, b) => b.score - a.score)[0]
      : null;

  const handleSentenceChange = (idx: number) => {
    setSentenceIdx(idx);
    setSelectedToken(null);
    setHoveredToken(null);
    setShowWhy(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-pink-400 font-bold">🔍 Attention Visualiser</h3>
        <span className="text-xs text-gray-500">Yr 7–8</span>
      </div>

      {/* Sentence selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SENTENCES.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSentenceChange(i)}
            className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium border transition-all
              ${
                sentenceIdx === i
                  ? "bg-pink-700 border-pink-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-pink-700"
              }`}
          >
            Sentence {i + 1}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Click any word to see what it pays attention to.
      </p>

      {/* Token row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tokens.map((token, i) => {
          const isSelected = selectedToken === i;
          const score =
            selectedToken !== null ? attention[selectedToken][i] : null;

          return (
            <motion.button
              key={i}
              onClick={() => setSelectedToken(isSelected ? null : i)}
              onMouseEnter={() => setHoveredToken(i)}
              onMouseLeave={() => setHoveredToken(null)}
              whileTap={{ scale: 0.93 }}
              style={
                score !== null && !isSelected
                  ? {
                      backgroundColor: attentionColor(score),
                      borderColor: attentionColor(score + 0.2),
                    }
                  : {}
              }
              className={`min-h-[48px] px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all relative
                ${
                  isSelected
                    ? "bg-pink-600 border-pink-400 text-white shadow-[0_0_16px_rgba(236,72,153,0.6)]"
                    : score !== null
                    ? "text-white border-transparent"
                    : "bg-gray-800 border-gray-700 text-white hover:border-pink-600"
                }`}
            >
              {token.word}
              {score !== null && !isSelected && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-gray-900 text-pink-300 rounded-full px-1 font-mono leading-tight border border-gray-700">
                  {score.toFixed(1)}
                </span>
              )}
              {hoveredToken === i && score !== null && !isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap z-10 pointer-events-none"
                >
                  {score.toFixed(2)}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Attention bar chart */}
      <AnimatePresence mode="wait">
        {selectedToken !== null && (
          <motion.div
            key={selectedToken}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mb-5"
          >
            <p className="text-xs text-gray-500 mb-2">
              Attention from{" "}
              <span className="text-pink-300 font-semibold">
                &ldquo;{tokens[selectedToken].word}&rdquo;
              </span>{" "}
              to each word:
            </p>
            <div className="space-y-1.5">
              {tokens.map((t, j) => {
                const score = attention[selectedToken][j];
                return (
                  <div key={j} className="flex items-center gap-2">
                    <span className="w-20 text-right text-xs text-gray-400 shrink-0">
                      {t.word}
                    </span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 100}%` }}
                        transition={{ duration: 0.4, delay: j * 0.03 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: attentionColor(score) }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-gray-500 font-mono">
                      {score.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Why toggle */}
            {topAttended && (
              <div className="mt-4">
                <button
                  onClick={() => setShowWhy((w) => !w)}
                  className="text-xs text-pink-400 hover:text-pink-300 font-medium underline underline-offset-2 transition-colors"
                >
                  {showWhy ? "Hide explanation" : "Why? 💡"}
                </button>
                <AnimatePresence>
                  {showWhy && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 bg-pink-950 border border-pink-800 rounded-xl p-3 text-sm text-pink-200">
                        <p>
                          🔦 Top word:{" "}
                          <strong className="text-white">
                            &ldquo;{tokens[topAttended.j].word}&rdquo;
                          </strong>{" "}
                          ({topAttended.score.toFixed(2)})
                        </p>
                        <p className="mt-1 text-pink-300 text-xs">
                          {explanations[selectedToken][topAttended.j]}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedToken === null && (
        <div className="text-center py-6 text-gray-600 text-sm">
          ☝️ Click a word above to see its attention pattern
        </div>
      )}

      {/* Part-of-speech legend */}
      <div className="mt-2 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 mb-2">Word types in this sentence:</p>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(tokens.map((t) => t.pos))).map((pos) => (
            <span
              key={pos}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
            >
              {pos}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
