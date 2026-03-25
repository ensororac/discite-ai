"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Tokeniser from "@/components/m1/Tokeniser";
import TokenStats from "@/components/m1/TokenStats";
import FeedTheRobot from "@/components/m1/FeedTheRobot";
import TokenFactory from "@/components/m1/TokenFactory";
import XPBar from "@/components/XPBar";
import Byte from "@/components/Byte";
import StudentLogin from "@/components/StudentLogin";
import SpeakButton from "@/components/SpeakButton";
import { useStudent } from "@/hooks/useStudent";

type YearBand = "yr3-4" | "yr5-6" | "yr7-8" | "yr9-10";

const YEAR_BANDS: { id: YearBand; label: string; color: string; activeColor: string }[] = [
  { id: "yr3-4",  label: "Yr 3–4",  color: "bg-gray-800 border-gray-700 text-gray-400",   activeColor: "bg-amber-600 border-amber-500 text-white" },
  { id: "yr5-6",  label: "Yr 5–6",  color: "bg-gray-800 border-gray-700 text-gray-400",   activeColor: "bg-orange-600 border-orange-500 text-white" },
  { id: "yr7-8",  label: "Yr 7–8",  color: "bg-gray-800 border-gray-700 text-gray-400",   activeColor: "bg-blue-600 border-blue-500 text-white" },
  { id: "yr9-10", label: "Yr 9–10", color: "bg-gray-800 border-gray-700 text-gray-400",   activeColor: "bg-purple-600 border-purple-500 text-white" },
];

const isLowerYear = (band: YearBand) => band === "yr3-4" || band === "yr5-6";

export default function M1Page() {
  const [yearBand, setYearBand] = useState<YearBand>("yr7-8");
  const [activityDone, setActivityDone] = useState(false);
  const student = useStudent();

  const handleXPEarned = async (amount: number) => {
    if (student.isLoggedIn) {
      await student.earnXP("m1", yearBand, yearBand === "yr3-4" ? "feed-the-robot" : "token-factory", amount);
    }
  };

  const handleComplete = async () => {
    setActivityDone(true);
    if (student.isLoggedIn) {
      await student.earnXP("m1", yearBand, yearBand === "yr3-4" ? "feed-the-robot-complete" : "token-factory-complete", 0);
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
        <div className="mt-3">
          <SpeakButton
            text="Before an AI can read your words, it has to break them up into small pieces called tokens. Let's see how that works."
            theme="blue"
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
              <h2 className="text-lg font-bold text-amber-400 mb-1">🤖 Feed the Robot</h2>
              <p className="text-gray-400 text-sm mb-2">
                Byte is hungry for words! Tap each word to feed it to Byte and watch the tokens come out.
              </p>
              <SpeakButton
                text="Byte is hungry for words! Tap each word to feed it to Byte and watch the tokens come out."
                theme="amber"
                size="xs"
              />
            </div>
            <FeedTheRobot onXPEarned={handleXPEarned} onComplete={handleComplete} />
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
              <h2 className="text-lg font-bold text-orange-400 mb-1">⚙️ Token Factory</h2>
              <p className="text-gray-400 text-sm mb-2">
                A factory conveyor belt. Type a sentence, predict the token count, then run the factory!
              </p>
              <SpeakButton
                text="A factory conveyor belt. Type a sentence, predict the token count, then run the factory!"
                theme="amber"
                size="xs"
              />
            </div>
            <TokenFactory onXPEarned={handleXPEarned} onComplete={handleComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yr 7-10 content — keep exactly as before */}
      {(yearBand === "yr7-8" || yearBand === "yr9-10") && (
        <>
          {/* Concept explainer */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                What is a token?
              </h2>
              <SpeakButton
                text="A token is a chunk of text — usually a word, part of a word, or a punctuation mark. AI models don't read letter by letter or word by word. They read in tokens. For example, the word unhappiness might become three tokens: un, happi, and ness. Shorter, common words usually stay as one token. Why does it matter? AI models have a limit on how many tokens they can process at once — this is called the context window. Understanding tokens helps you understand why AI sometimes forgets earlier parts of a long conversation."
                theme="blue"
                size="xs"
              />
            </div>
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
        </>
      )}

      {/* Key takeaways — all year levels */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            What you&apos;ve learned
          </h2>
          <SpeakButton
            text="What you've learned. AI models split text into tokens — not letters, not always whole words. Common words are usually one token; rare or long words get split up. Every token becomes a number that the AI can process mathematically. The total number of tokens determines how much the AI can read at once."
            theme="green"
            size="xs"
          />
        </div>
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
          <Link href="/modules/m2" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Next: M2 Embeddings →
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
