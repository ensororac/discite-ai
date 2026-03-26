"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LayerInfo {
  range: [number, number];
  theme: string;
  label: string;
  patterns: string[];
  detail: string;
  color: string;
  borderColor: string;
  textColor: string;
}

const LAYER_INFO: LayerInfo[] = [
  {
    range: [1, 4],
    theme: "Syntax & Surface",
    label: "Early layers",
    patterns: [
      "Basic grammar (subject, verb, object)",
      "Word endings and morphology",
      "Punctuation and sentence boundaries",
      "Simple word relationships",
    ],
    detail: "Early layers learn the basic structure of language — like how words fit together grammatically. Think of this as the AI learning the rules of the game before it plays.",
    color: "bg-blue-900",
    borderColor: "border-blue-600",
    textColor: "text-blue-200",
  },
  {
    range: [5, 8],
    theme: "Semantics & Meaning",
    label: "Middle layers",
    patterns: [
      "Word sense disambiguation (bank = river or money?)",
      "Coreference (which &ldquo;it&rdquo; refers to what)",
      "Semantic roles (who did what to whom)",
      "Entity recognition (person, place, organisation)",
    ],
    detail: "Middle layers handle meaning — understanding what words actually refer to in context. This is where the AI resolves ambiguity and builds a richer picture of what the text is about.",
    color: "bg-purple-900",
    borderColor: "border-purple-600",
    textColor: "text-purple-200",
  },
  {
    range: [9, 12],
    theme: "Reasoning & Abstraction",
    label: "Late layers",
    patterns: [
      "Long-range dependencies across paragraphs",
      "Logical inference and reasoning",
      "Tone, sentiment, and register",
      "Task-specific representations (translation, Q&A, etc.)",
    ],
    detail: "Late layers handle high-level reasoning — drawing inferences, understanding tone, and forming the final representation used for output. This is where abstract thinking happens.",
    color: "bg-orange-900",
    borderColor: "border-orange-600",
    textColor: "text-orange-200",
  },
];

function getLayerInfo(layer: number): LayerInfo {
  return LAYER_INFO.find(
    (info) => layer >= info.range[0] && layer <= info.range[1]
  ) ?? LAYER_INFO[0];
}

export default function LayerExplorer() {
  const [layer, setLayer] = useState(1);
  const info = getLayerInfo(layer);

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-400">
        Drag the slider to explore what different layers of a transformer tend to learn.
      </p>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Layer 1</span>
          <span className="text-orange-400 font-bold">Layer {layer}</span>
          <span>Layer 12</span>
        </div>
        <input
          type="range"
          min={1}
          max={12}
          value={layer}
          onChange={(e) => setLayer(Number(e.target.value))}
          className="w-full accent-orange-500 h-2 cursor-pointer"
          aria-label="Transformer layer selector"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>Syntax</span>
          <span>Semantics</span>
          <span>Reasoning</span>
        </div>
      </div>

      {/* Layer visualisation */}
      <div className="flex gap-1 items-end">
        {Array.from({ length: 12 }, (_, i) => {
          const layerNum = i + 1;
          const isActive = layerNum === layer;
          const isSameGroup = getLayerInfo(layerNum).theme === info.theme;
          return (
            <motion.button
              key={i}
              onClick={() => setLayer(layerNum)}
              animate={{
                height: isActive ? "56px" : isSameGroup ? "36px" : "24px",
                opacity: isActive ? 1 : isSameGroup ? 0.7 : 0.35,
              }}
              transition={{ duration: 0.2 }}
              className={`flex-1 rounded-t-md cursor-pointer transition-colors ${
                isActive
                  ? "bg-orange-500"
                  : isSameGroup
                  ? "bg-orange-800"
                  : "bg-gray-700"
              }`}
              title={`Layer ${layerNum}`}
              aria-label={`Layer ${layerNum}`}
            />
          );
        })}
      </div>

      {/* Info panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={info.theme}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`border-2 rounded-xl p-5 ${info.color} ${info.borderColor}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={`font-bold text-base ${info.textColor}`}>
              Layer {layer} — {info.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${info.borderColor} ${info.textColor} opacity-70`}>
              {info.theme}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-3 leading-relaxed">{info.detail}</p>
          <div>
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
              Patterns learned at this depth:
            </p>
            <ul className="space-y-1.5">
              {info.patterns.map((pattern, i) => (
                <li
                  key={i}
                  className={`text-sm flex gap-2 ${info.textColor}`}
                  dangerouslySetInnerHTML={{ __html: `<span class="mt-0.5">→</span><span>${pattern}</span>` }}
                />
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Note about GPT-4 */}
      <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
        <p className="text-orange-200 text-sm">
          🏗️ <strong>Scale matters:</strong> GPT-4 has <strong>96 layers</strong>. Each one refines the model&apos;s
          understanding a little further. More layers = more abstraction = better at complex reasoning.
        </p>
      </div>
    </div>
  );
}
