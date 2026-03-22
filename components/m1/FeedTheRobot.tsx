"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";
import type { ByteEmotion } from "@/components/Byte";

interface FeedTheRobotProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

type Token = {
  text: string;
  color: string;
};

const SENTENCES = [
  "The cat sat.",
  "Dogs love to run and play.",
  "Artificial intelligence reads in tokens.",
];

const TOKEN_COLORS = [
  "bg-amber-500 border-amber-400",
  "bg-orange-500 border-orange-400",
  "bg-yellow-500 border-yellow-400",
  "bg-red-500 border-red-400",
  "bg-pink-500 border-pink-400",
];

function simpleSplit(sentence: string): string[] {
  // Educational approximation: words stay as words
  return sentence.replace(/[.,!?]/g, " $& ").trim().split(/\s+/).filter(Boolean);
}

function toTokens(word: string): Token[] {
  const colors = TOKEN_COLORS;
  let idx = 0;
  if (word.length <= 4 || word === word.toLowerCase() && word.length <= 6) {
    return [{ text: word, color: colors[idx % colors.length] }];
  }
  // Split longer words
  const parts: string[] = [];
  let rem = word;
  while (rem.length > 0) {
    const len = rem.length > 6 ? 4 : rem.length;
    parts.push(rem.slice(0, len));
    rem = rem.slice(len);
  }
  return parts.map((p) => ({ text: p, color: colors[idx++ % colors.length] }));
}

const BYTE_QUIPS: Record<string, string[]> = {
  short: ["Yum! 😋", "Tasty! 1 token!", "Easy one! 🤖"],
  medium: ["Yum! That was 2 tokens!", "Crunchy! 🤖", "Nice word!"],
  long: ["Whoa, that's a long word!", "I had to split that one! 🔪", "Wow, lots of tokens! 😮"],
};

function getQuip(tokens: Token[]): string {
  const list = tokens.length === 1 ? BYTE_QUIPS.short : tokens.length === 2 ? BYTE_QUIPS.medium : BYTE_QUIPS.long;
  return list[Math.floor(Math.random() * list.length)];
}

