"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import XPBar from "@/components/XPBar";
import Byte from "@/components/Byte";
import StudentLogin from "@/components/StudentLogin";
import { useStudent } from "@/hooks/useStudent";
import SpeakButton from "@/components/SpeakButton";

// ─── Types ───────────────────────────────────────────────────────────────────

type YearBand = "yr3-4" | "yr5-6" | "yr7-8" | "yr9-10";

const YEAR_BANDS: { id: YearBand; label: string; color: string; activeColor: string }[] = [
  { id: "yr3-4",  label: "Yr 3–4",  color: "bg-gray-800 border-gray-700 text-gray-400", activeColor: "bg-teal-600 border-teal-500 text-white" },
  { id: "yr5-6",  label: "Yr 5–6",  color: "bg-gray-800 border-gray-700 text-gray-400", activeColor: "bg-teal-700 border-teal-600 text-white" },
  { id: "yr7-8",  label: "Yr 7–8",  color: "bg-gray-800 border-gray-700 text-gray-400", activeColor: "bg-teal-800 border-teal-700 text-white" },
  { id: "yr9-10", label: "Yr 9–10", color: "bg-gray-800 border-gray-700 text-gray-400", activeColor: "bg-teal-900 border-teal-800 text-white" },
];

const isLowerYear = (band: YearBand) => band === "yr3-4" || band === "yr5-6";

// ─── Yr 3-4: Mirror Game data ─────────────────────────────────────────────────

const MIRROR_SCENARIOS = [
  {
    id: 1,
    text: "A robot trained only on photos of male doctors keeps thinking female doctors are nurses.",
    isFair: false,
    reason: "The AI only saw male doctors in its training photos, so it learned to connect 'doctor' with 'male'. It's reflecting a biased dataset — not reality.",
  },
  {
    id: 2,
    text: "An AI learns from books written in English, so it struggles with other languages.",
    isFair: false,
    reason: "The training data didn't include other languages, so the AI can't serve speakers of those languages fairly. What you leave out of training data matters just as much as what you include.",
  },
  {
    id: 3,
    text: "A face recognition system works well for light skin but not dark skin, because it had fewer dark-skin photos to learn from.",
    isFair: false,
    reason: "This is representation bias — the training photos didn't include enough diversity. The AI works better for groups it saw more of in training, which can cause real harm.",
  },
  {
    id: 4,
    text: "An AI spell-checker trained on lots of different writing styles works well for everyone.",
    isFair: true,
    reason: "Because the training data included diverse writing styles, the AI learned to help everyone equally. Diverse, representative data leads to fairer AI!",
  },
  {
    id: 5,
    text: "A job-sorting AI trained on old job applications keeps recommending men for leadership roles.",
    isFair: false,
    reason: "The old job applications reflected historical bias — most leadership roles went to men back then. The AI learned that pattern and keeps repeating it, even though times have changed.",
  },
];

// ─── Yr 5-6: Bias Detective data ─────────────────────────────────────────────

const DETECTIVE_SCENARIOS = [
  {
    id: 1,
    output: 'An AI resume screener ranks "James" 40% higher than "Jamal" for the exact same resume.',
    question: "Why might the training data have caused this?",
    options: [
      { id: "a", text: "The AI ran out of memory and made a random error." },
      { id: "b", text: "The AI learned from historical hiring data where bias already existed — it picked up patterns connecting certain names with success." },
      { id: "c", text: "The AI preferred shorter names because they load faster." },
      { id: "d", text: "The resumes were accidentally swapped in the system." },
    ],
    correctId: "b",
    explanation: "Historical hiring data reflects real-world discrimination. The AI learned that certain names were statistically associated with being hired — not because of ability, but because of past bias in who got the job.",
  },
  {
    id: 2,
    output: 'An AI image generator asked to show "a scientist" produces 90% male images.',
    question: "What caused the AI to produce mostly male scientist images?",
    options: [
      { id: "a", text: "The AI was programmed to prefer male images." },
      { id: "b", text: "Scientists are actually 90% male in real life." },
      { id: "c", text: "Training images over-represented male scientists, so the AI learned that 'scientist' statistically means 'male'." },
      { id: "d", text: "The image quality was better for male faces in the dataset." },
    ],
    correctId: "c",
    explanation: "The AI isn't being deliberately sexist — it learned from photos where male scientists appeared far more often. It's reflecting historical under-representation, not current reality.",
  },
  {
    id: 3,
    output: 'An AI translation system translates a gender-neutral word for "nurse" and defaults to female pronouns.',
    question: "Why did the AI assign female pronouns to 'nurse'?",
    options: [
      { id: "a", text: "The AI was told nurses are female by its programmers." },
      { id: "b", text: "Language training data reflected cultural stereotypes — most texts used female pronouns for nurses." },
      { id: "c", text: "Female pronouns are grammatically more common in all languages." },
      { id: "d", text: "The AI confused 'nurse' with another word." },
    ],
    correctId: "b",
    explanation: "The AI learned from millions of real texts that were written when gender-role stereotypes were common. It found a statistical pattern (nurse → she) and repeated it — even though that pattern encodes a cultural bias.",
  },
  {
    id: 4,
    output: "An AI content moderator flags significantly more posts from non-native English speakers as potential spam.",
    question: "Why does this AI treat non-native English writers unfairly?",
    options: [
      { id: "a", text: "Non-native English speakers actually do post more spam." },
      { id: "b", text: "The AI was specifically trained to target non-native speakers." },
      { id: "c", text: "Training data had very few examples of diverse English styles, so the AI flags anything 'different' from standard native-speaker English." },
      { id: "d", text: "The moderation rules only work in American English." },
    ],
    correctId: "c",
    explanation: "The AI learned what 'normal' looks like from mostly native-speaker text. Unusual grammar or phrasing looks like a red flag — even when the content is perfectly legitimate. This is representation bias: the training data wasn't diverse enough.",
  },
];

