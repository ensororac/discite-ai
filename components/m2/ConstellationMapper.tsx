"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";
import type { ByteEmotion } from "@/components/Byte";

interface ConstellationMapperProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

type Star = { id: string; word: string; x: number; y: number };
type Connection = { a: string; b: string };
type Round = {
  stars: Star[];
  aiConnections: Connection[];
  theme: string;
  byteIntro: string;
};

const ROUNDS: Round[] = [
  {
    theme: "Connect words that feel similar in meaning",
    byteIntro: "These words live in my brain — connect the ones that feel related! ⭐",
    stars: [
      { id: "s1", word: "happy",   x: 20, y: 20 },
      { id: "s2", word: "joyful",  x: 60, y: 10 },
      { id: "s3", word: "sad",     x: 80, y: 35 },
      { id: "s4", word: "gloomy",  x: 70, y: 65 },
      { id: "s5", word: "bright",  x: 35, y: 55 },
      { id: "s6", word: "cheerful",x: 15, y: 75 },
      { id: "s7", word: "rock",    x: 50, y: 85 },
      { id: "s8", word: "stone",   x: 85, y: 80 },
    ],
    aiConnections: [
      { a: "s1", b: "s2" }, { a: "s1", b: "s6" }, { a: "s2", b: "s6" },
      { a: "s3", b: "s4" },
      { a: "s7", b: "s8" },
    ],
  },
  {
    theme: "Connect: ANIMALS",
    byteIntro: "Connect all the ANIMAL words! 🐾",
    stars: [
      { id: "t1", word: "dog",      x: 15, y: 20 },
      { id: "t2", word: "cat",      x: 55, y: 15 },
      { id: "t3", word: "table",    x: 80, y: 30 },
      { id: "t4", word: "lion",     x: 65, y: 60 },
      { id: "t5", word: "chair",    x: 25, y: 60 },
      { id: "t6", word: "eagle",    x: 40, y: 80 },
      { id: "t7", word: "desk",     x: 80, y: 75 },
      { id: "t8", word: "whale",    x: 15, y: 80 },
    ],
    aiConnections: [
      { a: "t1", b: "t2" }, { a: "t1", b: "t4" }, { a: "t1", b: "t6" },
      { a: "t1", b: "t8" }, { a: "t2", b: "t4" }, { a: "t4", b: "t8" },
    ],
  },
];

function connectionKey(a: string, b: string): string {
  return [a, b].sort().join("--");
}

function getStarPos(stars: Star[], id: string, svgW: number, svgH: number): { x: number; y: number } {
  const s = stars.find((st) => st.id === id);
  if (!s) return { x: 0, y: 0 };
  return { x: (s.x / 100) * svgW, y: (s.y / 100) * svgH };
}

