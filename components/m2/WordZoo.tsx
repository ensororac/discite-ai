"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";
import type { ByteEmotion } from "@/components/Byte";

interface WordZooProps {
  onXPEarned?: (amount: number) => void;
  onComplete?: () => void;
}

type Category = "animals" | "food" | "transport" | "colours";

interface ZooWord {
  word: string;
  correct: Category;
  emoji: string;
  hint: string;
}

const CATEGORIES: { id: Category; label: string; emoji: string; color: string; bg: string }[] = [
  { id: "animals",   label: "Animals",   emoji: "🦁", color: "border-amber-500 bg-amber-950",  bg: "bg-amber-500" },
  { id: "food",      label: "Food",      emoji: "🍎", color: "border-green-500 bg-green-950",  bg: "bg-green-500" },
  { id: "transport", label: "Transport", emoji: "🚗", color: "border-blue-500 bg-blue-950",    bg: "bg-blue-500" },
  { id: "colours",   label: "Colours",   emoji: "🌈", color: "border-purple-500 bg-purple-950",bg: "bg-purple-500" },
];

const WORDS: ZooWord[] = [
  { word: "elephant",  correct: "animals",   emoji: "🐘", hint: "Elephants are living creatures!" },
  { word: "pizza",     correct: "food",      emoji: "🍕", hint: "You eat pizza — it's a food!" },
  { word: "bicycle",   correct: "transport", emoji: "🚲", hint: "You ride a bicycle to get around!" },
  { word: "blue",      correct: "colours",   emoji: "💙", hint: "Blue is a colour you can see!" },
  { word: "parrot",    correct: "animals",   emoji: "🦜", hint: "Parrots are birds — they're animals!" },
  { word: "mango",     correct: "food",      emoji: "🥭", hint: "Mangoes are delicious fruits!" },
  { word: "rocket",    correct: "transport", emoji: "🚀", hint: "Rockets transport people to space!" },
  { word: "scarlet",   correct: "colours",   emoji: "🔴", hint: "Scarlet is a shade of red — a colour!" },
  { word: "penguin",   correct: "animals",   emoji: "🐧", hint: "Penguins are cute birds!" },
  { word: "spaghetti", correct: "food",      emoji: "🍝", hint: "Spaghetti is an Italian food!" },
  { word: "submarine", correct: "transport", emoji: "🛥️", hint: "Submarines travel underwater!" },
  { word: "crimson",   correct: "colours",   emoji: "🩸", hint: "Crimson is a deep red colour!" },
];

export default function WordZoo({ onXPEarned, onComplete }: WordZooProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [answered, setAnswered] = useState<Map<number, { chosen: Category; correct: boolean }>>(new Map());
  const [feedback, setFeedback] = useState<{ correct: boolean; hint: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const [byteMessage, setByteMessage] = useState("Drag each word-animal to the right pen! 🦁");
  const [unlockedCategories, setUnlockedCategories] = useState(2); // start with 2
  const [done, setDone] = useState(false);
  const dragWord = useRef<ZooWord | null>(null);

  const currentWord = WORDS[wordIndex];
  const visibleCategories = CATEGORIES.slice(0, Math.min(unlockedCategories, CATEGORIES.length));

  const handleDrop = useCallback((category: Category) => {
    if (!dragWord.current) return;
    const word = dragWord.current;
    const correct = word.correct === category;

    const xp = correct ? 20 : 5;
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    setTotalXP((p) => p + xp);
    onXPEarned?.(xp);

    setAnswered((prev) => new Map(prev).set(wordIndex, { chosen: category, correct }));
    setFeedback({ correct, hint: word.hint });

    if (correct) {
      setByteEmotion("excited");
      setByteMessage(newStreak >= 3 ? "3 in a row! 🔥 New exhibit unlocked!" : "That's right! Great job! 🎉");
      if (newStreak >= 2 && unlockedCategories < 4) {
        setUnlockedCategories((p) => Math.min(p + 1, 4));
      }
    } else {
      setByteEmotion("oops");
      setByteMessage(`Hmm! ${word.hint}`);
    }

    setTimeout(() => {
      if (wordIndex + 1 >= WORDS.length) {
        setDone(true);
        setByteEmotion("celebrating");
        setByteMessage("Word Connector badge! 🦁");
        onComplete?.();
      } else {
        setWordIndex((i) => i + 1);
        setFeedback(null);
        setByteEmotion("happy");
        setByteMessage("What about this one? 🤔");
      }
    }, 1800);

    dragWord.current = null;
  }, [wordIndex, streak, unlockedCategories, onXPEarned, onComplete]);

  const handleTap = useCallback((category: Category) => {
    // Touch-friendly: tap category after viewing word
    if (feedback) return;
    handleDrop(category);
  }, [feedback, handleDrop]);

  if (done) {
    const correct = Array.from(answered.values()).filter((a) => a.correct).length;
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <Byte emotion="celebrating" message="Word Connector! 🦁" size={140} />
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Zoo Complete! 🎉</p>
          <p className="text-purple-400 font-semibold">{correct}/{WORDS.length} correct</p>
          <p className="text-amber-400 font-semibold text-lg mt-1">Total XP: {totalXP}</p>
          <p className="text-gray-400 text-sm mt-2">Badge unlocked: Word Connector 🦁</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-purple-400 font-bold">🦁 Word Zoo</h3>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{wordIndex + 1}/{WORDS.length}</span>
          {streak >= 2 && <span className="text-amber-400">🔥 {streak} streak</span>}
          <span className="text-amber-400 font-bold">⭐ {totalXP} XP</span>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <Byte emotion={byteEmotion} message={byteMessage} size={80} />
      </div>

      {/* Current word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={wordIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="flex justify-center mb-6"
        >
          <div
            draggable
            onDragStart={() => { dragWord.current = currentWord; }}
            className="bg-gray-800 border-2 border-purple-600 rounded-2xl px-8 py-5 flex flex-col items-center gap-2
              cursor-grab active:cursor-grabbing select-none touch-manipulation"
          >
            <span className="text-5xl">{currentWord.emoji}</span>
            <span className="text-2xl font-bold text-white">{currentWord.word}</span>
            <span className="text-xs text-gray-500">drag to a pen ↓ or tap a pen below</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium text-center
              ${feedback.correct ? "bg-green-900/60 border border-green-700 text-green-300" : "bg-red-900/60 border border-red-700 text-red-300"}`}
          >
            {feedback.correct ? "✅ Correct! " : "❌ Not quite! "}{feedback.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoo pens */}
      <div className="grid grid-cols-2 gap-3">
        {visibleCategories.map((cat) => (
          <motion.div
            key={cat.id}
            initial={unlockedCategories < CATEGORIES.indexOf(cat) + 1 ? { opacity: 0, scale: 0.8 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(cat.id)}
            onClick={() => handleTap(cat.id)}
            className={`min-h-[80px] rounded-xl border-2 ${cat.color} p-3 flex flex-col items-center justify-center gap-1
              cursor-pointer hover:opacity-90 active:scale-95 transition-transform touch-manipulation`}
          >
            <span className="text-3xl">{cat.emoji}</span>
            <span className="text-sm font-bold text-white">{cat.label}</span>
          </motion.div>
        ))}
        {unlockedCategories < 4 && (
          <div className="min-h-[80px] rounded-xl border-2 border-dashed border-gray-700 p-3 flex flex-col items-center justify-center opacity-40">
            <span className="text-2xl">🔒</span>
            <span className="text-xs text-gray-600">3 streak to unlock</span>
          </div>
        )}
      </div>
    </div>
  );
}
