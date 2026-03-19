"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type TempExample = {
  temperature: number;
  chosenToken: string;
  description: string;
};

type Props = {
  data: {
    prompt: string;
    examples: TempExample[];
  };
};

const TEMP_CONFIG = [
  { label: "Very Low",  emoji: "🧊", color: "text-blue-400",   bar: "bg-blue-500",  border: "border-blue-700",  bg: "bg-blue-950" },
  { label: "Low",       emoji: "😐", color: "text-cyan-400",   bar: "bg-cyan-500",  border: "border-cyan-700",  bg: "bg-cyan-950" },
  { label: "Balanced",  emoji: "✅", color: "text-green-400",  bar: "bg-green-500", border: "border-green-700", bg: "bg-green-950" },
  { label: "High",      emoji: "🔥", color: "text-orange-400", bar: "bg-orange-500",border: "border-orange-700",bg: "bg-orange-950" },
];

export default function TemperatureExplainer({ data }: Props) {
  const [activeTemp, setActiveTemp] = useState(1); // default to 0.5

  const example = data.examples[activeTemp];
  const config = TEMP_CONFIG[activeTemp];
  const sliderWidth = ((activeTemp) / (data.examples.length - 1)) * 100;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      {/* Prompt */}
      <div className="bg-gray-950 border border-gray-800 rounded-lg px-5 py-3">
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Prompt</p>
        <p className="text-white font-mono">&ldquo;{data.prompt}&rdquo;</p>
      </div>

      {/* Temperature selector */}
      <div>
        <p className="text-sm text-gray-400 mb-3">
          Drag the temperature dial and see how the AI&apos;s choice changes:
        </p>
        <div className="flex gap-2">
          {data.examples.map((ex, i) => (
            <button
              key={ex.temperature}
              onClick={() => setActiveTemp(i)}
              className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                i === activeTemp
                  ? `${TEMP_CONFIG[i].bg} ${TEMP_CONFIG[i].border} ${TEMP_CONFIG[i].color}`
                  : "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300"
              }`}
            >
              {TEMP_CONFIG[i].emoji} {ex.temperature}
            </button>
          ))}
        </div>
        {/* Visual thermometer */}
        <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${sliderWidth === 0 ? 5 : sliderWidth}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`h-full rounded-full ${config.bar}`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Predictable</span>
          <span>Creative / Chaotic</span>
        </div>
      </div>

      {/* Result */}
      <motion.div
        key={activeTemp}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg border p-4 ${config.bg} ${config.border}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Temperature {example.temperature} — {config.label}
            </p>
            <p className={`text-xl font-bold font-mono ${config.color}`}>
              &ldquo;{example.chosenToken}&rdquo;
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-300">{example.description}</p>
      </motion.div>

      {/* Explainer */}
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-blue-400 font-semibold mb-1">🧊 Low temperature (0.1)</p>
          <p>Almost always picks the most probable token. Consistent but repetitive. Good for facts.</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-orange-400 font-semibold mb-1">🔥 High temperature (1.5)</p>
          <p>Samples from lower-probability tokens too. Surprising and creative, but can go off-track.</p>
        </div>
      </div>
    </div>
  );
}
