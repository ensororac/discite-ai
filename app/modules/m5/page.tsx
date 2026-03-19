"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PredictionExplorer from "@/components/m5/PredictionExplorer";
import TemperatureExplainer from "@/components/m5/TemperatureExplainer";
import data from "@/data/m5-prediction.json";

export default function M5Page() {
  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      {/* Back nav */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to modules
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🎯</span>
          <div>
            <p className="text-xs text-green-400 font-semibold uppercase tracking-widest">Module 5</p>
            <h1 className="text-3xl font-bold text-white">Prediction</h1>
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          Every time an AI generates text, it&apos;s making a prediction — what is the most likely
          next word? Let&apos;s look inside that decision.
        </p>
      </motion.div>

      {/* Concept explainer */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-3">How does AI choose the next word?</h2>
        <p className="text-gray-300 mb-3">
          After converting your text to tokens (M1) and understanding their meaning (M2–M4), the
          AI reaches its most critical step: <strong className="text-white">prediction</strong>.
        </p>
        <p className="text-gray-300 mb-3">
          For every possible next token, the model calculates a <strong className="text-white">probability</strong> —
          how likely is this word to come next, given everything that came before? The model doesn&apos;t
          just pick the most likely word every time — it samples from the distribution, which is
          why AI writing feels varied and natural rather than mechanical.
        </p>
        <div className="bg-green-950 border border-green-900 rounded-lg p-4 text-sm text-green-200">
          💡 <strong>Key insight:</strong> The AI assigns a probability to <em>every single token in its vocabulary</em> —
          all ~100,000 of them — before picking one. The visualiser below shows you the top 8.
        </div>
      </motion.section>

      {/* Interactive prediction explorer */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Explore predictions</h2>
        <p className="text-gray-500 text-sm mb-4">
          Select a scenario to see what the AI thinks comes next — and why.
        </p>
        <PredictionExplorer scenarios={data.scenarios} />
      </motion.section>

      {/* Temperature explainer */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-10"
      >
        <h2 className="text-lg font-semibold text-white mb-2">The temperature dial</h2>
        <p className="text-gray-500 text-sm mb-4">
          AI models have a &ldquo;temperature&rdquo; setting that controls how adventurous their predictions are.
        </p>
        <TemperatureExplainer data={data.temperatureExamples} />
      </motion.section>

      {/* Key takeaways */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">What you&apos;ve learned</h2>
        <ul className="space-y-3">
          {[
            "AI generates text by predicting one token at a time, over and over",
            "Every possible next token gets a probability score — not just the obvious ones",
            "High-confidence predictions (facts, idioms) look very different from ambiguous ones (opinions)",
            "Temperature controls creativity: low = predictable, high = surprising",
            "AI doesn't \"know\" answers — it predicts what text is most likely to follow",
          ].map((point, i) => (
            <li key={i} className="flex gap-3 text-gray-300">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500">Module 5 of 6</span>
          <Link href="/modules/m1" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to M1: Tokenisation
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
