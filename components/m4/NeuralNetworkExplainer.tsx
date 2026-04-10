"use client";

import { motion } from "framer-motion";
import SpeakButton from "@/components/SpeakButton";
import EmojiNeuralNetwork from "@/components/m4/EmojiNeuralNetwork";

const SECTIONS = [
  {
    title: "What is a Neural Network?",
    body: [
      "Imagine your brain is made of tiny decision-makers called neurons. A neural network in AI works a bit like that — it is a chain of simple decision-making nodes organised into layers. Each node takes in information, processes it, and passes its result to the next layer.",
      "These nodes are connected by weights — numbers that control how strongly each connection influences the next node. It is like a complex game of telephone where each person makes a small adjustment to the message before passing it on.",
    ],
    highlight: null,
    speakText: "What is a neural network? Imagine your brain is made of tiny decision-makers called neurons. A neural network in AI works a bit like that — a chain of simple decision-making nodes organised into layers. Each node takes in information, processes it, and passes its result to the next layer. These nodes are connected by weights — numbers that control how strongly each connection influences the next node.",
  },
  {
    title: "How Networks Learn",
    body: [
      "Neural networks learn by looking at lots and lots of examples, called training data. At first they make many mistakes — like a new student trying to solve a puzzle. But after each attempt, the network figures out how far off its answer was.",
      "It then carefully adjusts the weights between its nodes, trying to get a little bit closer to the right answer next time. This process repeats thousands or even millions of times. Over time the network gets better and better — much like practising a skill until you become an expert.",
    ],
    highlight: "Think of teaching a computer to recognise a cat: you show it millions of pictures of cats (and non-cats!), and it slowly learns what features make something cat-like by adjusting its internal weights.",
    speakText: "How do networks learn? They look at lots of training data — examples of correct answers. At first they make mistakes, but after each attempt they adjust their weights to get closer to the right answer. This repeats millions of times until the network becomes accurate. Think of it like teaching a computer to recognise a cat by showing it millions of cat photos.",
  },
  {
    title: "From Neural Network to Transformer",
    body: [
      "While all powerful AIs are neural networks, some are very special. A Transformer is a clever type of neural network invented specifically for understanding and generating language. It is built with unique mechanisms — like attention — that help it process all parts of a sentence simultaneously.",
      "This Transformer architecture is what powers the most famous large language models today — Google Gemini, Anthropic Claude, and OpenAI GPT. They can have billions of nodes and weights, making them extraordinarily powerful language machines.",
    ],
    highlight: null,
    speakText: "From neural network to transformer. A transformer is a special kind of neural network designed specifically for language. It uses attention mechanisms to process all parts of a sentence at once. This architecture powers all the famous AI models you hear about today — Gemini, Claude, and GPT — with billions of nodes and weights.",
  },
];

export default function NeuralNetworkExplainer() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-orange-900 rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-orange-300">🧠 Foundation: What is a Neural Network?</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Before we explore the transformer, we need to understand what it&apos;s built on.
          A transformer is a type of neural network — so let&apos;s start there.
        </p>
      </motion.div>

      {/* SVG diagram */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">A simple neural network</h4>
          <SpeakButton
            text="A simple neural network has three types of layers. The input layer receives the raw data. The hidden layer processes it, finding patterns. The output layer produces the result. Every connection between nodes has a weight — a number controlling how much influence it has."
            theme="amber"
            size="xs"
          />
        </div>
        <EmojiNeuralNetwork />
      </motion.div>

      {/* Content sections */}
      {SECTIONS.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">{section.title}</h3>
            <SpeakButton text={section.speakText} theme="amber" size="xs" />
          </div>
          {section.body.map((para, j) => (
            <p key={j} className="text-gray-300 text-sm mb-3 last:mb-0">{para}</p>
          ))}
          {section.highlight && (
            <div className="mt-3 bg-orange-950 border border-orange-900 rounded-lg p-4 text-sm text-orange-200">
              💡 {section.highlight}
            </div>
          )}
        </motion.div>
      ))}

      {/* Bridge to transformer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-orange-950 border border-orange-700 rounded-xl p-5 flex items-start gap-3"
      >
        <span className="text-2xl">🏗️</span>
        <div>
          <p className="text-orange-200 font-semibold text-sm mb-1">Now let&apos;s look inside the transformer</p>
          <p className="text-orange-300 text-sm">
            You now know what a neural network is and how it learns. A transformer takes this further —
            adding the attention mechanism from Module 3 and stacking many layers to build something
            that can understand and generate human language. Keep reading to see how it all fits together.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
