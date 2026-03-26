"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";
import SpeakButton from "@/components/SpeakButton";
import type { ByteEmotion } from "@/components/Byte";

interface TransformerBuilderProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

interface BrainPiece {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  slotIndex: number;
}

const PIECES: BrainPiece[] = [
  { id: "tokeniser", emoji: "🔤", label: "Word Splitter", hint: "That one breaks words into tiny pieces!", slotIndex: 0 },
  { id: "embeddings", emoji: "🗺️", label: "Meaning Finder", hint: "That one finds meanings for words!", slotIndex: 1 },
  { id: "attention", emoji: "🔦", label: "Focus Helper", hint: "That one helps focus on important words!", slotIndex: 2 },
  { id: "layers", emoji: "🔄", label: "Thinking Layers", hint: "That one does lots of thinking!", slotIndex: 3 },
  { id: "prediction", emoji: "🎯", label: "Word Guesser", hint: "That one guesses the next word!", slotIndex: 4 },
];

const SLOT_LABELS = ["Word Splitter", "Meaning Finder", "Focus Helper", "Thinking Layers", "Word Guesser"];

export default function TransformerBuilder({ onXPEarned, onComplete }: TransformerBuilderProps) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const [byteMessage, setByteMessage] = useState<string>("Drag the brain pieces into the right slots!");
  const [justGlowed, setJustGlowed] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const dragPieceId = useRef<string | null>(null);

  const handleDragStart = (pieceId: string) => {
    dragPieceId.current = pieceId;
  };

  const handleDrop = (slotIndex: number) => {
    const pieceId = dragPieceId.current;
    if (!pieceId) return;

    const piece = PIECES.find((p) => p.id === pieceId);
    if (!piece) return;

    if (piece.slotIndex === slotIndex) {
      // Correct!
      const newSlots = [...slots];
      newSlots[slotIndex] = pieceId;
      setSlots(newSlots);
      const newPlaced = new Set(placed);
      newPlaced.add(pieceId);
      setPlaced(newPlaced);

      const newGlowed = new Set(justGlowed);
      newGlowed.add(pieceId);
      setJustGlowed(newGlowed);
      setTimeout(() => {
        setJustGlowed((g) => {
          const next = new Set(g);
          next.delete(pieceId);
          return next;
        });
      }, 1200);

      if (onXPEarned) onXPEarned(20);
      setByteEmotion("excited");
      setByteMessage("Yes! Great job! 🎉");

      if (newPlaced.size === PIECES.length) {
        setCompleted(true);
        setByteEmotion("celebrating");
        setByteMessage("Amazing! You built the robot brain! 🤖");
        if (onComplete) onComplete();
      } else {
        setTimeout(() => {
          setByteEmotion("happy");
          setByteMessage("Keep going! Find the next piece!");
        }, 1500);
      }
    } else {
      // Wrong slot
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const unplaced = PIECES.filter((p) => !placed.has(p.id));

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="flex items-start gap-3 bg-orange-950 border border-orange-800 rounded-xl p-4">
        <span className="text-2xl">🧩</span>
        <div className="flex-1">
          <p className="text-orange-200 text-sm font-medium mb-1">
            Drag each brain piece into the correct slot on the robot body!
          </p>
          <SpeakButton
            text="Drag each brain piece into the correct slot on the robot body. There are five pieces: Word Splitter, Meaning Finder, Focus Helper, Thinking Layers, and Word Guesser. Put them in order from first to last!"
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

        {/* Main area */}
        <div className="flex-1 space-y-6">
          {/* Robot slots */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Robot Brain Slots:</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {SLOT_LABELS.map((label, i) => {
                const filledPieceId = slots[i];
                const filledPiece = filledPieceId ? PIECES.find((p) => p.id === filledPieceId) : null;
                return (
                  <div
                    key={i}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(i)}
                    className={`
                      min-h-[80px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 transition-all
                      ${filledPiece
                        ? "border-orange-500 bg-orange-950"
                        : "border-gray-600 bg-gray-800 hover:border-orange-700"
                      }
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {filledPiece ? (
                        <motion.div
                          key={filledPiece.id}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{
                            scale: justGlowed.has(filledPiece.id) ? [1, 1.2, 1] : 1,
                            opacity: 1,
                            boxShadow: justGlowed.has(filledPiece.id)
                              ? ["0 0 0px #f97316", "0 0 20px #f97316", "0 0 0px #f97316"]
                              : "none",
                          }}
                          transition={{ duration: 0.5 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-3xl">{filledPiece.emoji}</span>
                          <span className="text-xs text-orange-300 font-medium text-center">{filledPiece.label}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-1 opacity-40"
                        >
                          <span className="text-2xl">❓</span>
                          <span className="text-xs text-gray-500 text-center">{label}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Draggable pieces */}
          {!completed && (
            <div>
              <p className="text-sm text-gray-400 mb-3">Brain pieces to place:</p>
              <div className="flex flex-wrap gap-3">
                {unplaced.map((piece) => (
                  <motion.div
                    key={piece.id}
                    draggable
                    onDragStart={() => handleDragStart(piece.id)}
                    animate={
                      wrongFlash === piece.id
                        ? { x: [-8, 8, -8, 8, 0], transition: { duration: 0.4 } }
                        : {}
                    }
                    className={`
                      min-w-[80px] min-h-[80px] rounded-xl border-2 border-orange-700 bg-gray-800
                      flex flex-col items-center justify-center gap-1 p-3 cursor-grab active:cursor-grabbing
                      hover:border-orange-500 hover:bg-gray-700 transition-all select-none
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-3xl">{piece.emoji}</span>
                    <span className="text-xs text-orange-300 font-medium text-center">{piece.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Completed state */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-orange-950 border border-orange-600 rounded-xl p-6 text-center"
            >
              <div className="text-4xl mb-2">🧩</div>
              <p className="text-orange-200 font-bold text-lg mb-1">Brain Builder Badge Unlocked!</p>
              <p className="text-orange-300 text-sm">You built the robot brain — all 5 pieces in the right order!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
