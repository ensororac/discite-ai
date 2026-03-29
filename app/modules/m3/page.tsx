"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SpotlightGame from "@/components/m3/SpotlightGame";
import AttentionBuilder from "@/components/m3/AttentionBuilder";
import AttentionVisualiser from "@/components/m3/AttentionVisualiser";
import AttentionMatrix from "@/components/m3/AttentionMatrix";
import XPBar from "@/components/XPBar";
import Byte from "@/components/Byte";
import StudentLogin from "@/components/StudentLogin";
import { useStudent } from "@/hooks/useStudent";
import SpeakButton from "@/components/SpeakButton";

type YearBand = "yr3-4" | "yr5-6" | "yr7-8" | "yr9-10";

const YEAR_BANDS: {
  id: YearBand;
  label: string;
  color: string;
  activeColor: string;
}[] = [
  {
    id: "yr3-4",
    label: "Yr 3–4",
    color: "bg-gray-800 border-gray-700 text-gray-400",
    activeColor: "bg-pink-600 border-pink-500 text-white",
  },
  {
    id: "yr5-6",
    label: "Yr 5–6",
    color: "bg-gray-800 border-gray-700 text-gray-400",
    activeColor: "bg-pink-700 border-pink-600 text-white",
  },
  {
    id: "yr7-8",
    label: "Yr 7–8",
    color: "bg-gray-800 border-gray-700 text-gray-400",
    activeColor: "bg-pink-800 border-pink-700 text-white",
  },
  {
    id: "yr9-10",
    label: "Yr 9–10",
    color: "bg-gray-800 border-gray-700 text-gray-400",
    activeColor: "bg-rose-700 border-rose-600 text-white",
  },
];

const isLowerYear = (band: YearBand) =>
  band === "yr3-4" || band === "yr5-6";

