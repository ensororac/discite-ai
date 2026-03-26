"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const modules = [
  {
    id: "m0",
    title: "Meet AI",
    subtitle: "Talk to an AI — then learn how it works",
    description:
      "Chat with Byte AI, earn badges, and discover the four steps that happen every time AI replies. Start here!",
    emoji: "👋",
    color: "from-cyan-600 to-teal-700",
    border: "border-cyan-700",
    available: true,
    bands: ["3–4", "5–6", "7–8", "9–10"],
    isNew: true,
  },
  {
    id: "m1",
    title: "Tokenisation",
    subtitle: "How text becomes numbers",
    description:
      "Discover how AI breaks your words into tiny pieces called tokens — the first step in understanding language.",
    emoji: "🔤",
    color: "from-blue-600 to-blue-800",
    border: "border-blue-700",
    available: true,
    bands: ["3–4", "5–6", "7–8", "9–10"],
  },
  {
    id: "m2",
    title: "Embeddings",
    subtitle: "How tokens become meaning",
    description:
      "Explore how AI turns tokens into numbers that capture meaning — and why similar words end up close together.",
    emoji: "🗺️",
    color: "from-purple-600 to-purple-800",
    border: "border-purple-700",
    available: true,
    bands: ["5–6", "7–8", "9–10"],
  },
  {
    id: "m3",
    title: "Attention",
    subtitle: "How context shapes understanding",
    description:
      "See how AI decides which words matter most when reading a sentence — the secret behind why it understands context.",
    emoji: "🔍",
    color: "from-pink-600 to-pink-800",
    border: "border-pink-700",
    available: true,
    bands: ["3–4", "5–6", "7–8", "9–10"],
  },
  {
    id: "m4",
    title: "Transformer Architecture",
    subtitle: "How the pieces fit together",
    description:
      "Walk through the full transformer — the engine inside every modern AI language model.",
    emoji: "🏗️",
    color: "from-orange-600 to-orange-800",
    border: "border-orange-700",
    available: true,
    bands: ["3–4", "5–6", "7–8", "9–10"],
  },
  {
    id: "m5",
    title: "Prediction",
    subtitle: "How AI chooses the next word",
    description:
      "See AI thinking in real time — how it weighs every possible next word and picks one, again and again.",
    emoji: "🎯",
    color: "from-green-600 to-green-800",
    border: "border-green-700",
    available: true,
    bands: ["5–6", "7–8", "9–10"],
  },
  {
    id: "m6",
    title: "Data & Bias",
    subtitle: "Where AI learns — and what it picks up",
    description:
      "Explore how training data shapes what AI knows, believes, and gets wrong — and why it matters for all of us.",
    emoji: "⚖️",
    color: "from-teal-600 to-teal-800",
    border: "border-teal-700",
    available: false,
    bands: ["3–4", "5–6", "7–8", "9–10"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-12 md:py-20">
      {/* Header */}
      <motion.div
        className="text-center max-w-2xl mx-auto mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-5xl mb-4">🧠</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Discite AI
        </h1>
        <p className="text-lg text-gray-400 mb-2">
          <em>Discite</em> — Latin for &ldquo;learn&rdquo;
        </p>
        <p className="text-xl text-gray-300">
          Don&apos;t just use AI. Understand it.
        </p>
        <p className="mt-4 text-gray-500 text-sm">
          Seven interactive modules exploring how Large Language Models really work
          — built for K–10 students. Start with Module 0!
        </p>
      </motion.div>

      {/* Module Grid */}
      <motion.div
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {modules.map((mod) => (
          <motion.div key={mod.id} variants={cardVariants}>
            {mod.available ? (
              <Link href={`/modules/${mod.id}`} className="block h-full">
                <ModuleCard mod={mod} />
              </Link>
            ) : (
              <ModuleCard mod={mod} />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center mt-20 text-gray-600 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>Built for curious students. No account needed.</p>
      </motion.div>
    </main>
  );
}

function ModuleCard({ mod }: { mod: (typeof modules)[0] }) {
  const isNew = "isNew" in mod && mod.isNew;
  return (
    <div
      className={`
        h-full rounded-xl border ${mod.border} bg-gray-900 p-6
        flex flex-col gap-3 relative
        ${mod.available ? "hover:border-opacity-100 hover:scale-[1.02] transition-transform cursor-pointer" : "opacity-60 cursor-default"}
      `}
    >
      {isNew && (
        <span className="absolute top-3 right-3 text-xs bg-cyan-600 text-white font-bold px-2 py-0.5 rounded-full">
          Start here!
        </span>
      )}
      <div className="text-3xl">{mod.emoji}</div>
      <div>
        <h2 className="text-lg font-bold text-white">{mod.title}</h2>
        <p className="text-sm text-gray-400">{mod.subtitle}</p>
      </div>
      <p className="text-sm text-gray-300 flex-1">{mod.description}</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {mod.bands.map((band) => (
          <span
            key={band}
            className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
          >
            Yr {band}
          </span>
        ))}
      </div>
      {!mod.available && (
        <span className="text-xs text-gray-600 mt-1">Coming soon</span>
      )}
      {mod.available && (
        <span className={`text-xs font-medium mt-1 ${isNew ? "text-cyan-400" : "text-blue-400"}`}>
          {isNew ? "Begin your journey →" : "Start →"}
        </span>
      )}
    </div>
  );
}
