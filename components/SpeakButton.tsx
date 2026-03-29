"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

interface SpeakButtonProps {
  text: string;
  /** Size variant — default 'sm' */
  size?: "xs" | "sm" | "md";
  /** Optional accessible label */
  label?: string;
  /** Colour theme — default 'blue' */
  theme?: "blue" | "purple" | "pink" | "amber" | "green" | "teal";
}

const THEME_CLASSES: Record<string, { idle: string; speaking: string }> = {
  blue:   { idle: "text-blue-400 hover:text-blue-300 border-blue-700 hover:border-blue-500",   speaking: "text-blue-200 border-blue-400 bg-blue-950" },
  purple: { idle: "text-purple-400 hover:text-purple-300 border-purple-700 hover:border-purple-500", speaking: "text-purple-200 border-purple-400 bg-purple-950" },
  pink:   { idle: "text-pink-400 hover:text-pink-300 border-pink-700 hover:border-pink-500",   speaking: "text-pink-200 border-pink-400 bg-pink-950" },
  amber:  { idle: "text-amber-400 hover:text-amber-300 border-amber-700 hover:border-amber-500", speaking: "text-amber-200 border-amber-400 bg-amber-950" },
  green:  { idle: "text-green-400 hover:text-green-300 border-green-700 hover:border-green-500", speaking: "text-green-200 border-green-400 bg-green-950" },
  teal:   { idle: "text-teal-400 hover:text-teal-300 border-teal-700 hover:border-teal-500",   speaking: "text-teal-200 border-teal-400 bg-teal-950" },
};

const SIZE_CLASSES = {
  xs: "px-2 py-0.5 text-xs gap-1 rounded-md",
  sm: "px-3 py-1 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-1.5 text-sm gap-2 rounded-xl",
};

/**
 * SpeakButton — reads aloud `text` using the Web Speech API.
 * Fully accessible, no API key required.
 */
export default function SpeakButton({
  text,
  size = "sm",
  label,
  theme = "blue",
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Stop on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Cancel anything currently playing
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Prefer a clear, friendly voice — try to pick a child-appropriate one
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("daniel"))
    );
    if (preferred) utterance.voice = preferred;

    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.lang = "en-AU";

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speaking, text]);

  if (!supported) return null;

  const colors = THEME_CLASSES[theme] ?? THEME_CLASSES.blue;

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      title={speaking ? "Stop reading" : (label ?? "Listen to this")}
      aria-label={speaking ? "Stop reading" : (label ?? "Listen to this")}
      className={`
        inline-flex items-center border font-medium transition-all select-none
        ${SIZE_CLASSES[size]}
        ${speaking ? colors.speaking : colors.idle + " bg-transparent"}
      `}
    >
      {/* Speaker icon */}
      <motion.span
        animate={speaking ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="leading-none"
      >
        {speaking ? "🔊" : "🔈"}
      </motion.span>
      <span>{speaking ? "Stop" : "Listen"}</span>
    </motion.button>
  );
}