// ─── Yr 7-8: Bias Audit Tool simulation data ─────────────────────────────────

// Pre-computed simulation: slider = % of training data from Group A (5–95)
// At 50/50 both groups get equal accuracy (~75%).
// As Group A's share increases, Group A accuracy rises toward 92%, Group B falls toward 38%.
// Formula: accA = 75 + (sliderA - 50) * 0.34  (range ~58% at 5% → ~92% at 95%)
//          accB = 75 - (sliderA - 50) * 0.74  (range ~92% at 5% → ~38% at 95%)
// The asymmetry in slope reflects that under-representation hurts more than over-representation helps.
function getAuditData(sliderA: number) {
  const delta = sliderA - 50; // −45 to +45
  const accA = Math.min(99, Math.max(10, Math.round(75 + delta * 0.38)));
  const accB = Math.min(99, Math.max(10, Math.round(75 - delta * 0.82)));
  const fairnessScore = Math.round(100 - Math.abs(accA - accB));
  return { accA, accB, fairnessScore };
}

// ─── Yr 9-10: Fix the Bias case study data ───────────────────────────────────

const BIAS_TYPES = [
  "Historical bias",
  "Representation bias",
  "Measurement bias",
  "Feedback loop bias",
] as const;

const MITIGATION_OPTIONS = [
  { id: "diverse-data", label: "Collect more diverse training data", tradeoff: "Expensive and time-consuming to collect. Helps long-term but doesn't fix the model you have now." },
  { id: "reweight", label: "Re-weight underrepresented groups in training", tradeoff: "Can improve fairness quickly but may reduce overall accuracy slightly. Doesn't fix the root data problem." },
  { id: "post-process", label: "Apply post-processing corrections to outputs", tradeoff: "Fast to implement. However, it patches symptoms rather than causes — the underlying bias remains in the model." },
  { id: "reject", label: "Reject the system entirely — it's not safe to deploy", tradeoff: "Safest option when harm is severe and no mitigation is sufficient. But it may leave a genuine need unmet." },
] as const;

type MitigationId = (typeof MITIGATION_OPTIONS)[number]["id"];

const CASE_STUDIES = [
  {
    id: "hiring",
    title: "Hiring Algorithm",
    icon: "💼",
    scenario: "A large company uses an AI to screen job applications. Researchers discover it downranks CVs from candidates who attended all-women's colleges, and is 35% less likely to recommend women for senior roles.",
    biasType: "Historical bias" as const,
    suggestedMitigation: "reweight" as MitigationId,
    context: "The AI was trained on 10 years of successful hires — but the company historically hired mostly men. The AI 'learned' that male-coded patterns predict success, because that's what its training data showed.",
  },
  {
    id: "medical",
    title: "Medical Imaging AI",
    icon: "🏥",
    scenario: "A skin cancer detection AI achieves 94% accuracy overall — but only 78% accuracy for patients with dark skin tones. The difference could mean delayed diagnoses and worse health outcomes.",
    biasType: "Representation bias" as const,
    suggestedMitigation: "diverse-data" as MitigationId,
    context: "Medical imaging datasets have historically over-represented lighter-skinned patients. The AI simply has less training data for darker skin tones, so it performs worse — with potentially life-or-death consequences.",
  },
  {
    id: "policing",
    title: "Predictive Policing",
    icon: "⚖️",
    scenario: "A police force uses AI to predict where crimes are likely to occur. The system consistently flags low-income, majority-minority neighbourhoods — leading to more patrols, more arrests, which feeds back into the training data.",
    biasType: "Feedback loop bias" as const,
    suggestedMitigation: "reject" as MitigationId,
    context: "Crime data reflects where police patrol, not where crime actually occurs. More patrols → more arrests → AI flags area as high-crime → more patrols. The system amplifies existing inequities rather than measuring actual crime rates.",
  },
];

// ─── Component: Yr 3-4 Mirror Game ───────────────────────────────────────────

