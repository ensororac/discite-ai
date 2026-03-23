"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";
import type { ByteEmotion } from "@/components/Byte";

interface AttentionBuilderProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

interface RoundData {
  sentence: string;
  words: string[];
  aiPairs: [number, number][]; // word index pairs
}

const ROUNDS: RoundData[] = [
  {
    sentence: "The old man sat quietly by the warm fire",
    words: ["The", "old", "man", "sat", "quietly", "by", "the", "warm", "fire"],
    // (old,man)=1,2  (warm,fire)=7,8  (sat,quietly)=3,4  (man,fire)=2,8
    aiPairs: [
      [1, 2],
      [7, 8],
      [3, 4],
      [2, 8],
    ],
  },
  {
    sentence: "She quickly ran to catch the last bus home",
    words: ["She", "quickly", "ran", "to", "catch", "the", "last", "bus", "home"],
    // (quickly,ran)=1,2  (last,bus)=6,7  (ran,catch)=2,4  (catch,bus)=4,7
    aiPairs: [
      [1, 2],
      [6, 7],
      [2, 4],
      [4, 7],
    ],
  },
  {
    sentence: "The tiny puppy barked loudly at the tall stranger",
    words: ["The", "tiny", "puppy", "barked", "loudly", "at", "the", "tall", "stranger"],
    // (tiny,puppy)=1,2  (tall,stranger)=7,8  (barked,loudly)=3,4  (puppy,stranger)=2,8
    aiPairs: [
      [1, 2],
      [7, 8],
      [3, 4],
      [2, 8],
    ],
  },
];

const MAX_CONNECTIONS = 6;

// Chip layout constants
const CHIP_WIDTH = 72;
const CHIP_HEIGHT = 48;
const CHIP_GAP = 8;
const SVG_PADDING_X = 16;
const SVG_PADDING_Y = 56; // space above for the chips

function pairKey(a: number, b: number): string {
  return [a, b].sort((x, y) => x - y).join("-");
}

function chipCenterX(idx: number): number {
  return SVG_PADDING_X + idx * (CHIP_WIDTH + CHIP_GAP) + CHIP_WIDTH / 2;
}

const CHIP_CENTER_Y = SVG_PADDING_Y + CHIP_HEIGHT / 2;

