"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Block {
  id: string;
  label: string;
  sublabel?: string;
  description: string;
  color: string;
  borderColor: string;
  textColor: string;
  repeated?: boolean;
}

const BLOCKS: Block[] = [
  {
    id: "input",
    label: "Input Tokens",
    sublabel: "\"The cat sat\"",
    description: "Text is broken into tokens — small chunks of text the model can process. Each token gets a number ID.",
    color: "bg-blue-900",
    borderColor: "border-blue-600",
    textColor: "text-blue-200",
  },
  {
    id: "embedding",
    label: "Embedding",
    sublabel: "Token → Vector",
    description: "Each token ID is converted into a high-dimensional vector — a list of numbers capturing its meaning and position in the sequence.",
    color: "bg-purple-900",
    borderColor: "border-purple-600",
    textColor: "text-purple-200",
  },
  {
    id: "attention",
    label: "Attention",
    sublabel: "Multi-Head",
    description: "Each token attends to all other tokens — computing how much focus to give each one. Multiple attention heads run in parallel, each learning different patterns.",
    color: "bg-pink-900",
    borderColor: "border-pink-600",
    textColor: "text-pink-200",
    repeated: true,
  },
  {
    id: "feedforward",
    label: "Feed Forward",
    sublabel: "Neural Network",
    description: "A small neural network processes each token's representation independently, adding more expressive power to what attention computed.",
    color: "bg-amber-900",
    borderColor: "border-amber-600",
    textColor: "text-amber-200",
    repeated: true,
  },
  {
    id: "logits",
    label: "Output Logits",
    sublabel: "Raw scores",
    description: "After all transformer layers, the model produces a raw score (logit) for every word in its vocabulary — tens of thousands of scores.",
    color: "bg-teal-900",
    borderColor: "border-teal-600",
    textColor: "text-teal-200",
  },
  {
    id: "softmax",
    label: "Softmax",
    sublabel: "→ Probabilities",
    description: "Softmax converts raw logit scores into probabilities that sum to 1.0. Higher logits become higher probabilities.",
    color: "bg-green-900",
    borderColor: "border-green-600",
    textColor: "text-green-200",
  },
  {
    id: "output",
    label: "Predicted Token",
    sublabel: "\"on\"",
    description: "The token with the highest probability is selected as the next output. This process repeats for each new token generated.",
    color: "bg-orange-900",
    borderColor: "border-orange-500",
    textColor: "text-orange-200",
  },
];

export default function TransformerDiagram() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedBlock = BLOCKS.find((b) => b.id === selected);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">Click any block to learn what it does.</p>

      {/* Diagram */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 overflow-x-auto">
        <div className="flex flex-col items-center gap-1 min-w-[260px]">
          {BLOCKS.map((block, i) => (
            <div key={block.id} className="flex flex-col items-center w-full max-w-xs">
              {/* Repeated indicator */}
              {block.repeated && i === BLOCKS.findIndex((b) => b.repeated) && (
                <div className="w-full max-w-xs">
                  <div className="text-xs text-gray-500 text-center mb-1">× N layers</div>
                  <div className="border border-dashed border-gray-600 rounded-xl p-2 flex flex-col items-center gap-1">
                </div>
                </div>
              )}

              <motion.button
                onClick={() => setSelected(selected === block.id ? null : block.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  w-full max-w-xs min-h-[56px] rounded-xl border-2 px-4 py-2 text-center transition-all cursor-pointer
                  ${block.color} ${block.borderColor}
                  ${selected === block.id ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-950" : ""}
                `}
              >
                <div className={`font-bold text-sm ${block.textColor}`}>{block.label}</div>
                {block.sublabel && (
                  <div className="text-xs text-gray-400">{block.sublabel}</div>
                )}
              </motion.button>

              {/* Arrow down */}
              {i < BLOCKS.length - 1 && (
                <motion.div
                  className="text-gray-500 text-xl leading-none my-0.5"
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  ↓
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Repeated layers bracket */}
        <p className="text-xs text-gray-600 text-center mt-3">
          [Attention + Feed Forward] repeats N times (e.g. 12 or 96 layers)
        </p>
      </div>

      {/* Description panel */}
      <AnimatePresence mode="wait">
        {selectedBlock && (
          <motion.div
            key={selectedBlock.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={`border-2 rounded-xl p-5 ${selectedBlock.color} ${selectedBlock.borderColor}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className={`font-bold text-base mb-2 ${selectedBlock.textColor}`}>
                  {selectedBlock.label}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedBlock.description}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-300 text-lg leading-none mt-0.5"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <p className="text-xs text-gray-600 text-center">Select a block above to see its description</p>
      )}
    </div>
  );
}
