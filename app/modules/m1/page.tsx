"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Tokeniser from "@/components/m1/Tokeniser";
import TokenStats from "@/components/m1/TokenStats";

export default function M1Page() {
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
          <span className="text-4xl">🔤</span>
          <div>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
              Module 1
            </p>
            <h1 className="text-3xl font-bold text-white">Tokenisation</h1>
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          Before an AI can read your words, it has to break them up into small
          pieces called <strong className="text-white">tokens</strong>. Let&apos;s
          see how that works.
        </p>
      </motion.div>

      {/* Concept explainer */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-3">
          What is a token?
        </h2>
        <p className="text-gray-300 mb-3">
          A token is a chunk of text — usually a word, part of a word, or a
          punctuation mark. AI models don&apos;t read letter by letter or word
          by word. They read in <em>tokens</em>.
        </p>
        <p className="text-gray-300 mb-3">
          For example, the word <code className="text-blue-300">&ldquo;unhappiness&rdquo;</code> might
          become three tokens:{" "}
          <code className="text-blue-300">&ldquo;un&rdquo;</code> +{" "}
          <code className="text-blue-300">&ldquo;happi&rdquo;</code> +{" "}
          <code className="text-blue-300">&ldquo;ness&rdquo;</code>. Shorter,
          common words usually stay as one token.
        </p>
        <div className="bg-blue-950 border border-blue-900 rounded-lg p-4 text-sm text-blue-200">
          💡 <strong>Why does it matter?</strong> AI models have a limit on how
          many tokens they can process at once — this is called the{" "}
          <strong>context window</strong>. Understanding tokens helps you
          understand why AI sometimes &ldquo;forgets&rdquo; earlier parts of a
          long conversation.
        </div>
      </motion.section>

      {/* Interactive tokeniser */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Try it yourself
        </h2>
        <Tokeniser />
      </motion.section>

      {/* Stats section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-10"
      >
        <TokenStats />
      </motion.section>

      {/* Key takeaways */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          What you&apos;ve learned
        </h2>
        <ul className="space-y-3">
          {[
            "AI models split text into tokens — not letters, not always whole words",
            "Common words are usually one token; rare or long words get split up",
            "Every token becomes a number that the AI can process mathematically",
            "The total number of tokens determines how much the AI can read at once",
          ].map((point, i) => (
            <li key={i} className="flex gap-3 text-gray-300">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500">Module 1 of 6</span>
          <Link href="/modules/m5" className="text-sm text-green-400 hover:text-green-300 transition-colors">
            Try M5: Prediction →
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
