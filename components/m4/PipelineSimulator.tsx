"use client";

import { useState, useRef, useCallback } from "react";
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
      const colours = ["bg-blue-700","bg-purple-700","bg-pink-700","bg-orange-700","bg-green-700","bg-teal-700","bg-yellow-700","bg-red-700"];
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {tokens.map((tok, i) => (
            <span key={i} className={`${colours[i % colours.length]} text-white text-sm font-mono px-2 py-1 rounded-lg`}>{tok}</span>
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
              <span className="text-gray-500">[{Array.from({length:4},(_,j)=>((Math.sin(i*7+j)*0.5+0.5)).toFixed(2)).join(", ")}, …]</span>
            </div>
          ))}
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
              <span key={i} className="px-2 py-1 rounded-lg text-sm font-mono text-white" style={{background:`rgba(249,115,22,${opacity})`,boxShadow:`0 0 ${Math.round(strength*12)}px rgba(249,115,22,${opacity*0.8})`}}>
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
    speakText: "Station 4: Thinking Layers. The AI passes information through 12 layers of thinking. Each layer refines the understanding a little more — like reading a sentence twelve times, getting smarter each time.",
    renderOutput: (_input: string) => (
      <div className="mt-3 flex gap-1 items-end">
        {Array.from({length:12},(_,i) => (
          <motion.div key={i} initial={{height:0}} animate={{height:`${20+i*5}px`}} transition={{delay:i*0.06,duration:0.4}}
            className="w-5 rounded-t bg-orange-600 opacity-80" title={`Layer ${i+1}`}/>
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
        "the":["cat","dog","sun","sky"],"i":["think","want","love","see"],"today":["is","was","feels","seems"],
        default:["wonderful","amazing","great","interesting"],
      };
      const options = suggestions[lastWord] ?? suggestions.default;
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((word, i) => (
            <span key={word} className={`px-3 py-1 rounded-lg text-sm font-medium border ${i===0?"border-orange-500 bg-orange-700 text-white":"border-gray-700 bg-gray-800 text-gray-400"}`}>
              {i===0 && "✓ "}{word}
            </span>
          ))}
        </div>
      );
    },
  },
];

