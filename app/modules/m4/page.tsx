"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TransformerBuilder from "@/components/m4/TransformerBuilder";
import PipelineSimulator from "@/components/m4/PipelineSimulator";
import TransformerDiagram from "@/components/m4/TransformerDiagram";
import LayerExplorer from "@/components/m4/LayerExplorer";
import NeuralNetworkExplainer from "@/components/m4/NeuralNetworkExplainer";
import XPBar from "@/components/XPBar";
import Byte from "@/components/Byte";
import StudentLogin from "@/components/StudentLogin";
import SpeakButton from "@/components/SpeakButton";
import { useStudent } from "@/hooks/useStudent";
import type { ByteEmotion } from "@/components/Byte";

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
    activeColor: "bg-orange-600 border-orange-500 text-white",
  },
  {
    id: "yr5-6",
    label: "Yr 5–6",
    color: "bg-gray-800 border-gray-700 text-gray-400",
    activeColor: "bg-orange-600 border-orange-500 text-white",
  },
  {
    id: "yr7-8",
    label: "Yr 7–8",
    color: "bg-gray-800 border-gray-700 text-gray-400",
    activeColor: "bg-orange-700 border-orange-600 text-white",
  },
  {
    id: "yr9-10",
    label: "Yr 9–10",
    color: "bg-gray-800 border-gray-700 text-gray-400",
    activeColor: "bg-orange-800 border-orange-700 text-white",
  },
];

const isLowerYear = (band: YearBand) => band === "yr3-4" || band === "yr5-6";

const KEY_TAKEAWAYS_SPEAK =
  "Here is what you have learned. First: A transformer combines tokenisation, embeddings, attention, and prediction into one pipeline. Second: Information passes through many layers — each one refines the model's understanding. Third: Modern AI models like GPT-4 use hundreds of billions of parameters across these layers. Fourth: The transformer architecture, invented in 2017, powers almost every modern AI language model.";

