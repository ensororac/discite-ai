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
  description: string; // for watch phase narration
}

// Correct order is index 0→4
const PIECES: BrainPiece[] = [
  { id: "tokeniser",  emoji: "🔤", label: "Word Splitter",   hint: "That one breaks words into tiny pieces first!",    description: "breaks your words into tiny token pieces" },
  { id: "embeddings", emoji: "🗺️", label: "Meaning Finder",  hint: "That one finds the meaning of each piece!",        description: "finds the meaning of each token" },
  { id: "attention",  emoji: "🔦", label: "Focus Helper",    hint: "That one helps focus on the important words!",     description: "focuses on the most important words" },
  { id: "layers",     emoji: "🔄", label: "Thinking Layers", hint: "That one does lots of deep thinking!",             description: "does 12 layers of deep thinking" },
  { id: "prediction", emoji: "🎯", label: "Word Guesser",    hint: "That one guesses the next word — it goes last!",   description: "guesses the next word to say" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TransformerBuilder({ onXPEarned, onComplete }: TransformerBuilderProps) {
  const [phase, setPhase] = useState<Phase>(1);
  const [watchStep, setWatchStep] = useState<number>(-1); // -1 = not started, 0-4 = current highlight
  const [watchDone, setWatchDone] = useState(false);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [shuffledPieces, setShuffledPieces] = useState<BrainPiece[]>(PIECES);
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const [byteMessage, setByteMessage] = useState<string | undefined>("Watch how the robot brain is built!");
  const [justGlowed, setJustGlowed] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [advancingToChallenge, setAdvancingToChallenge] = useState(false);
  const dragPieceId = useRef<string | null>(null);
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Phase 1 watch animation
  const startWatch = useCallback(() => {
    setWatchStep(0);
    setWatchDone(false);
    if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    let step = 0;
    const piece = PIECES[0];
    setByteEmotion("excited");
    setByteMessage(`Step 1: ${piece.label} — ${piece.description}!`);

    watchIntervalRef.current = setInterval(() => {
      step++;
      if (step >= PIECES.length) {
        clearInterval(watchIntervalRef.current!);
        setWatchStep(PIECES.length); // all done
        setWatchDone(true);
        setByteEmotion("happy");
        setByteMessage("Got it? Now try it yourself!");
        return;
      }
      setWatchStep(step);
      const p = PIECES[step];
      setByteEmotion("excited");
      setByteMessage(`Step ${step + 1}: ${p.label} — ${p.description}!`);
    }, 1400);
  }, []);

  useEffect(() => {
    // Auto-start watch on mount
    const t = setTimeout(startWatch, 600);
    return () => {
      clearTimeout(t);
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag handlers
  const handleDragStart = (pieceId: string) => { dragPieceId.current = pieceId; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (slotIndex: number) => {
    const pieceId = dragPieceId.current;
    if (!pieceId || slots[slotIndex]) return;
    const piece = PIECES.find((p) => p.id === pieceId);
    if (!piece) return;

    const correctIndex = PIECES.findIndex(p => p.id === pieceId);

    if (correctIndex === slotIndex) {
      // Correct!
      const newSlots = [...slots];
      newSlots[slotIndex] = pieceId;
      setSlots(newSlots);
      const newPlaced = new Set(placed);
      newPlaced.add(pieceId);
      setPlaced(newPlaced);
      setJustGlowed(g => { const n = new Set(g); n.add(pieceId); return n; });
      setTimeout(() => setJustGlowed(g => { const n = new Set(g); n.delete(pieceId); return n; }), 1200);

      const xp = phase === 2 ? 5 : 20;
      onXPEarned?.(xp);

      setByteEmotion("excited");
      setByteMessage(phase === 2 ? "Nice! Keep going!" : "Yes! 🎉 That's right!");

      if (newPlaced.size === PIECES.length) {
        if (phase === 2) {
          // Advance to challenge
          setAdvancingToChallenge(true);
          setByteEmotion("celebrating");
          setByteMessage("Great job! Now for the real challenge...");
          setTimeout(() => {
            setSlots([null, null, null, null, null]);
            setPlaced(new Set());
            setShuffledPieces(shuffle(PIECES));
            setPhase(3);
            setAdvancingToChallenge(false);
            setByteEmotion("happy");
            setByteMessage("Slots are now hidden — can you remember the order?");
          }, 1800);
        } else {
          // Phase 3 complete
          setCompleted(true);
          setByteEmotion("celebrating");
          setByteMessage("Amazing! You built the robot brain! 🤖");
          onComplete?.();
        }
      } else {
        setTimeout(() => {
          setByteEmotion("happy");
          setByteMessage("Keep going — find the next piece!");
        }, 1200);
      }
    } else {
      // Wrong
      setByteEmotion("oops");
      setByteMessage(piece.hint);
      setWrongFlash(pieceId);
      setTimeout(() => {
        setWrongFlash(null);
        setByteEmotion("happy");
        setByteMessage("Try again — you can do it!");
      }, 1400);
    }
    dragPieceId.current = null;
  };

  const unplaced = (phase === 3 ? shuffledPieces : PIECES).filter(p => !placed.has(p.id));

  const phaseLabel = ["", "👀 Watch", "✏️ Copy", "🏆 Challenge"];

  return (
    <div className="space-y-5">
      {/* Phase progress indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as Phase[]).map((p) => (
          <div key={p} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              phase === p
                ? "bg-orange-600 border-orange-500 text-white"
                : phase > p
                ? "bg-gray-700 border-gray-600 text-gray-300"
                : "bg-gray-900 border-gray-700 text-gray-600"
            }`}>
              {phase > p ? "✓" : p} {phaseLabel[p]}
            </div>
            {p < 3 && <span className="text-gray-700 text-xs">→</span>}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="flex items-start gap-3 bg-orange-950 border border-orange-800 rounded-xl p-4">
        <span className="text-2xl">🧩</span>
        <div className="flex-1">
          <p className="text-orange-200 text-sm font-medium mb-1">
            {phase === 1 && "Watch Byte build the robot brain — learn the correct order!"}
            {phase === 2 && "Now copy it! The correct slot is highlighted — drag each piece in."}
            {phase === 3 && "Challenge! Slots are hidden — drag the pieces in the right order from memory!"}
          </p>
          <SpeakButton
            text={
              phase === 1 ? "Watch Byte build the robot brain. Learn the correct order of the five pieces: Word Splitter, Meaning Finder, Focus Helper, Thinking Layers, Word Guesser."
              : phase === 2 ? "Now copy it! The correct slot is highlighted in orange. Drag each brain piece into its matching slot."
              : "Challenge time! The slot labels are hidden. Drag the five brain pieces into the correct order from memory!"
            }
            theme="amber"
            size="xs"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Byte */}
        <div className="flex flex-col items-center gap-2 md:w-32 shrink-0">
          <Byte emotion={byteEmotion} message={byteMessage} size={90} />
        </div>

        <div className="flex-1 space-y-5">
          {/* Robot slots */}
          <div>
            <p className="text-sm text-gray-400 mb-3">
              {phase === 3 ? "Robot Brain Slots (1–5):" : "Robot Brain Slots:"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((i) => {
                const filledId = slots[i];
                const filledPiece = filledId ? PIECES.find(p => p.id === filledId) : null;
                const isWatchHighlight = phase === 1 && watchStep === i;
                const isPulsingSlot = phase === 2 && !slots[i] && placed.size === i; // next expected slot

                return (
                  <div
                    key={i}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(i)}
                    className={`min-h-[88px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 transition-all ${
                      filledPiece
                        ? "border-orange-500 bg-orange-950"
                        : isWatchHighlight
                        ? "border-orange-400 bg-orange-900/50"
                        : isPulsingSlot
                        ? "border-orange-400 bg-orange-900/30"
                        : "border-gray-600 bg-gray-800 hover:border-orange-700"
                    }`}
                  >
                    {/* Pulsing ring for phase 2 */}
                    {isPulsingSlot && (
                      <motion.div
                        className="absolute w-full h-full rounded-xl border-2 border-orange-400"
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.97, 1.02, 0.97] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}
                    <AnimatePresence mode="wait">
                      {filledPiece ? (
                        <motion.div
                          key={filledPiece.id}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{
                            scale: justGlowed.has(filledPiece.id) ? [1, 1.2, 1] : 1,
                            opacity: 1,
                          }}
                          transition={{ duration: 0.4 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-3xl">{filledPiece.emoji}</span>
                          <span className="text-xs text-orange-300 font-medium text-center">{filledPiece.label}</span>
                        </motion.div>
                      ) : isWatchHighlight ? (
                        <motion.div
                          key="watch"
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 0.7, repeat: Infinity }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-3xl">{PIECES[i].emoji}</span>
                          <span className="text-xs text-orange-300 font-bold text-center">{PIECES[i].label}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          className="flex flex-col items-center gap-1 opacity-40"
                        >
                          <span className="text-xl">{phase === 3 ? `${i + 1}` : "❓"}</span>
                          {phase !== 3 && <span className="text-xs text-gray-500 text-center">{PIECES[i].label}</span>}
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
                  onClick={() => {
                    setSlots([null, null, null, null, null]);
                    setPlaced(new Set());
                    setPhase(2);
                    setByteEmotion("happy");
                    setByteMessage("Drag the pieces into the glowing slots!");
                  }}
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

          {/* Phase 2 & 3 draggable pieces */}
          {(phase === 2 || phase === 3) && !completed && !advancingToChallenge && (
            <div>
              <p className="text-sm text-gray-400 mb-3">Brain pieces to place:</p>
              <div className="flex flex-wrap gap-3">
                {unplaced.map((piece) => (
                  <motion.div
                    key={piece.id}
                    draggable
                    onDragStart={() => handleDragStart(piece.id)}
                    animate={wrongFlash === piece.id ? { x: [-8, 8, -8, 8, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="min-w-[80px] min-h-[80px] rounded-xl border-2 border-orange-700 bg-gray-800 flex flex-col items-center justify-center gap-1 p-3 cursor-grab active:cursor-grabbing hover:border-orange-500 hover:bg-gray-700 transition-all select-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-3xl">{piece.emoji}</span>
                    <span className="text-xs text-orange-300 font-medium text-center">{piece.label}</span>
                  </motion.div>
                ))}
              </div>
              {phase === 2 && (
                <p className="text-xs text-gray-600 mt-2 italic">
                  +5 XP per piece in Copy mode · +20 XP per piece in Challenge mode
                </p>
              )}
            </div>
          )}

          {advancingToChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4 text-orange-300 font-bold text-lg"
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
              <p className="text-orange-300 text-sm">You built the robot brain from memory — all 5 pieces in the right order!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