export default function M3Page() {
  const [yearBand, setYearBand] = useState<YearBand>("yr7-8");
  const [activityDone, setActivityDone] = useState(false);
  const student = useStudent();

  const handleXPEarned = async (amount: number) => {
    if (student.isLoggedIn) {
      await student.earnXP(
        "m3",
        yearBand,
        yearBand === "yr3-4" ? "spotlight-game" : "attention-builder",
        amount
      );
    }
  };

  const handleComplete = async () => {
    setActivityDone(true);
    if (student.isLoggedIn) {
      await student.earnXP(
        "m3",
        yearBand,
        yearBand === "yr3-4"
          ? "spotlight-game-complete"
          : "attention-builder-complete",
        0
      );
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      {/* Student login modal — lower years only */}
      {!student.isLoggedIn && isLowerYear(yearBand) && (
        <StudentLogin
          onLogin={student.login}
          isLoading={student.isLoading}
          error={student.loginError}
        />
      )}

      {/* Byte fixed lower-left on desktop — lower year activities */}
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
          <span className="text-4xl">🔦</span>
          <div>
            <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest">
              Module 3
            </p>
            <h1 className="text-3xl font-bold text-white">Attention</h1>
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          When you read a sentence, your brain automatically focuses on the most{" "}
          <strong className="text-white">relevant</strong> words to understand
          meaning. AI does the same thing — using a mechanism called{" "}
          <strong className="text-pink-400">attention</strong> to decide which
          words matter most in context.
        </p>
        <div className="mt-3">
          <SpeakButton
            text="When you read a sentence, your brain automatically focuses on the most relevant words to understand meaning. AI does the same thing — using a mechanism called attention to decide which words matter most in context."
            theme="pink"
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
              onClick={() => {
                setYearBand(band.id);
                setActivityDone(false);
              }}
              className={`min-h-[48px] px-5 py-2 rounded-xl border-2 font-bold text-sm transition-all
                ${
                  yearBand === band.id
                    ? band.activeColor
                    : band.color +
                      " hover:text-white hover:border-gray-600"
                }`}
            >
              {band.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* XP Bar */}
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
              <h2 className="text-lg font-bold text-pink-400 mb-1">
                🔦 Spotlight Game
              </h2>
              <p className="text-gray-400 text-sm">
                Byte is shining a spotlight on one word — can you guess which
                other word is giving it meaning?
              </p>
            </div>
            <SpotlightGame
              onXPEarned={handleXPEarned}
              onComplete={handleComplete}
            />
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
              <h2 className="text-lg font-bold text-pink-400 mb-1">
                🏗️ Attention Builder
              </h2>
              <p className="text-gray-400 text-sm">
                Draw connections between words you think are related, then
                compare your attention map to the AI&apos;s!
              </p>
            </div>
            <AttentionBuilder
              onXPEarned={handleXPEarned}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yr 7-10 content */}
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
                What is the attention mechanism?
              </h2>
              <SpeakButton
                text="What is the attention mechanism? Consider the sentence: 'I sat by the river bank.' Does 'bank' mean a financial institution, or the side of a river? To know, the AI must look at the other words — especially 'river' — and decide which ones matter most. This is exactly what attention does. It lets each word in a sentence look at all the other words and assign a weight — a score representing how relevant each other word is to understanding its meaning in this particular context."
                theme="pink"
                size="xs"
              />
            </div>
            <p className="text-gray-300 mb-3">
              Consider the sentence: &ldquo;I sat by the river{" "}
              <strong className="text-pink-400">bank</strong>.&rdquo; Does
              &ldquo;bank&rdquo; mean a financial institution, or the side of a
              river? To know, the AI must look at the other words — especially
              &ldquo;river&rdquo; — and decide which ones matter most.
            </p>
            <p className="text-gray-300">
              This is exactly what{" "}
              <strong className="text-white">attention</strong> does. It lets
              each word in a sentence look at all the other words and assign a{" "}
              <em>weight</em> — a score representing how relevant each other
              word is to understanding its meaning in this particular context.
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
                Queries, Keys, and Values
              </h2>
              <SpeakButton
                text="Queries, Keys, and Values. Under the hood, each word is transformed into three vectors. Query: What is this word looking for? Key: What does this word offer to others? Value: What information gets passed on if selected? The attention score between two words is calculated by comparing the Query of one word against the Keys of all others. Higher scores mean more influence."
                theme="pink"
                size="xs"
              />
            </div>
            <p className="text-gray-300 mb-3">
              Under the hood, each word is transformed into three vectors:
            </p>
            <ul className="space-y-2 mb-3">
              <li className="flex gap-3 text-gray-300">
                <span className="text-pink-400 font-bold w-16 shrink-0">Query</span>
                <span>
                  What is this word looking for? (&ldquo;What context do I
                  need?&rdquo;)
                </span>
              </li>
              <li className="flex gap-3 text-gray-300">
                <span className="text-pink-400 font-bold w-16 shrink-0">Key</span>
                <span>
                  What does this word offer to others? (&ldquo;What information
                  can I provide?&rdquo;)
                </span>
              </li>
              <li className="flex gap-3 text-gray-300">
                <span className="text-pink-400 font-bold w-16 shrink-0">Value</span>
                <span>
                  What information gets passed on if selected? (&ldquo;My actual
                  content&rdquo;)
                </span>
              </li>
            </ul>
            <p className="text-gray-300">
              The attention score between two words is calculated by comparing
              the Query of one word against the Keys of all others. Higher
              scores mean more influence.
            </p>
          </motion.section>

          {/* Interactive visualiser — yr7-8 */}
          {yearBand === "yr7-8" && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Explore attention patterns
              </h2>
              <AttentionVisualiser />
            </motion.section>
          )}

          {/* Full matrix — yr9-10 */}
          {yearBand === "yr9-10" && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Explore attention patterns
                </h2>
                <AttentionVisualiser />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  The full attention matrix
                </h2>
                <AttentionMatrix />
              </motion.section>
            </>
          )}

          {/* Insight box */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-pink-950 border border-pink-900 rounded-xl p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-pink-200 text-sm">
                  🔦 <strong>Did you know?</strong> GPT-4 uses{" "}
                  <strong>96 attention heads</strong> across{" "}
                  <strong>96 transformer layers</strong>. Each head independently
                  learns to notice different linguistic patterns — some track
                  pronouns, some track verbs and their objects, some detect
                  sentiment. Together they form a rich, multi-dimensional
                  understanding of context.
                </p>
                <div className="shrink-0">
                  <SpeakButton
                    text="Did you know? GPT-4 uses 96 attention heads across 96 transformer layers. Each head independently learns to notice different linguistic patterns — some track pronouns, some track verbs and their objects, some detect sentiment. Together they form a rich, multi-dimensional understanding of context."
                    theme="pink"
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
            text="What you've learned. Attention allows each word to consider all other words when building its meaning. Words are assigned attention weights — higher weights mean more influence on understanding. Queries, Keys, and Values are the mathematical tools that compute these weights. Multi-head attention runs multiple attention patterns simultaneously for richer understanding."
            theme="pink"
            size="xs"
          />
        </div>
        <ul className="space-y-3">
          {[
            "Attention allows each word to consider all other words when building its meaning.",
            "Words are assigned attention weights — higher weights mean more influence on understanding.",
            "Queries, Keys, and Values are the mathematical tools that compute these weights.",
            "Multi-head attention runs multiple attention patterns simultaneously for richer understanding.",
          ].map((point, i) => (
            <li key={i} className="flex gap-3 text-gray-300">
              <span className="text-pink-400 mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
          <Link
            href="/modules/m2"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← M2: Embeddings
          </Link>
          <Link
            href="/modules/m5"
            className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
          >
            Try M5: Prediction →
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