export default function M4Page() {
  const [yearBand, setYearBand] = useState<YearBand>("yr7-8");
  const [activityDone, setActivityDone] = useState(false);
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const student = useStudent();

  const handleXPEarned = async (amount: number) => {
    if (student.isLoggedIn) {
      await student.earnXP("m4", yearBand, "activity", amount);
    }
  };

  const handleComplete = async () => {
    setActivityDone(true);
    setByteEmotion("celebrating");
    if (student.isLoggedIn) {
      const badge = yearBand === "yr3-4" ? "brain-builder" : "pipeline-pro";
      await student.earnXP("m4", yearBand, `${badge}-complete`, 0);
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
          <Byte emotion={activityDone ? "celebrating" : byteEmotion} size={80} />
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
          <span className="text-4xl">🏗️</span>
          <div>
            <p className="text-xs text-orange-400 font-semibold uppercase tracking-widest">
              Module 4
            </p>
            <h1 className="text-3xl font-bold text-white">Transformer Architecture</h1>
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          The transformer is the <strong className="text-white">engine</strong> inside every modern AI.
          It combines tokenisation, embeddings, attention, and prediction into one powerful{" "}
          <strong className="text-orange-400">pipeline</strong> — and it&apos;s been changing the world since 2017.
        </p>
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
                setByteEmotion("happy");
              }}
              className={`min-h-[48px] px-5 py-2 rounded-xl border-2 font-bold text-sm transition-all
                ${
                  yearBand === band.id
                    ? band.activeColor
                    : band.color + " hover:text-white hover:border-gray-600"
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

      {/* ——— YEAR BAND CONTENT ——— */}
      <AnimatePresence mode="wait">
        {/* Yr 3-4: TransformerBuilder */}
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
              <h2 className="text-lg font-bold text-orange-400 mb-1">🧩 Build the Robot Brain</h2>
              <p className="text-gray-400 text-sm">
                Every AI has a &ldquo;brain&rdquo; made of pieces that work together. Drag each piece into its spot to build the robot brain!
              </p>
            </div>
            <TransformerBuilder
              onXPEarned={handleXPEarned}
              onComplete={handleComplete}
            />
          </motion.div>
        )}

        {/* Yr 5-6: PipelineSimulator */}
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
              <h2 className="text-lg font-bold text-orange-400 mb-1">🏭 Pipeline Simulator</h2>
              <p className="text-gray-400 text-sm">
                Type a sentence and watch it travel through the AI pipeline — station by station!
              </p>
            </div>
            <PipelineSimulator
              onXPEarned={handleXPEarned}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ——— Yr 7-8 and 9-10 content ——— */}
      {(yearBand === "yr7-8" || yearBand === "yr9-10") && (
        <>
          {/* Neural Network foundation — before transformer detail */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <NeuralNetworkExplainer />
          </motion.section>

          {/* Section 1: What is a transformer */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-lg font-semibold text-white">What is a transformer?</h2>
              <SpeakButton
                text="What is a transformer? A transformer is a type of neural network architecture that processes sequences of text by combining four key steps. First, tokenisation breaks text into tokens. Second, embeddings convert tokens into vectors. Third, attention lets each token look at all others to understand context. Fourth, prediction uses everything computed so far to choose the next output. All of this happens in one interconnected pipeline — and it repeats for every new token the model generates."
                theme="amber"
                size="xs"
              />
            </div>
            <p className="text-gray-300 mb-3">
              A transformer is a type of neural network architecture that processes sequences of text
              by combining four key steps into one pipeline:
            </p>
            <ol className="space-y-2 mb-4">
              {[
                { step: "Tokenisation", desc: "Text is broken into tokens (small chunks)." },
                { step: "Embeddings", desc: "Tokens become high-dimensional vectors capturing meaning." },
                { step: "Attention", desc: "Each token attends to all others, building contextual representations." },
                { step: "Prediction", desc: "The final representation is used to predict the next token." },
              ].map(({ step, desc }, i) => (
                <li key={i} className="flex gap-3 text-gray-300">
                  <span className="text-orange-400 font-bold w-6 shrink-0">{i + 1}.</span>
                  <span>
                    <strong className="text-white">{step}</strong> — {desc}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-gray-300">
              These steps repeat for every new token generated — a transformer produces text one token at a time,
              feeding each output back as input.
            </p>
          </motion.section>

          {/* Section 2: Encoder vs Decoder */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-lg font-semibold text-white">Encoder vs Decoder</h2>
              <SpeakButton
                text="Encoder versus Decoder. The original transformer had two parts: an encoder and a decoder. The encoder reads and understands the full input sequence — used for tasks like translation or classification. The decoder generates new text one token at a time — used for language generation. GPT models are decoder-only: they only generate, they don't encode a separate input. BERT is encoder-only: it understands text but doesn't generate it. Most modern chatbots and language models you use today are decoder-only transformers."
                theme="amber"
                size="xs"
              />
            </div>
            <p className="text-gray-300 mb-3">
              The original transformer (2017) had two parts:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="font-bold text-blue-400 mb-1">Encoder</p>
                <p className="text-sm text-gray-300">
                  Reads the full input sequence and builds a rich internal representation.
                  Used for tasks like translation (understanding the source language) or text classification.
                </p>
                <p className="text-xs text-gray-500 mt-2">Example: BERT</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="font-bold text-orange-400 mb-1">Decoder</p>
                <p className="text-sm text-gray-300">
                  Generates new text one token at a time. Each new token is conditioned on all previous tokens.
                  GPT models are decoder-only — they generate without a separate encoder.
                </p>
                <p className="text-xs text-gray-500 mt-2">Example: GPT-4, Claude, Gemini</p>
              </div>
            </div>
            <p className="text-gray-300">
              Most modern AI chatbots are <strong className="text-orange-400">decoder-only</strong> transformers —
              they simply predict the next token, over and over, until a complete response is formed.
            </p>
          </motion.section>

          {/* Section 3: Why layers matter */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-lg font-semibold text-white">Why layers matter</h2>
              <SpeakButton
                text="Why layers matter. A transformer stacks its attention and feed-forward operations into many layers. Early layers tend to learn basic syntax — how words fit together grammatically. Middle layers learn semantics — what words mean in context. Late layers handle high-level reasoning — drawing inferences and understanding tone. Depth equals abstraction. A model with more layers can represent more complex patterns — which is why GPT-4 with 96 layers is more capable than smaller models with 12."
                theme="amber"
                size="xs"
              />
            </div>
            <p className="text-gray-300 mb-3">
              A transformer stacks its attention and feed-forward operations into many layers.
              Each layer&apos;s output becomes the next layer&apos;s input — building progressively richer representations:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                { layers: "Early layers (1–4)", learn: "Basic grammar, word order, punctuation" },
                { layers: "Middle layers (5–8)", learn: "Word meanings, entity recognition, coreference" },
                { layers: "Late layers (9+)", learn: "Reasoning, inference, tone, and task-specific patterns" },
              ].map(({ layers, learn }, i) => (
                <li key={i} className="flex gap-3 text-gray-300">
                  <span className="text-orange-400 font-bold shrink-0">→</span>
                  <span>
                    <strong className="text-white">{layers}:</strong> {learn}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-gray-300">
              Depth equals abstraction. More layers = more complex patterns = more capable model.
            </p>
          </motion.section>

          {/* TransformerDiagram — Yr 7-8 and 9-10 */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Interactive transformer diagram
            </h2>
            <TransformerDiagram />
          </motion.section>

          {/* LayerExplorer — Yr 9-10 only */}
          {yearBand === "yr9-10" && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
              >
                <h2 className="text-lg font-semibold text-white mb-2">Layer Explorer</h2>
                <p className="text-gray-400 text-sm mb-5">
                  Slide through all 12 layers and see what each depth tends to learn.
                </p>
                <LayerExplorer />
              </motion.section>

              {/* Residual connections */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-lg font-semibold text-white">Residual connections</h2>
                  <SpeakButton
                    text="Residual connections. Between every transformer layer, there is a residual connection — a shortcut that adds the layer's input directly to its output. This might sound simple, but it's crucial. Without residual connections, gradients can vanish during training and deep models become impossible to train. With them, each layer only needs to learn what to add to the existing representation — not recompute everything from scratch. Residual connections are why transformers can be made extremely deep without breaking."
                    theme="amber"
                    size="xs"
                  />
                </div>
                <p className="text-gray-300 mb-3">
                  Between every transformer layer, there is a <strong className="text-orange-400">residual connection</strong> —
                  a shortcut that adds the layer&apos;s input directly to its output:
                </p>
                <div className="bg-gray-800 rounded-xl p-4 font-mono text-sm text-gray-300 mb-3">
                  <span className="text-orange-400">output</span> = LayerNorm(x + sublayer(x))
                </div>
                <p className="text-gray-300 mb-2">
                  This means each layer only needs to learn what to <em>add</em> — not recompute everything
                  from scratch. Residual connections prevent gradients from vanishing during training,
                  making it possible to stack dozens or hundreds of layers.
                </p>
                <p className="text-gray-300">
                  Without residual connections, deep transformers would be effectively untrainable.
                </p>
              </motion.section>

              {/* Encoder-Decoder vs Decoder-Only detailed */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-lg font-semibold text-white">Encoder-Decoder vs Decoder-Only</h2>
                  <SpeakButton
                    text="Encoder-Decoder versus Decoder-Only — a detailed comparison. Encoder-Decoder models like T5 or the original transformer process input and output separately. The encoder builds a contextual representation of the full input. The decoder then attends to both the encoder output and its own generated tokens — using cross-attention. This architecture works well for tasks with a clear input and output, like translation or summarisation. Decoder-Only models like GPT-4 or Claude use a single stack of transformer layers. They process everything left to right, using causal attention — each token can only attend to previous tokens. There is no separate encoder. The entire context window is processed together, making these models excellent at open-ended generation, reasoning, and conversation. Today, decoder-only has become dominant because it scales better and works well for general-purpose tasks."
                    theme="amber"
                    size="xs"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="bg-gray-800 rounded-xl p-4 border border-blue-900">
                    <p className="font-bold text-blue-400 mb-2">Encoder-Decoder (e.g. T5, original transformer)</p>
                    <ul className="space-y-1.5 text-sm text-gray-300">
                      <li className="flex gap-2"><span className="text-blue-400">→</span> Encoder processes full input sequence with bidirectional attention</li>
                      <li className="flex gap-2"><span className="text-blue-400">→</span> Decoder generates output token-by-token, attending to encoder via cross-attention</li>
                      <li className="flex gap-2"><span className="text-blue-400">→</span> Ideal for tasks with clear input → output pairs (translation, summarisation)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 border border-orange-900">
                    <p className="font-bold text-orange-400 mb-2">Decoder-Only (e.g. GPT-4, Claude, Gemini)</p>
                    <ul className="space-y-1.5 text-sm text-gray-300">
                      <li className="flex gap-2"><span className="text-orange-400">→</span> Single stack of transformer layers, no separate encoder</li>
                      <li className="flex gap-2"><span className="text-orange-400">→</span> Uses causal (left-to-right) attention — each token only attends to previous tokens</li>
                      <li className="flex gap-2"><span className="text-orange-400">→</span> Scales exceptionally well — now dominant for general-purpose AI</li>
                    </ul>
                  </div>
                </div>
              </motion.section>

              {/* Yr 9-10 insight box */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="mb-8"
              >
                <div className="bg-orange-950 border border-orange-900 rounded-xl p-6">
                  <p className="text-orange-200 text-sm">
                    🏗️ <strong>Did you know?</strong> GPT-4 has <strong>96 layers</strong>. Each one refines the
                    model&apos;s understanding a little further — from basic grammar all the way to complex reasoning.
                    At this scale, the model has seen so many patterns across so many layers that it develops emergent
                    capabilities: abilities no one explicitly programmed, that arise from sheer scale.
                  </p>
                </div>
              </motion.section>
            </>
          )}

          {/* Yr 7-8 insight box */}
          {yearBand === "yr7-8" && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mb-8"
            >
              <div className="bg-orange-950 border border-orange-900 rounded-xl p-6">
                <p className="text-orange-200 text-sm">
                  🏗️ <strong>Did you know?</strong> The original transformer was introduced in a 2017 paper called
                  &ldquo;Attention Is All You Need&rdquo;. Before transformers, AI struggled with long sequences of text.
                  Transformers solved this by letting every word look at every other word simultaneously —
                  rather than reading left to right one word at a time. This parallelism made transformers
                  dramatically faster to train and far better at understanding context.
                </p>
              </div>
            </motion.section>
          )}
        </>
      )}

      {/* Key takeaways — all year levels */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white">What you&apos;ve learned</h2>
          <SpeakButton text={KEY_TAKEAWAYS_SPEAK} theme="amber" size="xs" />
        </div>
        <ul className="space-y-3">
          {[
            "A transformer combines tokenisation, embeddings, attention, and prediction into one pipeline.",
            "Information passes through many layers — each one refines the model's understanding.",
            "Modern AI models like GPT-4 use hundreds of billions of parameters across these layers.",
            "The transformer architecture, invented in 2017, powers almost every modern AI language model.",
          ].map((point, i) => (
            <li key={i} className="flex gap-3 text-gray-300">
              <span className="text-orange-400 mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
          <Link
            href="/modules/m3"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← M3: Attention
          </Link>
          <Link
            href="/modules/m5"
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            M5: Prediction →
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
