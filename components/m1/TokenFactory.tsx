"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";
import type { ByteEmotion } from "@/components/Byte";

interface TokenFactoryProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

type FactoryToken = { text: string; colorIdx: number };

const SUGGESTIONS = [
  "The cat ran fast.",
  "Unhappiness is complicated.",
  "AI reads tokens not words.",
  "Hello world!",
  "Transformers learn from data.",
];

function factoryTokenise(input: string): FactoryToken[] {
  if (!input.trim()) return [];
  const rawParts = input.match(/\s+|[.,!?;:'"()\-]|[^\s.,!?;:'"()\-]+/g) ?? [];
  const COMMON = new Set(["the","a","an","is","in","on","at","to","and","or","but","of",
    "for","with","that","this","it","he","she","we","they","i","my","your","be","was",
    "are","not","no","so","as","by","from","cat","ran","fast","reads","learn","from"]);
  const tokens: FactoryToken[] = [];
  let colIdx = 0;
  for (const part of rawParts) {
    if (/^\s+$/.test(part)) continue;
    const lower = part.toLowerCase();
    if (COMMON.has(lower) || part.length <= 4) {
      tokens.push({ text: part, colorIdx: colIdx++ % 6 });
    } else {
      let rem = part;
      while (rem.length > 0) {
        const len = rem.length > 7 ? 4 : rem.length;
        tokens.push({ text: rem.slice(0, len), colorIdx: colIdx++ % 6 });
        rem = rem.slice(len);
      }
    }
  }
  return tokens;
}

const TOKEN_COLORS = [
  "bg-orange-600 border-orange-500 text-white",
  "bg-amber-600 border-amber-500 text-white",
  "bg-yellow-600 border-yellow-500 text-white",
  "bg-red-600 border-red-500 text-white",
  "bg-pink-600 border-pink-500 text-white",
  "bg-purple-600 border-purple-500 text-white",
];

const TOTAL_ROUNDS = 5;

export default function TokenFactory({ onXPEarned, onComplete }: TokenFactoryProps) {
  const [round, setRound] = useState(0);
  const [inputText, setInputText] = useState("");
  const [prediction, setPrediction] = useState("");
  const [running, setRunning] = useState(false);
  const [processedTokens, setProcessedTokens] = useState<FactoryToken[] | null>(null);
  const [beltPhase, setBeltPhase] = useState<"idle" | "moving" | "stamping" | "done">("idle");
  const [totalXP, setTotalXP] = useState(0);
  const [xpGain, setXpGain] = useState<{ amount: number; label: string } | null>(null);
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const [byteMessage, setByteMessage] = useState("Type a sentence, predict the tokens, then run the factory! ⚙️");
  const [roundResults, setRoundResults] = useState<{ xp: number; label: string }[]>([]);
  const [finished, setFinished] = useState(false);

  const predictNum = parseInt(prediction, 10);
  const canRun = inputText.trim().length > 0 && prediction.trim().length > 0 && !isNaN(predictNum) && !running;

  const runFactory = useCallback(() => {
    if (!canRun) return;
    setRunning(true);
    setBeltPhase("moving");
    setProcessedTokens(null);

    setTimeout(() => {
      setBeltPhase("stamping");
      const tokens = factoryTokenise(inputText);
      setTimeout(() => {
        setProcessedTokens(tokens);
        setBeltPhase("done");

        const actual = tokens.length;
        const diff = Math.abs(actual - predictNum);
        let xp = 5;
        let label = "Good try! +5 XP";
        let emotion: ByteEmotion = "happy";
        let msg = `${actual} tokens! Off by ${diff}. Keep practising!`;

        if (diff === 0) {
          xp = 30; label = "Exact! +30 XP 🎯"; emotion = "celebrating";
          msg = "Spot on! Perfect prediction! 🎯";
        } else if (diff <= 2) {
          xp = 15; label = "Close! +15 XP"; emotion = "excited";
          msg = "Nice prediction! So close! 🤖";
        } else {
          emotion = "oops";
          msg = `Oops! Tricky one! ${actual} tokens, not ${predictNum}!`;
        }

        setByteEmotion(emotion);
        setByteMessage(msg);
        setTotalXP((prev) => prev + xp);
        onXPEarned?.(xp);
        setXpGain({ amount: xp, label });
        setRoundResults((prev) => [...prev, { xp, label }]);
        setRunning(false);
      }, 1000);
    }, 800);
  }, [canRun, inputText, predictNum, onXPEarned]);

  const nextRound = useCallback(() => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setByteEmotion("celebrating");
      setByteMessage("Factory Master! 🎖️");
      setFinished(true);
      onComplete?.();
    } else {
      setRound((r) => r + 1);
      setInputText("");
      setPrediction("");
      setBeltPhase("idle");
      setProcessedTokens(null);
      setXpGain(null);
      setByteEmotion("happy");
      setByteMessage("Next round! Can you predict the tokens? ⚙️");
    }
  }, [round, onComplete]);

  if (finished) {
    const totalRoundXP = roundResults.reduce((sum, r) => sum + r.xp, 0);
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <Byte emotion="celebrating" message="Token Master! 🎖️" size={140} />
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Factory Complete!</p>
          <p className="text-amber-400 font-semibold text-lg">Total XP: {totalRoundXP}</p>
          <div className="mt-4 space-y-1">
            {roundResults.map((r, i) => (
              <p key={i} className="text-gray-400 text-sm">Round {i + 1}: {r.label}</p>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-3">Badge unlocked: Token Master 🎖️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-amber-400 font-bold">⚙️ Token Factory</h3>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Round {round + 1}/{TOTAL_ROUNDS}</span>
          <span className="text-amber-400 font-bold">⭐ {totalXP} XP</span>
        </div>
      </div>

      {/* Byte */}
      <div className="flex justify-center mb-4">
        <Byte emotion={byteEmotion} message={byteMessage} size={90} />
      </div>

      {/* Factory scene */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-4">
        {/* Conveyor belt */}
        <div className="relative h-16 bg-gray-800 rounded-lg border border-gray-700 flex items-center overflow-hidden mb-3">
          {/* Belt stripes */}
          <div className="absolute inset-0 flex gap-8 opacity-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2 bg-gray-400 h-full"
                animate={beltPhase === "moving" || beltPhase === "stamping" ? { x: [-32, 32] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </div>

          {/* Sentence on belt */}
          <AnimatePresence>
            {beltPhase === "moving" && (
              <motion.div
                initial={{ x: -200 }}
                animate={{ x: 50 }}
                transition={{ duration: 0.8 }}
                className="absolute bg-amber-700 border border-amber-500 rounded-lg px-4 py-2 text-white font-semibold text-sm z-10"
              >
                {inputText}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stamp machine */}
          <motion.div
            className="absolute right-20 h-full flex flex-col items-center justify-center z-20"
            animate={beltPhase === "stamping" ? { y: [0, -8, 8, 0] } : {}}
            transition={{ duration: 0.4, repeat: beltPhase === "stamping" ? 2 : 0 }}
          >
            <div className="bg-gray-700 border-2 border-amber-500 rounded w-12 h-10 flex items-center justify-center text-xl">⚙️</div>
            <div className="w-1 h-4 bg-amber-500" />
          </motion.div>

          {beltPhase === "idle" && (
            <p className="text-gray-600 text-sm italic px-4">Sentence goes here…</p>
          )}
        </div>

        {/* Output bin */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 min-h-[48px]">
          <p className="text-xs text-gray-600 mb-1.5">Output bin 📦</p>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {processedTokens && processedTokens.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
                  className={`px-2 py-1 rounded border text-xs font-mono ${TOKEN_COLORS[t.colorIdx]}`}
                >
                  {t.text} <span className="opacity-50">#{i + 1}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {!processedTokens && beltPhase === "idle" && (
              <span className="text-gray-700 text-xs italic">Tokens appear after running…</span>
            )}
          </div>
          {processedTokens && (
            <p className="text-xs text-amber-400 mt-2 font-semibold">
              Total: {processedTokens.length} tokens
            </p>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Your sentence:</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={beltPhase !== "idle"}
            placeholder="Type a sentence or pick one below…"
            className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white text-sm
              focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
          />
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { if (beltPhase === "idle") setInputText(s); }}
                disabled={beltPhase !== "idle"}
                className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700
                  text-gray-500 hover:text-white px-2 py-1 rounded transition-colors disabled:opacity-40"
              >
                {s.slice(0, 24)}…
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            How many tokens do you predict?
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            disabled={beltPhase !== "idle"}
            placeholder="e.g. 5"
            className="w-28 h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white text-lg font-bold
              focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* XP feedback */}
        <AnimatePresence>
          {xpGain && beltPhase === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-amber-900/40 border border-amber-700 rounded-xl px-4 py-3 text-amber-300 font-semibold text-sm"
            >
              {xpGain.label}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          {beltPhase === "idle" ? (
            <button
              onClick={runFactory}
              disabled={!canRun}
              className={`h-14 px-8 rounded-xl font-bold text-base transition-all flex-1
                ${canRun ? "bg-orange-500 hover:bg-orange-400 text-white" : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
            >
              Run Factory ⚙️
            </button>
          ) : beltPhase === "done" ? (
            <button
              onClick={nextRound}
              className="h-14 px-8 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-xl text-base flex-1"
            >
              {round + 1 >= TOTAL_ROUNDS ? "Finish! 🎖️" : "Next Round →"}
            </button>
          ) : (
            <div className="h-14 px-8 bg-gray-800 text-gray-500 rounded-xl text-base flex-1 flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>⚙️</motion.span>
              Processing…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