export default function AttentionBuilder({ onXPEarned, onComplete }: AttentionBuilderProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [firstSelected, setFirstSelected] = useState<number | null>(null);
  const [userPairs, setUserPairs] = useState<[number, number][]>([]);
  const [revealed, setRevealed] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("thinking");
  const [byteMessage, setByteMessage] = useState(
    "Draw attention lines! Tap a word, then tap another to connect them. 🏗️"
  );
  const [done, setDone] = useState(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);

  const round = ROUNDS[roundIdx];
  const userKeys = new Set(userPairs.map(([a, b]) => pairKey(a, b)));
  const aiKeys = new Set(round.aiPairs.map(([a, b]) => pairKey(a, b)));

  // SVG canvas dimensions
  const svgWidth =
    SVG_PADDING_X * 2 + round.words.length * (CHIP_WIDTH + CHIP_GAP) - CHIP_GAP;
  const svgHeight = SVG_PADDING_Y + CHIP_HEIGHT + 60; // extra space below for arcs

  const handleChipTap = useCallback(
    (idx: number) => {
      if (revealed) return;

      if (firstSelected === null) {
        setFirstSelected(idx);
        return;
      }

      if (firstSelected === idx) {
        setFirstSelected(null);
        return;
      }

      const key = pairKey(firstSelected, idx);
      if (userKeys.has(key)) {
        // Remove existing connection
        setUserPairs((prev) =>
          prev.filter(([a, b]) => pairKey(a, b) !== key)
        );
      } else if (userPairs.length < MAX_CONNECTIONS) {
        setUserPairs((prev) => [
          ...prev,
          [firstSelected, idx] as [number, number],
        ]);
      }
      setFirstSelected(null);
    },
    [revealed, firstSelected, userKeys, userPairs.length]
  );

  const handleReveal = useCallback(() => {
    const matches = userPairs.filter(([a, b]) =>
      aiKeys.has(pairKey(a, b))
    ).length;
    const score =
      aiKeys.size > 0 ? Math.round((matches / aiKeys.size) * 100) : 0;
    const xp = Math.max(5, Math.round((score / 100) * 50));
    setTotalXP((p) => p + xp);
    onXPEarned?.(xp);
    setRoundScores((p) => [...p, score]);
    setRevealed(true);

    setByteEmotion(score >= 75 ? "celebrating" : score >= 50 ? "happy" : "thinking");
    setByteMessage(
      `I found ${aiKeys.size} connections — you matched ${matches} of them! ${
        score >= 75 ? "Great thinking! 🏗️" : "Nice work! Check the pink lines 🔍"
      }`
    );
  }, [userPairs, aiKeys, onXPEarned]);

  const handleNext = useCallback(() => {
    if (roundIdx + 1 >= ROUNDS.length) {
      setDone(true);
      setByteEmotion("celebrating");
      setByteMessage("Attention Architect! 🏗️🎉");
      onComplete?.();
    } else {
      setRoundIdx((i) => i + 1);
      setFirstSelected(null);
      setUserPairs([]);
      setRevealed(false);
      setByteEmotion("thinking");
      setByteMessage("New sentence! Draw your attention lines. 🏗️");
    }
  }, [roundIdx, onComplete]);

  if (done) {
    const avg =
      roundScores.length > 0
        ? Math.round(
            roundScores.reduce((a, b) => a + b, 0) / roundScores.length
          )
        : 0;
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <Byte emotion="celebrating" message="Attention Architect! 🏗️" size={140} />
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Complete! 🏗️</p>
          <p className="text-pink-400 font-semibold">
            Average match: {avg}%
          </p>
          <p className="text-amber-400 font-semibold text-lg mt-1">
            Total XP: {totalXP}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Badge unlocked: Attention Architect 🏗️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-pink-400 font-bold">🏗️ Attention Builder</h3>
        <div className="flex gap-3 text-sm text-gray-500">
          <span>
            Round {roundIdx + 1}/{ROUNDS.length}
          </span>
          <span className="text-amber-400 font-bold">⭐ {totalXP} XP</span>
        </div>
      </div>

      {/* Byte */}
      <div className="flex justify-center mb-3">
        <Byte emotion={byteEmotion} message={byteMessage} size={80} />
      </div>

      <p className="text-center text-xs text-gray-500 mb-1">
        Tap a word, then tap another to draw a connection. Up to {MAX_CONNECTIONS} lines.
      </p>
      {firstSelected !== null && !revealed && (
        <p className="text-center text-xs text-pink-400 mb-2 animate-pulse">
          Now tap another word to connect to &ldquo;
          {round.words[firstSelected]}&rdquo;
        </p>
      )}

      {/* Canvas */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto mb-4">
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ minWidth: svgWidth, display: "block" }}
        >
          {/* User connection arcs */}
          {userPairs.map(([a, b]) => {
            const x1 = chipCenterX(a);
            const x2 = chipCenterX(b);
            const y = CHIP_CENTER_Y;
            const mid = (x1 + x2) / 2;
            const dist = Math.abs(x2 - x1);
            const cy = y + dist * 0.35;
            const isMatch = aiKeys.has(pairKey(a, b));
            return (
              <motion.path
                key={`user-${pairKey(a, b)}`}
                d={`M ${x1} ${y} Q ${mid} ${cy} ${x2} ${y}`}
                fill="none"
                stroke={revealed && isMatch ? "#34d399" : "#94a3b8"}
                strokeWidth="2"
                strokeDasharray={revealed ? "none" : "5 3"}
                opacity="0.7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* AI connection arcs (revealed) */}
          {revealed &&
            round.aiPairs.map(([a, b]) => {
              const x1 = chipCenterX(a);
              const x2 = chipCenterX(b);
              const y = CHIP_CENTER_Y;
              const mid = (x1 + x2) / 2;
              const dist = Math.abs(x2 - x1);
              const cy = y + dist * 0.45;
              const isMatch = userKeys.has(pairKey(a, b));
              if (isMatch) return null; // already drawn in green
              return (
                <motion.path
                  key={`ai-${pairKey(a, b)}`}
                  d={`M ${x1} ${y} Q ${mid} ${cy} ${x2} ${y}`}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                  opacity="0.8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.4 }}
                />
              );
            })}

          {/* Word chips */}
          {round.words.map((word, idx) => {
            const cx = chipCenterX(idx);
            const isFirst = firstSelected === idx;
            const isInUserPair = userPairs.some(
              ([a, b]) => a === idx || b === idx
            );
            const isInAiPair =
              revealed && round.aiPairs.some(([a, b]) => a === idx || b === idx);

            return (
              <g
                key={idx}
                onClick={() => handleChipTap(idx)}
                style={{ cursor: revealed ? "default" : "pointer" }}
              >
                {/* Glow ring if selected */}
                {isFirst && (
                  <rect
                    x={cx - CHIP_WIDTH / 2 - 3}
                    y={SVG_PADDING_Y - 3}
                    width={CHIP_WIDTH + 6}
                    height={CHIP_HEIGHT + 6}
                    rx="11"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                )}
                {/* Chip background */}
                <rect
                  x={cx - CHIP_WIDTH / 2}
                  y={SVG_PADDING_Y}
                  width={CHIP_WIDTH}
                  height={CHIP_HEIGHT}
                  rx="8"
                  fill={isFirst ? "#831843" : isInAiPair ? "#4a044e" : "#1f2937"}
                  stroke={
                    isFirst
                      ? "#ec4899"
                      : isInUserPair
                      ? "#94a3b8"
                      : "#374151"
                  }
                  strokeWidth="1.5"
                />
                {/* Word label */}
                <text
                  x={cx}
                  y={SVG_PADDING_Y + CHIP_HEIGHT / 2 + 5}
                  textAnchor="middle"
                  fill={isFirst ? "#fce7f3" : "white"}
                  fontSize="12"
                  fontWeight="600"
                >
                  {word}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-4 text-xs mb-3 justify-center text-gray-400"
        >
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-emerald-400 inline-block" /> Your correct lines
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-pink-500 inline-block" /> AI only
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-slate-400 inline-block" style={{ borderTop: "2px dashed" }} /> Your other lines
          </span>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!revealed ? (
          <>
            {userPairs.length > 0 && (
              <button
                onClick={() => {
                  setUserPairs([]);
                  setFirstSelected(null);
                }}
                className="h-12 px-4 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-sm border border-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleReveal}
              disabled={userPairs.length === 0}
              className={`h-12 px-6 rounded-xl font-bold text-sm flex-1 transition-all
                ${
                  userPairs.length > 0
                    ? "bg-pink-600 hover:bg-pink-500 text-white"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
            >
              Reveal AI Map 🤖
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            className="h-12 px-6 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-sm flex-1 transition-colors"
          >
            {roundIdx + 1 >= ROUNDS.length ? "Finish! 🏗️" : "Next Round →"}
          </button>
        )}
      </div>

      {/* Connection count */}
      {!revealed && (
        <p className="text-center text-xs text-gray-600 mt-2">
          {userPairs.length}/{MAX_CONNECTIONS} connections drawn
        </p>
      )}
    </div>
  );
}
