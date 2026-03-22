"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Byte from "@/components/Byte";

interface StudentLoginProps {
  onLogin: (classCode: string, pin: string, displayName?: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function StudentLogin({ onLogin, isLoading, error }: StudentLoginProps) {
  const [classCode, setClassCode] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isValid = classCode.trim().length >= 2 && pin.trim().length === 4 && /^\d{4}$/.test(pin.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isLoading) return;
    setSubmitted(true);
    await onLogin(classCode.trim().toUpperCase(), pin.trim(), displayName.trim() || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
        >
          {/* Byte greeting */}
          <div className="flex flex-col items-center mb-6">
            <Byte
              emotion="happy"
              message="Hi! I'm Byte 🤖 Let's learn together!"
              size={100}
            />
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-1">
            Join Your Class
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Enter your class code and PIN to save your progress
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Class Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Class Code
              </label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g. 5B"
                maxLength={8}
                autoComplete="off"
                className="w-full h-14 bg-gray-800 border border-gray-700 rounded-xl px-4
                  text-white text-lg font-semibold uppercase tracking-widest
                  focus:outline-none focus:border-cyan-500 transition-colors
                  placeholder:text-gray-600 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
              />
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                4-Digit PIN
              </label>
              <input
                type="tel"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="0000"
                inputMode="numeric"
                maxLength={4}
                className="w-full h-14 bg-gray-800 border border-gray-700 rounded-xl px-4
                  text-white text-2xl font-bold tracking-[0.4em]
                  focus:outline-none focus:border-cyan-500 transition-colors
                  placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-lg placeholder:font-normal"
              />
              <p className="text-xs text-gray-600 mt-1">
                Ask your teacher for your PIN
              </p>
            </div>

            {/* Display name (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Your Name <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should Byte call you?"
                maxLength={30}
                className="w-full h-14 bg-gray-800 border border-gray-700 rounded-xl px-4
                  text-white text-base
                  focus:outline-none focus:border-cyan-500 transition-colors
                  placeholder:text-gray-600"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-2 text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={!isValid || !!isLoading}
              whileTap={{ scale: 0.97 }}
              className={`w-full h-14 rounded-xl font-bold text-base transition-all
                ${isValid && !isLoading
                  ? "bg-cyan-500 hover:bg-cyan-400 text-gray-900 cursor-pointer"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
            >
              {isLoading || submitted ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ⚙️
                  </motion.span>
                  Logging in…
                </span>
              ) : (
                "Let's Go! 🚀"
              )}
            </motion.button>
          </form>

          <p className="text-xs text-gray-700 text-center mt-4">
            No account needed — your progress is saved locally
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