export default function FeedTheRobot({ onXPEarned, onComplete }: FeedTheRobotProps) {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [fedWords, setFedWords] = useState<Set<string>>(new Set());
  const [trayTokens, setTrayTokens] = useState<Token[]>([]);
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const [byteMessage, setByteMessage] = useState<string>("Hi! I'm Byte 🤖 Feed me words!");
  const [totalXP, setTotalXP] = useState(0);
  const [xpFlash, setXpFlash] = useState<{ amount: number; key: number } | null>(null);
  const [chomping, setChomping] = useState(false);
  const [flyingWord, setFlyingWord] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const sentence = SENTENCES[sentenceIdx];
  const words = simpleSplit(sentence);
  const allFed = words.every((w) => fedWords.has(`${sentenceIdx}:${w}:${words.indexOf(w)}`));

  const feedWord = useCallback((word: string, wordIdx: number) => {
    const key = `${sentenceIdx}:${word}:${wordIdx}`;
    if (fedWords.has(key) || chomping) return;

    setFlyingWord(word);
    setChomping(true);
    setByteEmotion("thinking");
    setByteMessage("Mmm, let me process that… ⚙️");

    setTimeout(() => {
      const tokens = toTokens(word);
      setFlyingWord(null);
      setTrayTokens((prev) => [...prev, ...tokens]);
      setFedWords((prev) => new Set([...prev, key]));

      const xp = 5;
      setTotalXP((prev) => prev + xp);
      onXPEarned?.(xp);
      setXpFlash({ amount: xp, key: Date.now() });

      setByteEmotion("happy");
      setByteMessage(getQuip(tokens));
      setChomping(false);
    }, 800);
  }, [sentenceIdx, fedWords, chomping, onXPEarned]);

  const nextSentence = useCallback(() => {
    const bonusXP = 20;
    setTotalXP((prev) => prev + bonusXP);
    onXPEarned?.(bonusXP);
    setXpFlash({ amount: bonusXP, key: Date.now() });
    setByteEmotion("excited");
    setByteMessage("Amazing! Sentence complete! 🎉");

    setTimeout(() => {
      if (sentenceIdx + 1 >= SENTENCES.length) {
        setByteEmotion("celebrating");
        setByteMessage("You're a Token Tamer! 🏅");
        setDone(true);
        onComplete?.();
      } else {
        setSentenceIdx((i) => i + 1);
        setFedWords(new Set());
        setTrayTokens([]);
        setByteEmotion("happy");
        setByteMessage("Ready for more? Feed me! 😋");
      }
    }, 1500);
  }, [sentenceIdx, onXPEarned, onComplete]);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <Byte emotion="celebrating" message="You're a Token Tamer! 🏅" size={140} />
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Sentence Complete!</p>
          <p className="text-amber-400 font-semibold text-lg">Total XP earned: {totalXP}</p>
          <p className="text-gray-400 text-sm mt-2">Badge unlocked: Token Tamer 🏅</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 min-h-[480px]">
      {/* XP counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm">⭐ XP: {totalXP}</span>
          <AnimatePresence>
            {xpFlash && (
              <motion.span
                key={xpFlash.key}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -20 }}
                exit={{}}
                transition={{ duration: 0.8 }}
                className="text-amber-300 font-bold text-sm absolute"
              >
                +{xpFlash.amount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="text-gray-500 text-sm">
          Sentence {sentenceIdx + 1} / {SENTENCES.length}
        </div>
      </div>

      <div className="flex gap-4 flex-col md:flex-row">
        {/* Byte character - left */}
        <div className="flex flex-col items-center gap-2 md:w-1/3">
          <Byte emotion={byteEmotion} message={byteMessage} size={110} />
          {/* Mouth/input slot */}
          <div className="w-20 h-8 bg-gray-800 border-2 border-dashed border-cyan-700 rounded-full flex items-center justify-center text-gray-500 text-xs">
            {chomping ? "😋 nom nom" : "← feed me"}
          </div>
        </div>

        {/* Word area - centre */}
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-3">Tap words to feed them to Byte:</p>
          <div className="flex flex-wrap gap-2 mb-6 min-h-[60px]">
            {words.map((word, i) => {
              const key = `${sentenceIdx}:${word}:${i}`;
              const isFed = fedWords.has(key);
              const isFlying = flyingWord === word;
              return (
                <motion.button
                  key={`${sentenceIdx}-${i}`}
                  onClick={() => feedWord(word, i)}
                  disabled={isFed || chomping}
                  animate={isFlying ? { x: -150, opacity: 0, scale: 0.5 } : {}}
                  transition={{ duration: 0.4 }}
                  className={`
                    min-h-[52px] min-w-[52px] px-4 py-2 rounded-xl font-semibold text-lg border-2 transition-all
                    ${isFed
                      ? "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-50 line-through"
                      : "bg-amber-600 border-amber-500 text-white cursor-pointer hover:bg-amber-500 active:scale-95"
                    }
                  `}
                >
                  {word}
                </motion.button>
              );
            })}
          </div>

          {/* Token tray */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-2">Token tray 📦</p>
            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
              <AnimatePresence>
                {trayTokens.map((token, i) => (
                  <motion.div
                    key={`${i}-${token.text}`}
                    initial={{ opacity: 0, scale: 0.5, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`px-2 py-1 rounded border text-white text-sm font-mono ${token.color}`}
                  >
                    {token.text}
                    <span className="text-xs opacity-60 ml-1">#{i + 1}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {trayTokens.length === 0 && (
                <span className="text-gray-700 text-xs italic">Tokens appear here…</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next sentence button */}
      <AnimatePresence>
        {allFed && !chomping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex justify-center"
          >
            <button
              onClick={nextSentence}
              className="h-14 px-8 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-xl text-base transition-colors"
            >
              {sentenceIdx + 1 >= SENTENCES.length ? "Finish! 🏅" : "Next sentence →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
