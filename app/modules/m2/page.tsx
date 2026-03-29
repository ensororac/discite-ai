"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SimilarityExplorer from "@/components/m2/SimilarityExplorer";
import AnalogyDemo from "@/components/m2/AnalogyClock";
import WordZoo from "@/components/m2/WordZoo";
import ConstellationMapper from "@/components/m2/ConstellationMapper";
import XPBar from "@/components/XPBar";
import Byte from "@/components/Byte";
import StudentLogin from "@/components/StudentLogin";
import { useStudent } from "@/hooks/useStudent";
import SpeakButton from "@/components/SpeakButton";

type YearBand = "yr3-4" | "yr5-6" | "yr7-8" | "yr9-10";

const YEAR_BANDS: { id: YearBand; label: string; color: string; activeColor: string }[] = [
  { id: "yr3-4",  label: "Yr 3–4",  color: "bg-gray-800 border-gray-700 text-gray-400",   activeColor: "bg-purple-600 border-purple-500 text-white" },
  { id: "yr5-6",  label: "Yr 5–6",  color: "bg-gray-800 border-gray-700 text-gray-400",   activeColor: "bg-indigo-600 border-indigo-500 text-white" },
  { id: "yr7-8",  label: "Yr 7–8",  color: "bg-gray-800 border-gray-700 text-gray-400",   activeColor: "bg-blue-600 border-blue-500 text-white" },
  { id: "yr9-10", label: "Yr 9–10", color: "bg-gray-800 border-gray-700 text-gray-400",   activeColor: "bg-violet-600 border-violet-500 text-white" },
];

const isLowerYear = (band: YearBand) => band === "yr3-4" || band === "yr5-6";

export default function M2Page() {
  const [yearBand, setYearBand] = useState<YearBand>("yr7-8");
  const [activityDone, setActivityDone] = useState(false);
  const student = useStudent();

  const handleXPEarned = async (amount: number) => {
    if (student.isLoggedIn) {
      await student.earnXP("m2", yearBand, yearBand === "yr3-4" ? "word-zoo" : "constellation-mapper", amount);
    }
  };

  const handleComplete = async () => {
    setActivityDone(true);
    if (student.isLoggedIn) {
      await student.earnXP("m2", yearBand, yearBand === "yr3-4" ? "word-zoo-complete" : "constellation-mapper-complete", 0);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      {/* Student login modal */}
      {!student.isLoggedIn && isLowerYear(yearBand) && (
        <StudentLogin
          onLogin={student.login}
          isLoading={student.isLoading}
          error={student.loginError}
        />
      )}

      {/* Byte fixed in lower-left for lower year activities */}
      {isLowerYear(yearBand) && student.isLoggedIn && (
        <div className="fixed bottom-6 left-4 z-40 hidden md:block">
          <Byte emotion={activityDone ? "celebrating" : "happy"} size={80} />
        </div>
      )}

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
        className="mb-8"
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
        <div className="mt-3">
          <SpeakButton
            text="Imagine a secret code that turns every word into a list of numbers that captures its meaning. That's what embeddings do — and words with similar meanings end up close together in a special mathematical space."
            theme="purple"
          />
        </div>
      </motion.div>

      {/* Year band selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-6"
      >
        <p className="text-sm text-gray-500 mb-3">Select your year level:</p>
        <div className="flex flex-wrap gap-2">
          {YEAR_BANDS.map((band) => (
            <button
              key={band.id}
              onClick={() => { setYearBand(band.id); setActivityDone(false); }}
              className={`min-h-[48px] px-5 py-2 rounded-xl border-2 font-bold text-sm transition-all
                ${yearBand === band.id ? band.activeColor : band.color + " hover:text-white hover:border-gray-600"}`}
            >
              {band.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* XP Bar — show when logged in */}
      {student.isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <XPBar xp={student.xp} previousXp={student.previousXp} />
        </motion.div>
      )}

      {/* Lower year activities */}
      <AnimatePresence mode="wait">
        {yearBand === "yr3-4" && (
          <motion.div
            key="yr3-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-purple-400 mb-1">🦁 Word Zoo</h2>
              <p className="text-gray-400 text-sm">
                Animals in a zoo represent words! Drag each word-animal to the pen it belongs in.
              </p>
            </div>
            <WordZoo onXPEarned={handleXPEarned} onComplete={handleComplete} />
          </motion.div>
        )}

        {yearBand === "yr5-6" && (
          <motion.div
            key="yr5-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-indigo-400 mb-1">⭐ Constellation Mapper</h2>
              <p className="text-gray-400 text-sm">
                Words are stars in a night sky. Connect the ones you think are related, then see how the AI maps them!
              </p>
            </div>
            <ConstellationMapper onXPEarned={handleXPEarned} onComplete={handleComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yr 7-10 content — keep exactly as before */}
      {(yearBand === "yr7-8" || yearBand === "yr9-10") && (
        <>
          {/* Concept 1 */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                What is an embedding vector?
              </h2>
              <SpeakButton
                text="What is an embedding vector? Think of an embedding vector as a unique digital fingerprint for a word. It's a list of numbers — like coordinates on a map — that tells the AI what a word means based on how it's used alongside other words. Every word gets its own list of numbers. Those numbers don't describe what the word looks like — they describe its meaning and relationships to everything else in the language."
                theme="purple"
                size="xs"
              />
            </div>
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

          {/* Concept 2 */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                Why are similar words &ldquo;close&rdquo;?
              </h2>
              <SpeakButton
                text="Why are similar words close? In the AI's numerical meaning space, words aren't just random points. Words that appear in similar situations — or have similar meanings — will naturally have number lists that look very alike. So 'happy' and 'joyful' sit close together, while 'happy' and 'rock' are far apart — just like cities on a real map."
                theme="purple"
                size="xs"
              />
            </div>
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

          {/* Concept 3 */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                Analogy by maths
              </h2>
              <SpeakButton
                text="Analogy by maths. Because words are numbers, the AI can actually do arithmetic with meaning. This lets it understand analogies — relationships between ideas — without ever being explicitly taught them. The famous example: take 'king', subtract 'man', add 'woman' — and the result is closest to 'queen'."
                theme="purple"
                size="xs"
              />
            </div>
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

          {/* Insight box */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-purple-950 border border-purple-900 rounded-xl p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-purple-200 text-sm">
                  🌌 <strong>Did you know?</strong> Real AI embeddings are far more
                  complex than a 2D map. Actual embedding vectors can have{" "}
                  <strong>hundreds or thousands of numbers</strong> — each dimension
                  captures a different subtle aspect of meaning. More dimensions means
                  more ways to represent the fine-grained differences between words.
                  We visualise them in 2D to make sense of them, but the real space
                  is almost unimaginably large.
                </p>
                <div className="shrink-0">
                  <SpeakButton
                    text="Did you know? Real AI embeddings are far more complex than a 2D map. Actual embedding vectors can have hundreds or thousands of numbers — each dimension captures a different subtle aspect of meaning. More dimensions means more ways to represent the fine-grained differences between words. We visualise them in 2D to make sense of them, but the real space is almost unimaginably large."
                    theme="purple"
                    size="xs"
                  />
                </div>
              </div>
            </div>
          </motion.section>
        </>
      )}

      {/* Key takeaways — all year levels */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            What you&apos;ve learned
          </h2>
          <SpeakButton
            text="What you've learned. Embeddings transform words into numerical representations called vectors. Similar words are located closer together in the AI's embedding space. This numerical representation allows AI to understand relationships and analogy through arithmetic. Embeddings are fundamental to how Large Language Models process meaning."
            theme="purple"
            size="xs"
          />
        </div>
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
