"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    label: 'Start with "king"',
    emoji: "👑",
    desc: 'The AI has a number list representing "king" — royalty, power, authority.',
    formula: "king",
    color: "text-yellow-400",
  },
  {
    label: 'Subtract "man"',
    emoji: "➖",
    desc: 'Remove the "male" part of the meaning from the number list.',
    formula: "king − man",
    color: "text-red-400",
  },
  {
    label: 'Add "woman"',
    emoji: "➕",
    desc: 'Add the "female" meaning back in.',
    formula: "king − man + woman",
    color: "text-blue-400",
  },
  {
    label: 'Result: "queen"',
    emoji: "👸",
    desc: 'The closest word in the embedding space to that number list is "queen". The AI discovered this by doing maths — not by being told!',
    formula: "≈ queen",
    color: "text-purple-400",
  },
];

export default function AnalogyDemo() {
  const [step, setStep] = useState(0);
  const atEnd = step === steps.length - 1;

  return (
    <div className="bg-gray-900 border border-purple-900 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Analogy by maths: king − man + woman = ?
      </h3>

      {/* Step display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="mb-6"
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl">{steps[step].emoji}</span>
            <div>
              <p className="text-white font-semibold mb-1">{steps[step].label}</p>
              <p className="text-gray-300 text-sm">{steps[step].desc}</p>
              <p className={`font-mono text-lg mt-3 font-bold ${steps[step].color}`}>
                {steps[step].formula}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2 mb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-purple-600" : "bg-gray-700"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-gray-800 text-gray-300 disabled:opacity-30 hover:bg-gray-700 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={atEnd}
          className="px-4 py-2 rounded-lg text-sm bg-purple-700 text-white disabled:opacity-30 hover:bg-purple-600 transition-colors"
        >
          {step === 0 ? "See the maths →" : "Next →"}
        </button>
        {atEnd && (
          <button
            onClick={() => setStep(0)}
            className="px-4 py-2 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
          >
            ↺ Again
          </button>
        )}
      </div>
    </div>
  );
}