function fisherYates(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PipelineSimulator({ onXPEarned, onComplete }: PipelineSimulatorProps) {
  const [inputText, setInputText] = useState("");
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [xpDeducted, setXpDeducted] = useState(false);
  const [run, setRun] = useState<1 | 2>(1);
  const [activeStation, setActiveStation] = useState(-1);
  const [revealedStations, setRevealedStations] = useState<Set<number>>(new Set());
  const [started, setStarted] = useState(false);
  const [run1Complete, setRun1Complete] = useState(false);
  // Run 2 state
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [studentSequence, setStudentSequence] = useState<(number | null)[]>([null,null,null,null,null]);
  const [sequenceChecked, setSequenceChecked] = useState(false);
  const [run2Complete, setRun2Complete] = useState(false);
  const dragStationIndex = useRef<number | null>(null);

  const handleToggleReference = () => {
    const opening = !referenceOpen;
    setReferenceOpen(opening);
    if (opening && !xpDeducted) {
      onXPEarned?.(-5);
      setXpDeducted(true);
    }
  };

  const revealNext = useCallback((idx: number, revealed: Set<number>, text: string) => {
    if (idx >= STATIONS.length) return;
    setTimeout(() => {
      const next = new Set(revealed);
      next.add(idx);
      setRevealedStations(next);
      setActiveStation(idx);
      onXPEarned?.(15);
      if (idx === STATIONS.length - 1) {
        setTimeout(() => {
          setRun1Complete(true);
        }, 1200);
      } else {
        revealNext(idx + 1, next, text);
      }
    }, 900);
  }, [onXPEarned]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setStarted(true);
    setActiveStation(0);
    setRevealedStations(new Set());
    setRun1Complete(false);
    revealNext(0, new Set(), inputText);
  };

  const startRun2 = () => {
    setRun(2);
    setShuffledOrder(fisherYates([0,1,2,3,4]));
    setStudentSequence([null,null,null,null,null]);
    setSequenceChecked(false);
  };

  // Run 2 drag
  const handleDragStation = (stationIdx: number) => { dragStationIndex.current = stationIdx; };
  const handleDragOverSlot = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDropSlot = (slotIdx: number) => {
    const si = dragStationIndex.current;
    if (si === null) return;
    // Remove from previous slot if already placed
    const newSeq = studentSequence.map(v => v === si ? null : v);
    newSeq[slotIdx] = si;
    setStudentSequence(newSeq);
    setSequenceChecked(false);
    dragStationIndex.current = null;
  };

  const checkSequence = () => {
    setSequenceChecked(true);
    const correct = studentSequence.every((v, i) => v === i);
    if (correct) {
      studentSequence.forEach((_, i) => onXPEarned?.(25));
      onXPEarned?.(30);
      setRun2Complete(true);
      onComplete?.();
    }
  };

  const retryRun2 = () => {
    setShuffledOrder(fisherYates([0,1,2,3,4]));
    setStudentSequence([null,null,null,null,null]);
    setSequenceChecked(false);
  };

  const allSlotsFilled = studentSequence.every(v => v !== null);

  return (
    <div className="space-y-5">
      {/* Reference card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <button
          onClick={handleToggleReference}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span>📋 {referenceOpen ? "Hide" : "Show"} reference card</span>
          <span className="text-xs text-gray-600">
            {!xpDeducted ? "(−5 XP hint penalty)" : "(hint used)"}
          </span>
        </button>
        <AnimatePresence>
          {referenceOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-gray-800 px-4 py-3 space-y-2"
            >
              <p className="text-xs text-gray-500 mb-2">The 5 pipeline stations in correct order:</p>
              {STATIONS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 w-5 text-right font-mono">{i+1}.</span>
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-orange-300 font-medium w-32">{s.name}</span>
                  <span className="text-gray-400 text-xs">{s.description}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Run 1 */}
      {run === 1 && (
        <>
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
                    className={`border rounded-xl p-5 transition-all ${isRevealed ? "border-orange-700 bg-orange-950" : "border-gray-700 bg-gray-900"}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <motion.span className="text-2xl" animate={isActive ? {scale:[1,1.3,1]}:{}} transition={{duration:0.5}}>
                        {station.emoji}
                      </motion.span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">Station {i+1}: {station.name}</span>
                          {isRevealed && <SpeakButton text={station.speakText} theme="amber" size="xs" />}
                        </div>
                        {isRevealed && <p className="text-orange-200 text-sm mt-1">{station.description}</p>}
                      </div>
                      {isRevealed && (
                        <motion.span initial={{scale:0}} animate={{scale:1}} className="text-orange-400 font-bold text-sm whitespace-nowrap">
                          +15 XP
                        </motion.span>
                      )}
                    </div>
                    {isRevealed && (
                      <AnimatePresence>
                        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} transition={{duration:0.4}}>
                          {station.renderOutput(inputText)}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {run1Complete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-orange-950 border border-orange-700 rounded-xl p-6 text-center space-y-3"
            >
              <p className="text-orange-200 font-bold text-lg">Pipeline complete! 🎉</p>
              <p className="text-orange-300 text-sm">You sent text through all 5 stations. Now — can you put them in the right order yourself?</p>
              <button
                onClick={startRun2}
                className="min-h-[48px] px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Ready for the real challenge? →
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Run 2 — shuffle and sequence puzzle */}
      {run === 2 && !run2Complete && (
        <div className="space-y-5">
          <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
            <p className="text-orange-200 text-sm font-medium mb-1">
              🏆 Challenge: Drag the stations into the correct pipeline order (1 → 5)
            </p>
            <SpeakButton
              text="Challenge time! Drag each pipeline station card into the correct numbered slot. The correct order is: Word Splitter, Meaning Finder, Focus Helper, Thinking Layers, then Word Guesser."
              theme="amber" size="xs"
            />
          </div>

          {/* Shuffled draggable station cards */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Station cards (drag into the slots below):</p>
            <div className="flex flex-wrap gap-3">
              {shuffledOrder
                .filter(si => !studentSequence.includes(si))
                .map(si => {
                  const s = STATIONS[si];
                  return (
                    <motion.div
                      key={s.id}
                      draggable
                      onDragStart={() => handleDragStation(si)}
                      className="flex items-center gap-2 bg-gray-800 border-2 border-orange-700 hover:border-orange-500 rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing select-none min-h-[52px] transition-all"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-sm font-medium text-orange-300">{s.name}</span>
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* Drop zones */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Pipeline order slots:</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[0,1,2,3,4].map(slotIdx => {
                const placedSi = studentSequence[slotIdx];
                const s = placedSi !== null ? STATIONS[placedSi] : null;
                const isCorrect = sequenceChecked && placedSi === slotIdx;
                const isWrong = sequenceChecked && placedSi !== null && placedSi !== slotIdx;
                return (
                  <div
                    key={slotIdx}
                    onDragOver={handleDragOverSlot}
                    onDrop={() => handleDropSlot(slotIdx)}
                    className={`min-h-[80px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 transition-all ${
                      isCorrect ? "border-green-500 bg-green-950"
                      : isWrong ? "border-red-500 bg-red-950"
                      : s ? "border-orange-600 bg-orange-950/60"
                      : "border-gray-600 bg-gray-800 hover:border-orange-700"
                    }`}
                  >
                    <span className="text-xs text-gray-600 mb-1">Step {slotIdx + 1}</span>
                    {s ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{s.emoji}</span>
                        <span className="text-xs text-orange-300 font-medium text-center">{s.name}</span>
                        {isCorrect && <span className="text-green-400 text-xs font-bold">✓ +25 XP</span>}
                        {isWrong && <span className="text-red-400 text-xs font-bold">✗</span>}
                      </div>
                    ) : (
                      <span className="text-gray-700 text-2xl">?</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={checkSequence}
              disabled={!allSlotsFilled || sequenceChecked}
              className="min-h-[48px] px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors"
            >
              Check my answer!
            </button>
            {sequenceChecked && !run2Complete && (
              <button
                onClick={retryRun2}
                className="min-h-[48px] px-5 py-2 bg-gray-800 border border-gray-700 hover:border-orange-600 text-gray-300 rounded-xl text-sm transition-colors"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {run2Complete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-950 border border-orange-600 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-2">🏭</div>
          <p className="text-orange-200 font-bold text-lg mb-1">Pipeline Pro Badge Unlocked!</p>
          <p className="text-orange-300 text-sm">You sorted the full pipeline from memory — every station in the right order!</p>
          <p className="text-orange-400 font-bold mt-2">+30 Bonus XP</p>
        </motion.div>
      )}
    </div>
  );
}
