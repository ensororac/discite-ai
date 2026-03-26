"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";
import SpeakButton from "@/components/SpeakButton";
import type { ByteEmotion } from "@/components/Byte";

interface TransformerBuilderProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

type Phase = 1 | 2 | 3;

interface BrainPiece {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  description: string;
  correctSlot: number; // 0-4, the slot this piece belongs in (always fixed)
}

// correctSlot = position in the pipeline (0 = first, 4 = last)
const PIECES: BrainPiece[] = [
  { id: "tokeniser",  emoji: "🔤", label: "Word Splitter",   correctSlot: 0, hint: "That one breaks words into tiny pieces first!",    description: "breaks your words into tiny token pieces" },
  { id: "embeddings", emoji: "🗺️", label: "Meaning Finder",  correctSlot: 1, hint: "That one finds the meaning of each piece!",        description: "finds the meaning of each token" },
  { id: "attention",  emoji: "🔦", label: "Focus Helper",    correctSlot: 2, hint: "That one helps focus on the important words!",     description: "focuses on the most important words" },
  { id: "layers",     emoji: "🔄", label: "Thinking Layers", correctSlot: 3, hint: "That one does lots of deep thinking!",             description: "does 12 layers of deep thinking" },
  { id: "prediction", emoji: "🎯", label: "Word Guesser",    correctSlot: 4, hint: "That one guesses the next word — it goes last!",   description: "guesses the next word to say" },
];

// Fisher-Yates shuffle — always returns a NEW array in a different order
function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  // Keep shuffling until the order is actually different
  let attempts = 0;
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    attempts++;
  } while (attempts < 5 && a.every((v, i) => v === arr[i]));
  return a;
}

const phaseLabel: Record<Phase, string> = { 1: "👀 Watch", 2: "✏️ Copy", 3: "🏆 Challenge" };