export default function ConstellationMapper({ onXPEarned, onComplete }: ConstellationMapperProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [userConnections, setUserConnections] = useState<Connection[]>([]);
  const [selectedStar, setSelectedStar] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("thinking");
  const [byteMessage, setByteMessage] = useState(ROUNDS[0].byteIntro);
  const [done, setDone] = useState(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ w: 400, h: 300 });

  useEffect(() => {
    const update = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setSvgSize({ w: rect.width, h: rect.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const round = ROUNDS[roundIdx];
  const userKeys = new Set(userConnections.map((c) => connectionKey(c.a, c.b)));
  const aiKeys = new Set(round.aiConnections.map((c) => connectionKey(c.a, c.b)));

  const tapStar = useCallback((id: string) => {
    if (revealed) return;
    if (!selectedStar) {
      setSelectedStar(id);
      return;
    }
    if (selectedStar === id) {
      setSelectedStar(null);
      return;
    }
    const key = connectionKey(selectedStar, id);
    if (!userKeys.has(key)) {
      setUserConnections((prev) => [...prev, { a: selectedStar, b: id }]);
    } else {
      // Toggle off: remove connection
      setUserConnections((prev) => prev.filter((c) => connectionKey(c.a, c.b) !== key));
    }
    setSelectedStar(null);
  }, [revealed, selectedStar, userKeys]);

  const revealAI = useCallback(() => {
    const matches = userConnections.filter((c) => aiKeys.has(connectionKey(c.a, c.b))).length;
    const score = aiKeys.size > 0 ? Math.round((matches / aiKeys.size) * 100) : 0;
    let xp = Math.round((score / 100) * 150 / ROUNDS.length);
    xp = Math.max(10, xp);
    setTotalXP((p) => p + xp);
    onXPEarned?.(xp);
    setRoundScores((p) => [...p, score]);
    setRevealed(true);

    if (score >= 80) {
      setByteEmotion("celebrating");
      setByteMessage(`Amazing! ${score}% match! These words live close together in my brain! 🧠`);
    } else if (score >= 50) {
      setByteEmotion("happy");
      setByteMessage(`Good work! ${score}% match. Some connections were tricky!`);
    } else {
      setByteEmotion("thinking");
      setByteMessage(`${score}% match — see the purple lines for my connections! 🤔`);
    }
  }, [userConnections, aiKeys, onXPEarned]);

  const nextRound = useCallback(() => {
    if (roundIdx + 1 >= ROUNDS.length) {
      setDone(true);
      setByteEmotion("celebrating");
      setByteMessage("Meaning Mapper! ⭐");
      onComplete?.();
    } else {
      setRoundIdx((i) => i + 1);
      setUserConnections([]);
      setSelectedStar(null);
      setRevealed(false);
      setByteEmotion("thinking");
      setByteMessage(ROUNDS[roundIdx + 1].byteIntro);
    }
  }, [roundIdx, onComplete]);

  if (done) {
    const avg = roundScores.length > 0 ? Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length) : 0;
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <Byte emotion="celebrating" message="Meaning Mapper! ⭐" size={140} />
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Complete! ⭐</p>
          <p className="text-purple-400 font-semibold">Average match: {avg}%</p>
          <p className="text-amber-400 font-semibold text-lg mt-1">Total XP: {totalXP}</p>
          <p className="text-gray-400 text-sm mt-2">Badge unlocked: Meaning Mapper ⭐</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-purple-400 font-bold">⭐ Constellation Mapper</h3>
        <div className="flex gap-3 text-sm text-gray-500">
          <span>Round {roundIdx + 1}/{ROUNDS.length}</span>
          <span className="text-amber-400 font-bold">⭐ {totalXP} XP</span>
        </div>
      </div>

      <div className="flex justify-center mb-3">
        <Byte emotion={byteEmotion} message={byteMessage} size={80} />
      </div>

      <p className="text-center text-sm text-purple-300 font-medium mb-3">
        {round.theme}
      </p>
      <p className="text-center text-xs text-gray-600 mb-3">
        Tap a star, then tap another to connect them. Tap a connection again to remove it.
      </p>

      {/* Sky canvas */}
      <div className="relative bg-gray-950 border border-gray-800 rounded-xl overflow-hidden mb-4" style={{ paddingBottom: "56%" }}>
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background stars */}
          {Array.from({ length: 30 }).map((_, i) => (
            <circle
              key={i}
              cx={`${5 + (i * 37) % 90}%`}
              cy={`${5 + (i * 23) % 90}%`}
              r={0.5 + (i % 3) * 0.3}
              fill="white"
              opacity={0.2 + (i % 4) * 0.1}
            />
          ))}

          {/* User connections */}
          {userConnections.map((c) => {
            const posA = getStarPos(round.stars, c.a, svgSize.w, svgSize.h);
            const posB = getStarPos(round.stars, c.b, svgSize.w, svgSize.h);
            return (
              <line
                key={connectionKey(c.a, c.b)}
                x1={posA.x} y1={posA.y} x2={posB.x} y2={posB.y}
                stroke="#00d4ff" strokeWidth="1.5" opacity="0.7" strokeDasharray="4 2"
              />
            );
          })}

          {/* AI connections (revealed) */}
          {revealed && round.aiConnections.map((c) => {
            const posA = getStarPos(round.stars, c.a, svgSize.w, svgSize.h);
            const posB = getStarPos(round.stars, c.b, svgSize.w, svgSize.h);
            const isMatch = userKeys.has(connectionKey(c.a, c.b));
            return (
              <line
                key={`ai-${connectionKey(c.a, c.b)}`}
                x1={posA.x} y1={posA.y} x2={posB.x} y2={posB.y}
                stroke={isMatch ? "#34d399" : "#a855f7"}
                strokeWidth="2"
                opacity="0.8"
              />
            );
          })}

          {/* Word stars */}
          {round.stars.map((star) => {
            const cx = (star.x / 100) * svgSize.w;
            const cy = (star.y / 100) * svgSize.h;
            const isSelected = selectedStar === star.id;
            return (
              <g key={star.id} onClick={() => tapStar(star.id)} style={{ cursor: "pointer" }}>
                {/* Tap target */}
                <circle cx={cx} cy={cy} r={24} fill="transparent" />
                {/* Glow */}
                {isSelected && <circle cx={cx} cy={cy} r={18} fill="#00d4ff" opacity={0.3} />}
                {/* Star */}
                <circle cx={cx} cy={cy} r={12} fill={isSelected ? "#00d4ff" : "#1e3a5f"} stroke={isSelected ? "#00d4ff" : "#4b7ea3"} strokeWidth="1.5" />
                <text x={cx} y={cy - 16} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  {star.word}
                </text>
                <circle cx={cx} cy={cy} r={2.5} fill="white" opacity={0.8} />
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
          className="flex gap-4 text-xs mb-3 justify-center"
        >
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-400 inline-block" /> Your correct lines</span>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-purple-500 inline-block" /> AI only</span>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-cyan-400 inline-block border-dashed" /> Your lines</span>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!revealed ? (
          <>
            {userConnections.length > 0 && (
              <button
                onClick={() => setUserConnections([])}
                className="h-12 px-4 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-sm border border-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={revealAI}
              disabled={userConnections.length === 0}
              className={`h-12 px-6 rounded-xl font-bold text-sm flex-1 transition-all
                ${userConnections.length > 0 ? "bg-purple-600 hover:bg-purple-500 text-white" : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
            >
              Reveal AI Map 🤖
            </button>
          </>
        ) : (
          <button
            onClick={nextRound}
            className="h-12 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm flex-1 transition-colors"
          >
            {roundIdx + 1 >= ROUNDS.length ? "Finish! ⭐" : "Next Round →"}
          </button>
        )}
      </div>

      {selectedStar && !revealed && (
        <p className="text-center text-xs text-cyan-400 mt-2 animate-pulse">
          Now tap another star to connect to &quot;{round.stars.find((s) => s.id === selectedStar)?.word}&quot;
        </p>
      )}
    </div>
  );
}
