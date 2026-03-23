"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";
import type { ByteEmotion } from "@/components/Byte";

interface SpotlightGameProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

interface Round {
  sentence: string;
  words: string[];
  target: string;
  correct: string;
}

const ROUNDS: Round[] = [
  {
    sentence: "I sat by the river bank",
    words: ["I", "sat", "by", "the", "river", "bank"],
    target: "bank",
    correct: "river",
  },
  {
    sentence: "The cricket bat was heavy",
    words: ["The", "cricket", "bat", "was", "heavy"],
    target: "bat",
    correct: "cricket",
  },
  {
    sentence: "She was a bright student",
    words: ["She", "was", "a", "bright", "student"],
    target: "bright",
    correct: "student",
  },
  {
    sentence: "She drank cold water",
    words: ["She", "drank", "cold", "water"],
    target: "cold",
    correct: "water",
  },
  {
    sentence: "The feather was very light",
    words: ["The", "feather", "was", "very", "light"],
    target: "light",
    correct: "feather",
  },
];

export default function SpotlightGame({ onXPEarned, onComplete }: SpotlightGameProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const [byteMessage, setByteMessage] = useState<string>(
    "Hi! I'm Byte 🔦 Tap the word you think I'm paying most attention to!"
  );
  const [done, setDone] = useState(false);

  const round = ROUNDS[roundIdx];

  const handleSelect = useCallback(
    (word: string) => {
      if (revealed) return;
      if (word === round.target) return; // can't pick the target word

      setSelected(word);
      setRevealed(true);

      const isCorrect = word === round.correct;
      const xp = isCorrect ? 25 : 10;
      setTotalXP((p) => p + xp);
      onXPEarned?.(xp);

      if (isCorrect) {
        setByteEmotion("excited");
        setByteMessage(
          `Yes! That word gives "${round.target}" its meaning here! 🔦`
        );
      } else {
        setByteEmotion("thinking");
        setByteMessage(
          `Close! "${round.target}" actually looks most at "${round.correct}" in this sentence.`
        );
      }
    },
    [revealed, round, onXPEarned]
  );

  const handleNext = useCallback(() => {
    if (roundIdx + 1 >= ROUNDS.length) {
      setDone(true);
      setByteEmotion("celebrating");
      setByteMessage("You're a Spotlight Pro! 🔦🎉");
      onComplete?.();
    } else {
      setRoundIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      setByteEmotion("happy");
      setByteMessage("New sentence! Which word am I focused on? 🔦");
    }
  }, [roundIdx, onComplete]);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <Byte emotion="celebrating" message="Spotlight Pro! 🔦" size={140} />
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">All done! 🎉</p>
          <p className="text-pink-400 font-semibold">5/5 rounds complete</p>
          <p className="text-amber-400 font-semibold text-lg mt-1">
            Total XP: {totalXP}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Badge unlocked: Spotlight Pro 🔦
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-pink-400 font-bold">🔦 Spotlight Game</h3>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>
            Round {roundIdx + 1}/{ROUNDS.length}
          </span>
          <span className="text-amber-400 font-bold">⭐ {totalXP} XP</span>
        </div>
      </div>

      {/* Byte */}
      <div className="flex justify-center mb-4">
        <Byte emotion={byteEmotion} message={byteMessage} size={80} />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={roundIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="bg-pink-950 border border-pink-800 rounded-xl p-4 mb-4 text-center">
            <p className="text-gray-400 text-sm mb-1">
              Byte is thinking about:
            </p>
            <p className="text-2xl font-bold text-pink-300">
              &ldquo;{round.target}&rdquo;
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Which other word do you think Byte is paying most attention to?
            </p>
          </div>

          {/* Word chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {round.words.map((word) => {
              const isTarget = word === round.target;
              const isSelected = selected === word;
              const isCorrect = word === round.correct;

              let chipStyle =
                "bg-gray-800 border-2 border-gray-700 text-white hover:border-pink-500 hover:bg-gray-700";

              if (revealed) {
                if (isTarget) {
                  chipStyle =
                    "bg-pink-950 border-2 border-pink-600 text-pink-200 opacity-80";
                } else if (isCorrect) {
                  chipStyle =
                    "bg-pink-500 border-2 border-pink-300 text-white shadow-[0_0_20px_rgba(236,72,153,0.7)]";
                } else if (isSelected && !isCorrect) {
                  chipStyle =
                    "bg-gray-700 border-2 border-gray-500 text-gray-400 opacity-60";
                } else {
                  chipStyle =
                    "bg-gray-900 border-2 border-gray-800 text-gray-600 opacity-40";
                }
              } else if (isTarget) {
                chipStyle =
                  "bg-pink-950 border-2 border-pink-600 text-pink-200 cursor-default ring-2 ring-pink-500 ring-offset-1 ring-offset-gray-900";
              } else if (isSelected) {
                chipStyle =
                  "bg-pink-600 border-2 border-pink-400 text-white ring-2 ring-pink-400 ring-offset-1 ring-offset-gray-900";
              }

              return (
                <motion.button
                  key={word}
                  onClick={() => handleSelect(word)}
                  disabled={isTarget || revealed}
                  whileTap={!isTarget && !revealed ? { scale: 0.93 } : {}}
                  animate={
                    revealed && isCorrect
                      ? { scale: [1, 1.12, 1], transition: { duration: 0.4 } }
                      : {}
                  }
                  className={`min-h-[48px] px-4 py-2 rounded-xl text-base font-semibold transition-all touch-manipulation
                    ${chipStyle}
                    ${!isTarget && !revealed ? "cursor-pointer active:scale-95" : ""}
                  `}
                >
                  {word}
                  {revealed && isCorrect && (
                    <span className="ml-1 text-sm">🔦</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Explanation after reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium text-center
              ${
                selected === round.correct
                  ? "bg-green-900/60 border border-green-700 text-green-300"
                  : "bg-gray-800/60 border border-gray-700 text-gray-300"
              }`}
          >
            {selected === round.correct ? "✅ Correct! " : "💡 "}
            <span className="text-pink-300 font-semibold">
              &ldquo;{round.correct}&rdquo;
            </span>{" "}
            gives &ldquo;{round.target}&rdquo; its meaning in this sentence.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      {revealed && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="w-full h-12 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-sm transition-colors"
        >
          {roundIdx + 1 >= ROUNDS.length ? "Finish! 🔦" : "Next Round →"}
        </motion.button>
      )}
    </div>
  );
}