export default function TransformerBuilder({ onXPEarned, onComplete }: TransformerBuilderProps) {
  const [phase, setPhase] = useState<Phase>(1);

  // Phase 1
  const [watchStep, setWatchStep] = useState<number>(-1);
  const [watchDone, setWatchDone] = useState(false);
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Phase 2 & 3 shared
  // slots[0..4] = pieceId placed in that slot position, or null
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [justGlowed, setJustGlowed] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Phase 3: shuffled piece display order (pre-computed at phase transition)
  const [p3PieceOrder, setP3PieceOrder] = useState<BrainPiece[]>([]);

  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const [byteMessage, setByteMessage] = useState<string | undefined>("Watch how the robot brain is built!");

  const dragPieceId = useRef<string | null>(null);

  // ── Phase 1: watch animation ──────────────────────────────────────────────

  const startWatch = useCallback(() => {
    if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    setWatchDone(false);
    setWatchStep(0);
    setByteEmotion("excited");
    setByteMessage(`Step 1: ${PIECES[0].label} — ${PIECES[0].description}!`);

    let step = 0;
    watchIntervalRef.current = setInterval(() => {
      step++;
      if (step >= PIECES.length) {
        clearInterval(watchIntervalRef.current!);
        watchIntervalRef.current = null;
        setWatchStep(PIECES.length);
        setWatchDone(true);
        setByteEmotion("happy");
        setByteMessage("Got it? Now try it yourself!");
        return;
      }
      setWatchStep(step);
      setByteEmotion("excited");
      setByteMessage(`Step ${step + 1}: ${PIECES[step].label} — ${PIECES[step].description}!`);
    }, 1400);
  }, []);

  useEffect(() => {
    const t = setTimeout(startWatch, 600);
    return () => {
      clearTimeout(t);
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterPhase2 = () => {
    if (watchIntervalRef.current) { clearInterval(watchIntervalRef.current); watchIntervalRef.current = null; }
    setSlots([null, null, null, null, null]);
    setPlaced(new Set());
    setPhase(2);
    setByteEmotion("happy");
    setByteMessage("Drag each piece into the glowing slot!");
  };

  const enterPhase3 = () => {
    // Pre-compute shuffled order NOW, before any state update
    const newOrder = shuffled(PIECES);
    setP3PieceOrder(newOrder);
    setSlots([null, null, null, null, null]);
    setPlaced(new Set());
    setTransitioning(false);
    setPhase(3);
    setByteEmotion("happy");
    setByteMessage("Slots are hidden — remember the order!");
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const handleDragStart = (pieceId: string) => { dragPieceId.current = pieceId; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (slotIndex: number) => {
    const pieceId = dragPieceId.current;
    dragPieceId.current = null;

    if (!pieceId) return;
    if (slots[slotIndex] !== null) return; // slot already filled

    const piece = PIECES.find(p => p.id === pieceId);
    if (!piece) return;

    if (piece.correctSlot === slotIndex) {
      // ✅ Correct placement
      const newSlots = [...slots];
      newSlots[slotIndex] = pieceId;
      setSlots(newSlots);

      const newPlaced = new Set(placed);
      newPlaced.add(pieceId);
      setPlaced(newPlaced);

      // Glow effect
      setJustGlowed(g => { const n = new Set(g); n.add(pieceId); return n; });
      setTimeout(() => setJustGlowed(g => { const n = new Set(g); n.delete(pieceId); return n; }), 1200);

      onXPEarned?.(phase === 2 ? 5 : 20);
      setByteEmotion("excited");
      setByteMessage(phase === 2 ? "Nice! Keep going!" : "Yes! 🎉 That's right!");

      const allDone = newPlaced.size === PIECES.length;
      if (allDone) {
        if (phase === 2) {
          setTransitioning(true);
          setByteEmotion("celebrating");
          setByteMessage("Great job! Now for the real challenge...");
          setTimeout(enterPhase3, 1800);
        } else {
          // Phase 3 complete
          setCompleted(true);
          setByteEmotion("celebrating");
          setByteMessage("Amazing! You built it from memory! 🤖");
          onComplete?.();
        }
      } else {
        setTimeout(() => {
          setByteEmotion("happy");
          setByteMessage("Keep going — find the next piece!");
        }, 1200);
      }
    } else {
      // ❌ Wrong slot
      setByteEmotion("oops");
      setByteMessage(piece.hint);
      setWrongFlash(pieceId);
      setTimeout(() => {
        setWrongFlash(null);
        setByteEmotion("happy");
        setByteMessage("Try again — you can do it!");
      }, 1400);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  // Which pieces are still available to drag (not yet placed)
  const pieceSource = phase === 3 ? p3PieceOrder : PIECES;
  const unplaced = pieceSource.filter(p => !placed.has(p.id));

  // Phase 2: the NEXT slot to fill is the first empty one in order
  const nextExpectedSlot = phase === 2
    ? slots.findIndex(s => s === null)
    : -1;

  return (
    <div className="space-y-5">

      {/* Phase progress bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {([1, 2, 3] as Phase[]).map((p) => (
          <div key={p} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              phase === p   ? "bg-orange-600 border-orange-500 text-white" :
              phase > p     ? "bg-gray-700 border-gray-600 text-gray-300" :
                              "bg-gray-900 border-gray-700 text-gray-600"
            }`}>
              {phase > p ? "✓" : p} {phaseLabel[p]}
            </div>
            {p < 3 && <span className="text-gray-700 text-xs">→</span>}
          </div>
        ))}
      </div>

      {/* Instructions banner */}
      <div className="flex items-start gap-3 bg-orange-950 border border-orange-800 rounded-xl p-4">
        <span className="text-2xl">🧩</span>
        <div className="flex-1">
          <p className="text-orange-200 text-sm font-medium mb-1">
            {phase === 1 && "Watch Byte build the robot brain — learn the correct order!"}
            {phase === 2 && "Now copy it! The correct slot glows orange — drag each piece in."}
            {phase === 3 && "Challenge! Slot labels are hidden — drag the pieces in the right order from memory!"}
          </p>
          <SpeakButton
            text={
              phase === 1 ? "Watch Byte build the robot brain. Learn the correct order: Word Splitter, Meaning Finder, Focus Helper, Thinking Layers, Word Guesser." :
              phase === 2 ? "Now copy it! The correct next slot glows orange. Drag each brain piece into its matching slot." :
              "Challenge time! Slot labels are hidden. Drag the five brain pieces into slots 1 to 5 in the correct order from memory!"
            }
            theme="amber"
            size="xs"
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* Byte mascot */}
        <div className="flex flex-col items-center gap-2 md:w-32 shrink-0">
          <Byte emotion={byteEmotion} message={byteMessage} size={90} />
        </div>

        <div className="flex-1 space-y-5">

          {/* Robot brain slots */}
          <div>
            <p className="text-sm text-gray-400 mb-3">
              {phase === 3 ? "Robot Brain Slots (1 = first, 5 = last):" : "Robot Brain Slots:"}
            </p>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[0, 1, 2, 3, 4].map((slotIdx) => {
                const filledId = slots[slotIdx];
                const filledPiece = filledId ? PIECES.find(p => p.id === filledId) : null;
                const isWatchActive = phase === 1 && watchStep === slotIdx;
                const isPulsingNext = slotIdx === nextExpectedSlot;

                return (
                  <div
                    key={slotIdx}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(slotIdx)}
                    className={`relative min-h-[88px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 transition-all ${
                      filledPiece   ? "border-orange-500 bg-orange-950" :
                      isWatchActive ? "border-orange-400 bg-orange-900/50" :
                      isPulsingNext ? "border-orange-400 bg-orange-900/30" :
                                      "border-gray-600 bg-gray-800 hover:border-orange-700"
                    }`}
                  >
                    {/* Pulsing ring for phase 2 next slot */}
                    {isPulsingNext && (
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-orange-400 pointer-events-none"
                        animate={{ opacity: [0.4, 1, 0.4], scale: [0.97, 1.03, 0.97] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                      />
                    )}

                    <AnimatePresence mode="wait">
                      {filledPiece ? (
                        // Placed piece
                        <motion.div
                          key={filledPiece.id}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: justGlowed.has(filledPiece.id) ? [1, 1.25, 1] : 1, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="flex flex-col items-center gap-1 text-center"
                        >
                          <span className="text-2xl sm:text-3xl">{filledPiece.emoji}</span>
                          <span className="text-xs text-orange-300 font-medium leading-tight">{filledPiece.label}</span>
                        </motion.div>
                      ) : isWatchActive ? (
                        // Watch phase highlight
                        <motion.div
                          key={`watch-${slotIdx}`}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="flex flex-col items-center gap-1 text-center"
                        >
                          <span className="text-2xl sm:text-3xl">{PIECES[slotIdx].emoji}</span>
                          <span className="text-xs text-orange-300 font-bold leading-tight">{PIECES[slotIdx].label}</span>
                        </motion.div>
                      ) : (
                        // Empty slot
                        <motion.div key="empty" className="flex flex-col items-center gap-1 opacity-40 text-center">
                          <span className="text-lg sm:text-xl">
                            {phase === 3 ? `${slotIdx + 1}` : "❓"}
                          </span>
                          {phase !== 3 && (
                            <span className="text-xs text-gray-500 leading-tight">{PIECES[slotIdx].label}</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase 1 controls */}
          {phase === 1 && (
            <div className="flex gap-3 flex-wrap">
              {watchDone && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={enterPhase2}
                  className="min-h-[44px] px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Try it yourself! →
                </motion.button>
              )}
              <button
                onClick={startWatch}
                className="min-h-[44px] px-4 py-2 bg-gray-800 border border-gray-700 hover:border-orange-700 text-gray-300 rounded-xl text-sm transition-colors"
              >
                Watch again
              </button>
            </div>
          )}

          {/* Phase 2 & 3: draggable pieces */}
          {(phase === 2 || phase === 3) && !completed && !transitioning && (
            <div>
              <p className="text-sm text-gray-400 mb-3">Brain pieces to place:</p>
              <div className="flex flex-wrap gap-3">
                {unplaced.map((piece) => (
                  <motion.div
                    key={piece.id}
                    draggable
                    onDragStart={() => handleDragStart(piece.id)}
                    animate={wrongFlash === piece.id ? { x: [-8, 8, -8, 8, 0] } : {}}
                    transition={{ duration: 0.35 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="min-w-[80px] min-h-[80px] rounded-xl border-2 border-orange-700 bg-gray-800 flex flex-col items-center justify-center gap-1 p-3 cursor-grab active:cursor-grabbing hover:border-orange-500 hover:bg-gray-700 transition-colors select-none"
                  >
                    <span className="text-3xl">{piece.emoji}</span>
                    <span className="text-xs text-orange-300 font-medium text-center leading-tight">{piece.label}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2 italic">
                {phase === 2 ? "+5 XP per piece (Copy mode)" : "+20 XP per piece (Challenge mode)"}
              </p>
            </div>
          )}

          {/* Transitioning to phase 3 */}
          {transitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-orange-300 font-bold text-lg"
            >
              🏆 Get ready for the challenge...
            </motion.div>
          )}

          {/* Completed */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-orange-950 border border-orange-600 rounded-xl p-6 text-center"
            >
              <div className="text-4xl mb-2">🧩</div>
              <p className="text-orange-200 font-bold text-lg mb-1">Brain Builder Badge Unlocked!</p>
              <p className="text-orange-300 text-sm">
                You built the robot brain from memory — all 5 pieces in the right order!
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