function MirrorGame({ onXPEarned, onComplete }: { onXPEarned: (xp: number) => void; onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);

  const handleAnswer = useCallback((scenarioId: number, answeredFair: boolean) => {
    if (answers[scenarioId] !== undefined) return;
    const newAnswers = { ...answers, [scenarioId]: answeredFair };
    setAnswers(newAnswers);
    onXPEarned(10);
    if (Object.keys(newAnswers).length === MIRROR_SCENARIOS.length) {
      setTimeout(() => {
        setDone(true);
        onXPEarned(30);
        onComplete();
      }, 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, onXPEarned, onComplete]);

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      {MIRROR_SCENARIOS.map((scenario) => {
        const isAnswered = answers[scenario.id] !== undefined;
        const answeredFair = answers[scenario.id];
        const wasCorrect = isAnswered && answeredFair === scenario.isFair;

        return (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: scenario.id * 0.08 }}
            className={`rounded-xl border p-5 transition-all ${
              !isAnswered
                ? "border-gray-700 bg-gray-900"
                : wasCorrect
                  ? "border-teal-600 bg-teal-950/40"
                  : "border-yellow-700 bg-yellow-950/20"
            }`}
          >
            {/* Scenario text + SpeakButton */}
            <div className="flex items-start gap-3 mb-4">
              <p className="text-gray-200 text-sm leading-relaxed flex-1">{scenario.text}</p>
              <div className="shrink-0">
                <SpeakButton text={scenario.text} theme="teal" size="xs" />
              </div>
            </div>

            {/* Buttons or feedback */}
            {!isAnswered ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswer(scenario.id, true)}
                  className="flex-1 py-2 rounded-lg border border-teal-700 text-teal-300 text-sm font-semibold hover:bg-teal-900/50 transition-all active:scale-95"
                >
                  ✓ Fair
                </button>
                <button
                  onClick={() => handleAnswer(scenario.id, false)}
                  className="flex-1 py-2 rounded-lg border border-red-800 text-red-300 text-sm font-semibold hover:bg-red-950/50 transition-all active:scale-95"
                >
                  ✗ Unfair
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {/* Correct / incorrect verdict */}
                <div className={`flex items-center gap-2 text-sm font-semibold ${
                  wasCorrect ? "text-teal-400" : "text-yellow-400"
                }`}>
                  {wasCorrect
                    ? (scenario.isFair ? "✓ Correct — this one is fair!" : "✓ Correct — this is unfair!")
                    : (scenario.isFair ? "Not quite — this one is actually fair." : "Not quite — this is actually unfair.")}
                  <span className="text-yellow-400">+10 XP ⭐</span>
                </div>
                {/* Reason */}
                <div className="flex items-start gap-2">
                  <p className="text-gray-400 text-xs leading-relaxed flex-1">
                    💡 {scenario.reason}
                  </p>
                  <div className="shrink-0">
                    <SpeakButton text={scenario.reason} theme="teal" size="xs" />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal-950 border border-teal-700 rounded-xl p-5 text-center"
        >
          <p className="text-teal-200 font-semibold mb-2">🎉 Great work! +30 bonus XP!</p>
          <p className="text-teal-300 text-sm">
            {`${MIRROR_SCENARIOS.filter(s => !s.isFair).length} out of 5 scenarios showed unfair AI. `}
            Just like a mirror shows back what you show it, AI learns from the data it&apos;s given — 
            including any unfairness in that data.
          </p>
        </motion.div>
      )}

      {!done && (
        <p className="text-gray-500 text-sm text-center">
          {answeredCount} of {MIRROR_SCENARIOS.length} answered
        </p>
      )}
    </div>
  );
}

// ─── Component: Yr 5-6 Bias Detective ────────────────────────────────────────

function BiasDetective({ onXPEarned, onComplete }: { onXPEarned: (xp: number) => void; onComplete: () => void }) {
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);

  const handleSubmit = useCallback((scenarioId: number) => {
    if (submitted[scenarioId] || !selections[scenarioId]) return;
    const newSubmitted = { ...submitted, [scenarioId]: true };
    setSubmitted(newSubmitted);
    onXPEarned(15);
    if (Object.keys(newSubmitted).length === DETECTIVE_SCENARIOS.length) {
      setTimeout(() => {
        setDone(true);
        onXPEarned(20);
        onComplete();
      }, 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, selections, onXPEarned, onComplete]);

  return (
    <div className="space-y-6">
      {DETECTIVE_SCENARIOS.map((scenario) => {
        const isSubmitted = submitted[scenario.id];
        const selectedId = selections[scenario.id];
        const isCorrect = isSubmitted && selectedId === scenario.correctId;

        return (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: scenario.id * 0.1 }}
            className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden"
          >
            <div className="p-5">
              {/* Output header */}
              <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-2">
                AI Output #{scenario.id}
              </p>

              {/* AI output text + SpeakButton */}
              <div className="flex items-start gap-3 mb-4">
                <p className="text-gray-200 text-sm leading-relaxed flex-1">{scenario.output}</p>
                <div className="shrink-0">
                  <SpeakButton text={scenario.output} theme="teal" size="xs" />
                </div>
              </div>

              {/* Question */}
              <p className="text-gray-400 text-xs font-semibold mb-3">{scenario.question}</p>

              {/* Multiple choice options */}
              <div className="space-y-2 mb-4">
                {scenario.options.map((option) => {
                  let style = "border-gray-700 text-gray-300 hover:border-gray-600";
                  if (isSubmitted) {
                    if (option.id === scenario.correctId) {
                      style = "border-teal-500 bg-teal-950/50 text-teal-200";
                    } else if (option.id === selectedId) {
                      style = "border-red-700 bg-red-950/30 text-red-300";
                    } else {
                      style = "border-gray-800 text-gray-600 opacity-50";
                    }
                  } else if (option.id === selectedId) {
                    style = "border-teal-600 bg-teal-950/30 text-teal-200";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => !isSubmitted && setSelections((prev) => ({ ...prev, [scenario.id]: option.id }))}
                      disabled={isSubmitted}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${style} ${isSubmitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="font-bold mr-2 text-gray-500">{option.id.toUpperCase()}.</span>
                      {option.text}
                      {isSubmitted && option.id === scenario.correctId && (
                        <span className="ml-2 text-teal-400">✓</span>
                      )}
                      {isSubmitted && option.id === selectedId && option.id !== scenario.correctId && (
                        <span className="ml-2 text-red-400">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!isSubmitted && (
                <button
                  onClick={() => handleSubmit(scenario.id)}
                  disabled={!selectedId}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
                >
                  Check answer →
                </button>
              )}
            </div>

            {/* Revealed explanation */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`border-t px-5 py-4 ${isCorrect ? "border-teal-800 bg-teal-950/50" : "border-yellow-800 bg-yellow-950/20"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isCorrect ? "text-teal-400" : "text-yellow-400"}`}>
                        {isCorrect ? "✓ Correct! — " : "Not quite — "}
                        🔍 Here&apos;s the explanation
                      </p>
                      <p className={`text-sm leading-relaxed ${isCorrect ? "text-teal-200" : "text-yellow-200"}`}>
                        {scenario.explanation}
                      </p>
                      <p className="text-yellow-400 text-xs mt-2 font-semibold">+15 XP ⭐</p>
                    </div>
                    <div className="shrink-0">
                      <SpeakButton text={scenario.explanation} theme="teal" size="xs" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal-950 border border-teal-700 rounded-xl p-5 text-center"
        >
          <p className="text-teal-200 font-semibold mb-2">🕵️ Detective work complete! +20 bonus XP!</p>
          <p className="text-teal-300 text-sm">
            You&apos;ve identified bias in 4 real AI systems. The hardest part is that all these AIs 
            were built by well-meaning people — but the data they used carried hidden biases forward.
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Component: Bias Audit Tool (Yr 7-8) ─────────────────────────────────────

function BiasAuditTool() {
  const [sliderA, setSliderA] = useState(70);
  const sliderB = 100 - sliderA;
  const { accA, accB, fairnessScore } = getAuditData(sliderA);

  const fairnessColor = fairnessScore >= 80 ? "text-teal-400" : fairnessScore >= 60 ? "text-yellow-400" : "text-red-400";
  const fairnessLabel = fairnessScore >= 80 ? "Fair" : fairnessScore >= 60 ? "Moderate bias" : "High bias";

  // SVG layout constants
  // Chart occupies the full SVG height minus small top/bottom margins.
  // Group name labels are placed OUTSIDE the SVG in HTML, not inside — so no dead space below.
  const SVG_W = 400;
  const SVG_H = 200;
  const CHART_LEFT = 44;   // space for y-axis labels
  const CHART_RIGHT = 376;
  const CHART_TOP = 20;    // top margin — room for value label above 100% bar
  const CHART_BOTTOM = 188; // baseline — close to SVG bottom edge
  const CHART_H = CHART_BOTTOM - CHART_TOP; // 168px — nearly full height
  const BAR_W = 72;

  // Bar x-centres
  const BAR_A_X = CHART_LEFT + (CHART_RIGHT - CHART_LEFT) * 0.28;
  const BAR_B_X = CHART_LEFT + (CHART_RIGHT - CHART_LEFT) * 0.72;

  // Convert 0–100% to SVG y. 100% → CHART_TOP, 0% → CHART_BOTTOM.
  const toY = (pct: number) => CHART_BOTTOM - (pct / 100) * CHART_H;

  // Value label y: 10px above bar top, clamped inside SVG
  const labelY = (pct: number) => Math.max(CHART_TOP + 10, toY(pct) - 6);

  // Grid line percentages
  const gridLines = [25, 50, 75, 100];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-base font-semibold text-white mb-1">⚙️ Adjust Training Data</h3>
      <p className="text-gray-400 text-sm mb-6">
        Drag the slider to change how much training data comes from each group.
        See how it affects the AI&apos;s accuracy for each group.
      </p>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Group A: <span className="text-teal-400 font-bold">{sliderA}%</span> of training data</span>
          <span>Group B: <span className="text-orange-400 font-bold">{sliderB}%</span> of training data</span>
        </div>
        <input
          type="range"
          min={5}
          max={95}
          step={5}
          value={sliderA}
          onChange={(e) => setSliderA(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600">← More B data</span>
          <span className="text-xs text-gray-600">More A data →</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="mb-6">
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="rounded-lg overflow-hidden">
          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="#111827" rx="8" />

          {/* Grid lines + y-axis labels — label centred on its gridline */}
          {gridLines.map((pct) => {
            const gy = toY(pct);
            return (
              <g key={pct}>
                <line
                  x1={CHART_LEFT} y1={gy}
                  x2={CHART_RIGHT} y2={gy}
                  stroke="#374151" strokeWidth="0.5" strokeDasharray="4,4"
                />
                {/* dominantBaseline="middle" centres text vertically on the gridline */}
                <text
                  x={CHART_LEFT - 5} y={gy}
                  fill="#6b7280" fontSize="9" textAnchor="end"
                  dominantBaseline="middle"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Baseline (0%) */}
          <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={CHART_RIGHT} y2={CHART_BOTTOM} stroke="#4b5563" strokeWidth="1" />

          {/* Group A bar — plain SVG rect with CSS transition (framer-motion conflicts with SVG y/height attributes) */}
          {(() => {
            const barTop = toY(accA);
            const barH = CHART_BOTTOM - barTop;
            const lblY = labelY(accA);
            return (
              <g>
                <rect
                  x={BAR_A_X - BAR_W / 2}
                  y={barTop}
                  width={BAR_W}
                  height={barH}
                  fill="#14b8a6"
                  rx="4"
                  style={{ transition: "y 0.4s ease, height 0.4s ease" }}
                />
                <text
                  x={BAR_A_X}
                  y={lblY}
                  fill="#5eead4"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="auto"
                  style={{ transition: "y 0.4s ease" }}
                >
                  {accA}%
                </text>
              </g>
            );
          })()}

          {/* Group B bar */}
          {(() => {
            const barTop = toY(accB);
            const barH = CHART_BOTTOM - barTop;
            const lblY = labelY(accB);
            return (
              <g>
                <rect
                  x={BAR_B_X - BAR_W / 2}
                  y={barTop}
                  width={BAR_W}
                  height={barH}
                  fill="#f97316"
                  rx="4"
                  style={{ transition: "y 0.4s ease, height 0.4s ease" }}
                />
                <text
                  x={BAR_B_X}
                  y={lblY}
                  fill="#fdba74"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="auto"
                  style={{ transition: "y 0.4s ease" }}
                >
                  {accB}%
                </text>
              </g>
            );
          })()}

          {/* Y-axis title (rotated) */}
          <text
            x={8} y={CHART_TOP + CHART_H / 2}
            fill="#6b7280" fontSize="9" textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(-90, 8, ${CHART_TOP + CHART_H / 2})`}
          >
            Accuracy %
          </text>
        </svg>

        {/* Group name labels in HTML — positioned to match bar x-centres */}
        <div className="flex mt-1" style={{ paddingLeft: `${(BAR_A_X / SVG_W) * 100}%` }}>
          <span className="text-xs font-semibold text-teal-400" style={{ transform: "translateX(-50%)" }}>Group A</span>
          <span className="text-xs font-semibold text-orange-400" style={{ marginLeft: `${((BAR_B_X - BAR_A_X) / SVG_W) * 100}%`, transform: "translateX(-50%)" }}>Group B</span>
        </div>
      </div>

      {/* Fairness Score */}
      <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Fairness Score</p>
          <p className={`text-3xl font-bold ${fairnessColor}`}>{fairnessScore}</p>
          <p className={`text-sm font-semibold ${fairnessColor}`}>{fairnessLabel}</p>
        </div>
        <div className="text-right text-sm text-gray-400 max-w-[200px]">
          {fairnessScore >= 80 && <p>Training data is balanced. Both groups are served fairly.</p>}
          {fairnessScore >= 60 && fairnessScore < 80 && <p>There&apos;s a noticeable gap. One group is getting worse results.</p>}
          {fairnessScore < 60 && <p>Significant bias detected. The underrepresented group is poorly served.</p>}
        </div>
      </div>

      <div className="mt-4 bg-teal-950 border border-teal-900 rounded-lg p-3 text-sm text-teal-300">
        💡 Try setting Group A to 95% — then watch what happens to Group B&apos;s accuracy. This simulates what happens when AI training data is dominated by one group.
      </div>
    </div>
  );
}

// ─── Component: Fix the Bias Challenge (Yr 9-10) ─────────────────────────────

function FixTheBias() {
  const [biasSelections, setBiasSelections] = useState<Record<string, string>>({});
  const [mitigationSelections, setMitigationSelections] = useState<Record<string, MitigationId | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const handleReveal = (caseId: string) => {
    if (!biasSelections[caseId] || !mitigationSelections[caseId]) return;
    setRevealed((prev) => ({ ...prev, [caseId]: true }));
  };

  return (
    <div className="space-y-8">
      {CASE_STUDIES.map((cs) => {
        const isRevealed = revealed[cs.id];
        const chosenMitigation = MITIGATION_OPTIONS.find((m) => m.id === mitigationSelections[cs.id]);
        const isCorrectMitigation = mitigationSelections[cs.id] === cs.suggestedMitigation;
        const isCorrectBias = biasSelections[cs.id] === cs.biasType;

        return (
          <motion.div
            key={cs.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden"
          >
            {/* Case header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gray-800 border-b border-gray-700">
              <span className="text-2xl">{cs.icon}</span>
              <h3 className="text-white font-bold">{cs.title}</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-300 text-sm leading-relaxed mb-6">{cs.scenario}</p>

              {/* Step 1: Identify bias type */}
              <div className="mb-5">
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-3">
                  Step 1 — What type of bias is this?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {BIAS_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => !isRevealed && setBiasSelections((prev) => ({ ...prev, [cs.id]: type }))}
                      className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                        biasSelections[cs.id] === type
                          ? "border-teal-500 bg-teal-900/50 text-teal-200"
                          : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                      } ${isRevealed ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose mitigation */}
              <div className="mb-5">
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-3">
                  Step 2 — Which mitigation strategy would you apply?
                </p>
                <div className="space-y-2">
                  {MITIGATION_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => !isRevealed && setMitigationSelections((prev) => ({ ...prev, [cs.id]: option.id }))}
                      className={`w-full px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                        mitigationSelections[cs.id] === option.id
                          ? "border-teal-500 bg-teal-900/50 text-teal-200"
                          : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                      } ${isRevealed ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {!isRevealed && (
                <button
                  onClick={() => handleReveal(cs.id)}
                  disabled={!biasSelections[cs.id] || !mitigationSelections[cs.id]}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
                >
                  See analysis →
                </button>
              )}

              {/* Revealed analysis */}
              <AnimatePresence>
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-3"
                  >
                    <div className={`rounded-lg border p-4 ${isCorrectBias ? "border-teal-700 bg-teal-950/50" : "border-yellow-700 bg-yellow-950/30"}`}>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-gray-400">Bias type</p>
                      <p className={`text-sm font-semibold ${isCorrectBias ? "text-teal-300" : "text-yellow-300"}`}>
                        {isCorrectBias ? "✓ Correct!" : `Close — this is actually ${cs.biasType}.`}
                      </p>
                      <p className="text-gray-300 text-sm mt-1">{cs.context}</p>
                    </div>

                    {chosenMitigation && (
                      <div className={`rounded-lg border p-4 ${isCorrectMitigation ? "border-teal-700 bg-teal-950/50" : "border-gray-700 bg-gray-800"}`}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-gray-400">Your strategy: {chosenMitigation.label}</p>
                        <p className="text-sm text-gray-300">{chosenMitigation.tradeoff}</p>
                        {isCorrectMitigation && (
                          <p className="text-teal-400 text-sm mt-2 font-semibold">✓ This matches expert recommendations for this case.</p>
                        )}
                        {!isCorrectMitigation && (
                          <p className="text-gray-400 text-sm mt-2">
                            Experts often recommend: <strong className="text-teal-300">{MITIGATION_OPTIONS.find(m => m.id === cs.suggestedMitigation)?.label}</strong> — 
                            but there&apos;s genuine debate. Justify your reasoning.
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function M6Page() {
  const [yearBand, setYearBand] = useState<YearBand>("yr7-8");
  const [activityDone, setActivityDone] = useState(false);
  const student = useStudent();

  const handleXPEarned = async (amount: number) => {
    if (student.isLoggedIn) {
      await student.earnXP("m6", yearBand, `bias-activity-${yearBand}`, amount);
    }
  };

  const handleComplete = async () => {
    setActivityDone(true);
    if (student.isLoggedIn) {
      await student.earnXP("m6", yearBand, `bias-complete-${yearBand}`, 0);
    }
  };

  const headerText =
    "AI learns from human data — and humans aren't always fair. In this module, we explore how bias enters AI systems, why it matters, and what we can do about it.";

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
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
          <span className="text-4xl">⚖️</span>
          <div>
            <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest">
              Module 6 — Data &amp; Bias
            </p>
            <h1 className="text-3xl font-bold text-white">Data &amp; Bias</h1>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <p className="text-gray-400 text-lg max-w-2xl">
            AI learns from human data — and humans aren&apos;t always fair.
          </p>
          <SpeakButton text={headerText} theme="teal" size="sm" />
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
              className={`min-h-[48px] px-5 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
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
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <XPBar xp={student.xp} previousXp={student.previousXp} />
        </motion.div>
      )}

      {/* ── Yr 3-4: The Mirror Game ── */}
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
            <div className="mb-5">
              <h2 className="text-xl font-bold text-teal-400 mb-2">🪞 The Mirror Game</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                A mirror shows back exactly what you put in front of it. AI works the same way — 
                it learns from the data it&apos;s given. If that data is unfair, the AI will be unfair too.
                <br /><br />
                Look at each situation below and decide: is it <strong className="text-teal-300">fair</strong> or <strong className="text-red-400">unfair</strong>?
              </p>
            </div>
            <MirrorGame onXPEarned={handleXPEarned} onComplete={handleComplete} />

            {/* Byte inline for mobile */}
            {student.isLoggedIn && (
              <div className="mt-8 flex justify-center md:hidden">
                <Byte emotion={activityDone ? "celebrating" : "happy"} size={80} />
              </div>
            )}
          </motion.div>
        )}

        {/* ── Yr 5-6: Bias Detective ── */}
        {yearBand === "yr5-6" && (
          <motion.div
            key="yr5-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-teal-400 mb-2">🕵️ Bias Detective</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Below are 4 real AI systems that produced unfair results. For each one, read what 
                went wrong — then write your best guess about <em>why</em> the training data might 
                have caused it. Then reveal the explanation!
              </p>
            </div>
            <BiasDetective onXPEarned={handleXPEarned} onComplete={handleComplete} />

            {student.isLoggedIn && (
              <div className="mt-8 flex justify-center md:hidden">
                <Byte emotion={activityDone ? "celebrating" : "happy"} size={80} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Yr 7-8 and 9-10: Concept content ── */}
      {(yearBand === "yr7-8" || yearBand === "yr9-10") && (
        <>
          {/* Concept 1: Where does bias come from? */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-lg font-semibold text-white">Where does bias come from?</h2>
              <SpeakButton
                text="Where does bias come from? There are three main sources. First, historical bias — training data reflects past inequity. If historical data shows women in fewer leadership roles, an AI trained on it will encode that inequality. Second, representation bias — some groups are underrepresented in training data. A face recognition system trained mostly on one demographic will perform worse for others. Third, measurement bias — the thing being measured is itself flawed. If we use arrest records as a proxy for crime, we encode policing patterns, not actual crime rates."
                theme="teal"
                size="xs"
              />
            </div>
            <p className="text-gray-300 mb-4">
              Bias in AI rarely comes from malicious intent. It usually enters through the data. 
              There are three main sources:
            </p>
            <div className="space-y-4">
              {[
                {
                  label: "Historical bias",
                  color: "text-teal-400",
                  bg: "bg-teal-950/40 border-teal-900",
                  desc: "Training data reflects past inequity. If historical data shows women in fewer leadership roles, an AI trained on it will encode that inequality — even if society has changed.",
                },
                {
                  label: "Representation bias",
                  color: "text-orange-400",
                  bg: "bg-orange-950/30 border-orange-900",
                  desc: "Some groups are underrepresented in training data. A face recognition system trained mostly on one demographic will perform worse for others — sometimes with dangerous consequences.",
                },
                {
                  label: "Measurement bias",
                  color: "text-purple-400",
                  bg: "bg-purple-950/30 border-purple-900",
                  desc: "The thing being measured is itself flawed. If we use arrest records as a proxy for crime, we encode policing patterns, not actual crime rates — and the AI amplifies existing inequities.",
                },
              ].map((item) => (
                <div key={item.label} className={`rounded-lg border ${item.bg} p-4`}>
                  <p className={`text-sm font-bold ${item.color} mb-1`}>{item.label}</p>
                  <p className="text-gray-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Concept 2: Why does it matter? */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-lg font-semibold text-white">Why does it matter?</h2>
              <SpeakButton
                text="Why does bias in AI matter? AI systems are being deployed in high-stakes decisions. Hiring — Amazon scrapped an AI hiring tool in 2018 after discovering it downgraded women's CVs. Healthcare — pulse oximeters and medical AI have been shown to perform worse for darker skin tones. Criminal justice — AI risk scores used in US courts have been found to be racially biased. Finance — AI loan systems have been found to charge higher rates to minority applicants. The scale of AI deployment means a small bias in a model can affect millions of people simultaneously."
                theme="teal"
                size="xs"
              />
            </div>
            <p className="text-gray-300 mb-4">
              AI systems are being deployed in high-stakes decisions that affect people&apos;s lives. 
              When those systems carry bias, the consequences are real.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "💼", domain: "Hiring", example: "Amazon scrapped an AI hiring tool in 2018 after discovering it systematically downgraded women's CVs." },
                { icon: "🏥", domain: "Healthcare", example: "Pulse oximeters and medical AI have been shown to perform worse for patients with darker skin tones." },
                { icon: "⚖️", domain: "Criminal justice", example: "AI risk scores used in US courts to guide sentencing have been found to be racially biased." },
                { icon: "🏦", domain: "Finance", example: "AI-powered lending systems have been found to charge higher interest rates to minority applicants." },
              ].map((item) => (
                <div key={item.domain} className="rounded-lg bg-gray-800 border border-gray-700 p-4">
                  <p className="text-base mb-1">{item.icon} <span className="font-semibold text-white text-sm">{item.domain}</span></p>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.example}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-teal-950 border border-teal-900 rounded-lg p-4 text-sm text-teal-200">
              <div className="flex items-start justify-between gap-3">
                <p>
                  💡 <strong>Scale matters:</strong> A small bias in a model deployed to millions 
                  of people can cause harm at an enormous scale — far beyond what any individual 
                  human decision-maker could.
                </p>
                <SpeakButton text="Scale matters. A small bias in a model deployed to millions of people can cause harm at an enormous scale — far beyond what any individual human decision-maker could." theme="teal" size="xs" />
              </div>
            </div>
          </motion.section>

          {/* Interactive: Bias Audit Tool */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold text-white mb-2">🔬 Bias Audit Tool</h2>
            <p className="text-gray-400 text-sm mb-4">
              Simulate how training data balance affects AI fairness across two groups.
            </p>
            <BiasAuditTool />
          </motion.section>

          {/* Yr 9-10 ONLY: Additional concept + Fix the Bias */}
          {yearBand === "yr9-10" && (
            <>
              {/* Algorithmic Fairness */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-white">Types of algorithmic fairness</h2>
                  <SpeakButton
                    text="Types of algorithmic fairness. Researchers have defined multiple mathematical definitions of fairness — and they often conflict with each other. Demographic parity means: equal positive outcomes regardless of group. For example, the same percentage of men and women should be hired. Equalised odds means: equal true positive and false positive rates across groups. For example, equally likely to correctly identify a good candidate regardless of gender. Individual fairness means: similar individuals should be treated similarly, regardless of group membership. The conflict: it is mathematically impossible to satisfy demographic parity and equalised odds simultaneously when base rates differ between groups. This means every AI fairness decision involves ethical trade-offs, not just technical ones."
                    theme="teal"
                    size="xs"
                  />
                </div>
                <p className="text-gray-300 mb-4">
                  Researchers have defined multiple mathematical definitions of &ldquo;fairness&rdquo; — 
                  and they often <strong className="text-white">conflict with each other</strong>.
                </p>

                <div className="space-y-4 mb-5">
                  {[
                    {
                      name: "Demographic parity",
                      color: "text-teal-400",
                      bg: "bg-teal-950/40 border-teal-900",
                      definition: "Equal positive outcomes regardless of group.",
                      example: "The same percentage of men and women are offered loans.",
                    },
                    {
                      name: "Equalised odds",
                      color: "text-purple-400",
                      bg: "bg-purple-950/30 border-purple-900",
                      definition: "Equal true positive and false positive rates across groups.",
                      example: "Equally likely to correctly identify a creditworthy applicant, regardless of gender.",
                    },
                    {
                      name: "Individual fairness",
                      color: "text-orange-400",
                      bg: "bg-orange-950/30 border-orange-900",
                      definition: "Similar individuals should be treated similarly, regardless of group membership.",
                      example: "Two applicants with identical finances get the same decision, whatever their background.",
                    },
                  ].map((def) => (
                    <div key={def.name} className={`rounded-lg border ${def.bg} p-4`}>
                      <p className={`text-sm font-bold ${def.color} mb-1`}>{def.name}</p>
                      <p className="text-gray-300 text-sm mb-1">{def.definition}</p>
                      <p className="text-gray-500 text-xs italic">Example: {def.example}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-red-950/40 border border-red-900 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-red-300 text-sm font-semibold mb-1">⚠️ The impossibility result</p>
                      <p className="text-gray-300 text-sm">
                        It is <strong className="text-white">mathematically impossible</strong> to satisfy 
                        demographic parity and equalised odds simultaneously when base rates differ between groups. 
                        (Chouldechova, 2017; Kleinberg et al., 2016)
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        This means every AI fairness decision involves <em>ethical trade-offs</em>, 
                        not just technical ones. Choosing a fairness definition is a values decision.
                      </p>
                    </div>
                    <SpeakButton text="The impossibility result. It is mathematically impossible to satisfy demographic parity and equalised odds simultaneously when base rates differ between groups. This means every AI fairness decision involves ethical trade-offs, not just technical ones. Choosing a fairness definition is a values decision." theme="teal" size="xs" />
                  </div>
                </div>
              </motion.section>

              {/* Fix the Bias Challenge */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-lg font-semibold text-white mb-2">🛠️ Fix the Bias Challenge</h2>
                <p className="text-gray-400 text-sm mb-5">
                  Three real-world AI bias cases. For each: identify the bias type, then choose your 
                  mitigation strategy. There&apos;s no single right answer — but your reasoning matters.
                </p>
                <FixTheBias />
              </motion.section>
            </>
          )}

          {/* Insight callout */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: yearBand === "yr9-10" ? 0.7 : 0.5, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-teal-950 border border-teal-900 rounded-xl p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-teal-200 text-sm">
                  ⚖️ <strong>Did you know?</strong> In 2016, an AI called COMPAS was used in US courts 
                  to predict whether defendants were likely to reoffend. ProPublica found it was{" "}
                  <strong>twice as likely to falsely flag Black defendants as high risk</strong> compared 
                  to white defendants. The company disputed the findings — but the case sparked a global 
                  conversation about fairness in algorithmic decision-making.
                </p>
                <SpeakButton text="Did you know? In 2016, an AI called COMPAS was used in US courts to predict whether defendants were likely to reoffend. ProPublica found it was twice as likely to falsely flag Black defendants as high risk compared to white defendants. The company disputed the findings — but the case sparked a global conversation about fairness in algorithmic decision-making." theme="teal" size="xs" />
              </div>
            </div>
          </motion.section>
        </>
      )}

      {/* ── Key Takeaways — all year bands ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">What you&apos;ve learned</h2>
          <SpeakButton
            text="Key takeaways. AI learns patterns from data — if the data is biased, the AI will be too. Bias in AI can cause real harm to real people — in hiring, healthcare, and justice. Diverse, representative training data is one of the most important steps to fairer AI. Even well-intentioned AI systems can produce unfair outcomes — critical evaluation is essential."
            theme="teal"
            size="xs"
          />
        </div>
        <ul className="space-y-3">
          {[
            "AI learns patterns from data — if the data is biased, the AI will be too",
            "Bias in AI can cause real harm to real people — in hiring, healthcare, and justice",
            "Diverse, representative training data is one of the most important steps to fairer AI",
            "Even well-intentioned AI systems can produce unfair outcomes — critical evaluation is essential",
          ].map((point, i) => (
            <li key={i} className="flex gap-3 text-gray-300">
              <span className="text-teal-400 mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {/* Footer nav */}
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
          <Link
            href="/modules/m5"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← M5: Prediction
          </Link>
          <span className="text-xs text-gray-600">Module 6 of 6</span>
        </div>
      </motion.section>
    </main>
  );
}
