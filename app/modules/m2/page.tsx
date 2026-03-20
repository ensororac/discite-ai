"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SimilarityExplorer from "@/components/m2/SimilarityExplorer";
import AnalogyDemo from "@/components/m2/AnalogyClock";

export default function M2Page() {
  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
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
          <span className="text-4xl">🗺️</span>
          <div>
            <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest">
              Module 2
            </p>
            <h1 className="text-3xl font-bold text-white">Embeddings</h1>
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          Imagine a secret code that turns every word into a list of numbers
          that captures its <strong className="text-white">meaning</strong>.
          That&apos;s what embeddings do — and words with similar meanings end
          up close together in a special mathematical space.
        </p>
      </motion.div>

      {/* Concept 1 — What is an embedding vector */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-3">
          What is an embedding vector?
        </h2>
        <p className="text-gray-300 mb-3">
          Think of an embedding vector as a unique{" "}
          <strong className="text-white">digital fingerprint</strong> for a
          word. It&apos;s a list of numbers — like coordinates on a map — that
          tells the AI what a word &quot;means&quot; based on how it&apos;s
          used alongside other words.
        </p>
        <p className="text-gray-300">
          Every word gets its own list of numbers. Those numbers don&apos;t
          describe what the word looks like — they describe its{" "}
          <em>meaning and relationships</em> to everything else in the language.
        </p>
      </motion.section>

      {/* Concept 2 — Why similar words are close */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-3">
          Why are similar words &ldquo;close&rdquo;?
        </h2>
        <p className="text-gray-300 mb-3">
          In the AI&apos;s numerical meaning space, words aren&apos;t just
          random points. Words that appear in similar situations — or have
          similar meanings — will naturally have number lists that look very
          alike.
        </p>
        <p className="text-gray-300">
          So <code className="text-purple-300">&quot;happy&quot;</code> and{" "}
          <code className="text-purple-300">&quot;joyful&quot;</code> sit close
          together, while{" "}
          <code className="text-purple-300">&quot;happy&quot;</code> and{" "}
          <code className="text-purple-300">&quot;rock&quot;</code> are far
          apart — just like cities on a real map.
        </p>
      </motion.section>

      {/* Interactive similarity explorer */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Explore word similarity
        </h2>
        <SimilarityExplorer />
      </motion.section>

      {/* Concept 3 — Analogy by maths */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-3">
          Analogy by maths
        </h2>
        <p className="text-gray-300 mb-3">
          Because words are numbers, the AI can actually{" "}
          <strong className="text-white">do arithmetic with meaning</strong>.
          This lets it understand analogies — relationships between ideas —
          without ever being explicitly taught them.
        </p>
        <p className="text-gray-300 mb-5">
          The famous example: take{" "}
          <code className="text-purple-300">&quot;king&quot;</code>, subtract{" "}
          <code className="text-purple-300">&quot;man&quot;</code>, add{" "}
          <code className="text-purple-300">&quot;woman&quot;</code> — and the
          result is closest to{" "}
          <code className="text-purple-300">&quot;queen&quot;</code>.
        </p>
        <AnalogyDemo />
      </motion.section>

      {/* Insight box — scale */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-purple-950 border border-purple-900 rounded-xl p-6">
          <p className="text-purple-200 text-sm">
            🌌 <strong>Did you know?</strong> Real AI embeddings are far more
            complex than a 2D map. Actual embedding vectors can have{" "}
            <strong>hundreds or thousands of numbers</strong> — each dimension
            captures a different subtle aspect of meaning. More dimensions means
            more ways to represent the fine-grained differences between words.
            We visualise them in 2D to make sense of them, but the real space
            is almost unimaginably large.
          </p>
        </div>
      </motion.section>

      {/* Key takeaways */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          What you&apos;ve learned
        </h2>
        <ul className="space-y-3">
          {[
            "Embeddings transform words into numerical representations called vectors.",
            "Similar words are located closer together in the AI's embedding space.",
            "This numerical representation allows AI to understand relationships and analogy through arithmetic.",
            "Embeddings are fundamental to how Large Language Models process meaning.",
          ].map((point, i) => (
            <li key={i} className="flex gap-3 text-gray-300">
              <span className="text-purple-400 mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
          <Link
            href="/modules/m1"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← M1: Tokenisation
          </Link>
          <Link
            href="/modules/m5"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Try M5: Prediction →
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
