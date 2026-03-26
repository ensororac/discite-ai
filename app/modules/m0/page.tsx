"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Byte from "@/components/Byte";
import SpeakButton from "@/components/SpeakButton";
import XPBar from "@/components/XPBar";
import StudentLogin from "@/components/StudentLogin";
import { useStudent } from "@/hooks/useStudent";
import type { ByteEmotion } from "@/components/Byte";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "ai";
  text: string;
  id: number;
}

// ─── Simulated AI responses ────────────────────────────────────────────────────
// No real API needed — uses a rich scripted conversation that teaches concepts
// while feeling like a real chat. Fallback to generic if off-script.

const AI_GREETINGS = [
  "Hi! I'm Byte's brain — an AI! 👋 What's your name?",
];

const SCRIPTED_RESPONSES: Array<{ keywords: string[]; response: string; emotion: ByteEmotion; xp?: number }> = [
  {
    keywords: ["hello", "hi", "hey", "hiya", "howdy", "sup"],
    response: "Hey there! Great to meet you! I'm an AI — a computer program that can understand and write words. Pretty cool, right? Try asking me something!",
    emotion: "happy",
    xp: 5,
  },
  {
    keywords: ["what are you", "what is ai", "what is an ai", "who are you", "are you real", "are you human"],
    response: "Great question! 🤔 I'm Artificial Intelligence — AI for short. I'm a computer program trained on millions of books, websites and conversations. I don't think like a human, but I've learned to understand and write words! Ask me anything.",
    emotion: "thinking",
    xp: 10,
  },
  {
    keywords: ["how do you work", "how does ai work", "how do you think", "how do you understand"],
    response: "Ooh, this is what Discite AI is all about! 🎉 First, I chop your words into tiny pieces called **tokens**. Then I look up the *meaning* of each token using numbers (that's **embeddings**). Then I decide which words are most important — that's **attention**. Then I predict what to say next. It all happens in milliseconds! The other modules explain each step.",
    emotion: "excited",
    xp: 20,
  },
  {
    keywords: ["token", "tokenise", "tokenization", "tokenisation", "tokens"],
    response: "Tokens are tiny word-pieces! When you type 'unhappiness', I see 'un' + 'happi' + 'ness' — three tokens. Common words like 'the' stay as one token. I can only read so many tokens at once — that's my **context window**! Module 1 shows you this with a fun game. 🔤",
    emotion: "thinking",
    xp: 15,
  },
  {
    keywords: ["embedding", "embeddings", "meaning", "vectors", "numbers"],
    response: "Each token becomes a list of numbers that captures its *meaning*. Words that mean similar things get similar numbers! So 'happy' and 'joyful' are close together in my number-world, but 'happy' and 'volcano' are far apart. It's like a secret map of meaning! 🗺️ Check out Module 2 to explore this!",
    emotion: "excited",
    xp: 15,
  },
  {
    keywords: ["attention", "focus", "important", "relevant", "context"],
    response: "When I read 'I sat by the river bank', I need to figure out — does 'bank' mean money, or the side of a river? I use **attention** to look at all the nearby words and work it out. The word 'river' gets a high attention score from 'bank'. Pretty clever, right? 🔦 Module 3 is all about this!",
    emotion: "thinking",
    xp: 15,
  },
  {
    keywords: ["predict", "prediction", "next word", "guess", "generate"],
    response: "That's how I write! I look at all the words so far, and I pick the most likely *next* word — over and over again. It's a bit like autocomplete on your phone, but with way more brainpower! Each choice has a probability. 🎯 Module 5 lets you watch me predict in real time!",
    emotion: "excited",
    xp: 15,
  },
  {
    keywords: ["school", "learn", "learning", "student", "teacher", "class"],
    response: "AI is already being used in schools! It can help with writing, research, and even personalised learning. But the more you understand *how* AI works, the better you can use it — and spot when it makes mistakes. That's why Discite AI exists! 🎓",
    emotion: "happy",
    xp: 10,
  },
  {
    keywords: ["mistake", "wrong", "error", "lie", "hallucinate", "hallucination"],
    response: "Yes, I make mistakes! 😬 Sometimes I confidently say something that's not true — AI people call this 'hallucination'. It happens because I'm predicting words based on patterns, not actually *looking things up*. Always double-check important facts I give you!",
    emotion: "oops",
    xp: 10,
  },
  {
    keywords: ["bias", "fair", "unfair", "racist", "sexist", "prejudice"],
    response: "Really important question! I was trained on text written by humans — and humans aren't always fair. So I can accidentally pick up unfair patterns from that data. This is called **bias**, and it's one of the biggest challenges in AI. Module 6 dives into this! ⚖️",
    emotion: "thinking",
    xp: 20,
  },
  {
    keywords: ["funny", "joke", "tell me a joke", "make me laugh"],
    response: "Why did the AI go to school? 🤖 To improve its *learning* algorithm! …I'll stick to teaching. 😄",
    emotion: "happy",
    xp: 5,
  },
  {
    keywords: ["favourite", "favorite", "like", "love", "enjoy"],
    response: "Honestly? I love when students ask deep questions about how I work! It means you're thinking critically about AI — and that's exactly what the world needs more of. 🌟 What do *you* like?",
    emotion: "happy",
    xp: 5,
  },
  {
    keywords: ["bye", "goodbye", "see you", "cya", "thanks", "thank you"],
    response: "It was awesome chatting with you! 🎉 Now explore the modules — Module 1 on Tokenisation is a great first stop. You'll see exactly how I chop your words into pieces. Good luck, explorer! 🚀",
    emotion: "celebrating",
    xp: 10,
  },
];

const FALLBACK_RESPONSES: string[] = [
  "Hmm, that's an interesting one! I'm not sure I have a great answer right now. Try asking me how I work, or what tokens are! 🤔",
  "Great question! For this demo I'm keeping things focused on how AI works. Ask me about tokens, embeddings, or how I think!",
  "I'm still learning too! 😄 Try asking me 'how do you work?' — that's my favourite question.",
  "Ooh, I'd need to think harder about that one! For now, ask me about AI — that's what I know best.",
];

const CHAT_API = "https://discite-api.ensororac.workers.dev/chat";

/**
 * Hybrid AI response:
 * 1. Check scripted keywords first (instant, educational, zero latency)
 * 2. If no keyword match → call Cloudflare AI worker (live LLM)
 * 3. If worker fails → fall back to scripted fallback message
 */
async function getAIResponse(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ text: string; emotion: ByteEmotion; xp: number }> {
  const lower = userMessage.toLowerCase();

  // Step 1: scripted keyword match
  for (const entry of SCRIPTED_RESPONSES) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return { text: entry.response, emotion: entry.emotion, xp: entry.xp ?? 5 };
    }
  }

  // Step 2: live LLM via Cloudflare AI worker
  try {
    const res = await fetch(CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, history }),
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (res.ok) {
      const data = await res.json() as { reply?: string };
      if (data.reply) {
        return { text: data.reply, emotion: "happy", xp: 8 };
      }
    }
  } catch {
    // Worker unreachable or timed out — fall through to scripted fallback
  }

  // Step 3: scripted fallback
  const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  return { text: fallback, emotion: "thinking", xp: 3 };
}

// ─── Badge component ───────────────────────────────────────────────────────────

function FirstConvoBadge({ earned }: { earned: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: earned ? 1 : 0.8, opacity: earned ? 1 : 0.35 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 w-28 ${
        earned
          ? "border-cyan-400 bg-cyan-950/60"
          : "border-gray-700 bg-gray-900 grayscale"
      }`}
    >
      <span className="text-3xl">🤖</span>
      <span className={`text-xs font-bold text-center leading-tight ${earned ? "text-cyan-300" : "text-gray-600"}`}>
        First Chat
      </span>
      {earned && <span className="text-xs text-cyan-500">+50 XP</span>}
    </motion.div>
  );
}

function ExplorerBadge({ earned }: { earned: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: earned ? 1 : 0.8, opacity: earned ? 1 : 0.35 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 w-28 ${
        earned
          ? "border-yellow-400 bg-yellow-950/60"
          : "border-gray-700 bg-gray-900 grayscale"
      }`}
    >
      <span className="text-3xl">🔍</span>
      <span className={`text-xs font-bold text-center leading-tight ${earned ? "text-yellow-300" : "text-gray-600"}`}>
        AI Explorer
      </span>
      {earned && <span className="text-xs text-yellow-500">+75 XP</span>}
    </motion.div>
  );
}

// ─── Conversation starters ────────────────────────────────────────────────────

const STARTERS = [
  "What are you?",
  "How do you work?",
  "What are tokens?",
  "Do you make mistakes?",
  "Tell me a joke",
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function M0Page() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: AI_GREETINGS[0], id: 0 },
  ]);
  const [input, setInput] = useState("");
  const [byteEmotion, setByteEmotion] = useState<ByteEmotion>("happy");
  const [byteMessage, setByteMessage] = useState<string | undefined>("Ask me anything! 👋");
  const [isTyping, setIsTyping] = useState(false);
  const [msgCounter, setMsgCounter] = useState(1);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [badge1, setBadge1] = useState(false); // First chat (3 messages)
  const [badge2, setBadge2] = useState(false); // AI Explorer (5 messages + ask about AI)
  const [askedAboutAI, setAskedAboutAI] = useState(false);

  const student = useStudent();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll within the chat box only — not the whole page
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isTyping]);

  // Badge unlocks
  useEffect(() => {
    const userMsgCount = messages.filter((m) => m.role === "user").length;
    if (!badge1 && userMsgCount >= 3) {
      setBadge1(true);
      setByteMessage("You earned the First Chat badge! 🎉");
      setByteEmotion("celebrating");
      if (student.isLoggedIn) {
        student.earnXP("m0", "yr3-4", "first-chat-badge", 50);
      }
      setTotalXpEarned((x) => x + 50);
      setTimeout(() => setByteMessage(undefined), 3000);
    }
    if (!badge2 && userMsgCount >= 5 && askedAboutAI) {
      setBadge2(true);
      setByteMessage("AI Explorer badge unlocked! You're a natural! 🚀");
      setByteEmotion("celebrating");
      if (student.isLoggedIn) {
        student.earnXP("m0", "yr3-4", "ai-explorer-badge", 75);
      }
      setTotalXpEarned((x) => x + 75);
      setTimeout(() => setByteMessage(undefined), 3000);
    }
  }, [messages, badge1, badge2, askedAboutAI, student]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      // Check if they asked about AI (for badge tracking)
      const lower = trimmed.toLowerCase();
      if (
        lower.includes("how do you work") ||
        lower.includes("what are you") ||
        lower.includes("how does ai") ||
        lower.includes("token") ||
        lower.includes("embedding") ||
        lower.includes("attention")
      ) {
        setAskedAboutAI(true);
      }

      const currentId = msgCounter;
      const userMsg: Message = { role: "user", text: trimmed, id: currentId };
      setMsgCounter((c) => c + 2);
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);
      setByteEmotion("thinking");
      setByteMessage("Thinking…");

      // Build history for context (last 6 turns, excluding the greeting)
      setMessages((prev) => {
        // We just need a snapshot — actual call happens below
        return prev;
      });

      // Get current messages snapshot for history
      const historySnapshot = messages
        .filter((m) => m.id > 0) // skip greeting
        .slice(-6)
        .map((m) => ({
          role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
          content: m.text,
        }));

      // Call hybrid AI (async — may hit live LLM or scripted)
      const { text: aiText, emotion, xp } = await getAIResponse(trimmed, historySnapshot);

      // Small minimum delay so it doesn't feel instant (UX)
      await new Promise((r) => setTimeout(r, 600));

      const aiMsg: Message = { role: "ai", text: aiText, id: currentId + 1 };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setByteEmotion(emotion);
      setByteMessage(undefined);

      // Award XP
      if (student.isLoggedIn) {
        student.earnXP("m0", "yr3-4", "chat", xp);
      }
      setTotalXpEarned((x) => x + xp);
    },
    [isTyping, msgCounter, messages, student]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      {/* Student login modal */}
      {!student.isLoggedIn && (
        <StudentLogin
          onLogin={student.login}
          isLoading={student.isLoading}
          error={student.loginError}
        />
      )}

      {/* Byte fixed lower-left on desktop */}
      {student.isLoggedIn && (
        <div className="fixed bottom-6 left-4 z-40 hidden lg:block">
          <Byte emotion={byteEmotion} message={byteMessage} size={80} />
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
          <span className="text-4xl">👋</span>
          <div>
            <p className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">
              Module 0 — Preamble
            </p>
            <h1 className="text-3xl font-bold text-white">Meet AI</h1>
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          Before we learn <em>how</em> AI works, let&apos;s actually{" "}
          <strong className="text-white">talk to one</strong>. Ask Byte&apos;s brain anything
          — then explore the modules to find out how it answers!
        </p>
        <div className="mt-3">
          <SpeakButton
            text="Before we learn how AI works, let's actually talk to one. Ask Byte's brain anything — then explore the modules to find out how it answers!"
            theme="blue"
          />
        </div>
      </motion.div>

      {/* XP Bar */}
      {student.isLoggedIn && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <XPBar xp={student.xp} previousXp={student.previousXp} />
        </motion.div>
      )}

      {/* Badges row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 mb-8 items-start"
      >
        <div className="flex flex-col items-center gap-1">
          <FirstConvoBadge earned={badge1} />
          {!badge1 && <p className="text-xs text-gray-600 text-center max-w-[7rem]">Chat 3 times to unlock</p>}
        </div>
        <div className="flex flex-col items-center gap-1">
          <ExplorerBadge earned={badge2} />
          {!badge2 && <p className="text-xs text-gray-600 text-center max-w-[7rem]">Ask about AI + chat 5 times</p>}
        </div>
        {totalXpEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto flex flex-col items-center justify-center bg-gray-900 border border-gray-700 rounded-xl p-3 min-w-[80px]"
          >
            <span className="text-2xl font-bold text-cyan-400">+{totalXpEarned}</span>
            <span className="text-xs text-gray-500">XP this session</span>
          </motion.div>
        )}
      </motion.div>

      {/* Chat window */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        {/* Byte header bar */}
        <div className="flex items-center gap-3 bg-gray-900 border border-cyan-900 rounded-t-xl px-4 py-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Byte emotion={byteEmotion} size={36} />
          </div>
          <div>
            <p className="text-sm font-bold text-cyan-300">Byte AI</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-500">Online — ready to chat</span>
            </div>
          </div>
          <div className="ml-auto text-xs text-gray-600 italic">
            Powered by Discite AI
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="bg-gray-950 border-x border-gray-800 h-[360px] overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs shrink-0 mt-1">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none"
                    : "bg-cyan-700 text-white rounded-tr-none"
                }`}
              >
                {/* Render **bold** markdown */}
                {msg.text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                  ) : part.startsWith("*") && part.endsWith("*") ? (
                    <em key={i}>{part.slice(1, -1)}</em>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
                {/* Speak button on AI messages */}
                {msg.role === "ai" && (
                  <div className="mt-1.5">
                    <SpeakButton
                      text={msg.text.replace(/\*\*/g, "").replace(/\*/g, "")}
                      theme="blue"
                      size="xs"
                    />
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-cyan-800 border border-cyan-600 flex items-center justify-center text-xs shrink-0 mt-1">
                  🧑
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-2 justify-start"
              >
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs shrink-0">
                  🤖
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-cyan-500"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 border-t-0 rounded-b-xl px-3 py-3 flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask Byte AI anything…"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors disabled:opacity-50"
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isTyping}
            whileTap={{ scale: 0.95 }}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Send
          </motion.button>
        </form>
      </motion.div>

      {/* Conversation starters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <p className="text-xs text-gray-600 mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={isTyping}
              className="text-xs bg-gray-800 border border-gray-700 hover:border-cyan-700 hover:text-cyan-300 text-gray-400 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* "What just happened?" explainer */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">⚡ What just happened?</h2>
          <SpeakButton
            text="What just happened? When you typed your message, the AI went through four steps. Step 1: Tokenisation. It chopped your words into tiny pieces called tokens. Step 2: Embeddings. Each token became a list of numbers that captures its meaning. Step 3: Attention. It figured out which words were most important to understand your question. Step 4: Prediction. It chose the best words to reply with, one at a time. Every module in Discite AI explores one of these steps."
            theme="blue"
            size="xs"
          />
        </div>
        <p className="text-gray-400 text-sm mb-4">
          When you typed your message, the AI went through four steps in milliseconds:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "🔤", step: "1", title: "Tokenisation", desc: "It chopped your words into tiny pieces called tokens.", link: "/modules/m1", color: "border-blue-800 bg-blue-950/40" },
            { icon: "🗺️", step: "2", title: "Embeddings", desc: "Each token became a list of numbers that captures its meaning.", link: "/modules/m2", color: "border-purple-800 bg-purple-950/40" },
            { icon: "🔦", step: "3", title: "Attention", desc: "It figured out which words were most important to understand your question.", link: "/modules/m3", color: "border-pink-800 bg-pink-950/40" },
            { icon: "🎯", step: "4", title: "Prediction", desc: "It chose the best words to reply with, one at a time.", link: "/modules/m5", color: "border-green-800 bg-green-950/40" },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.link}
              className={`rounded-xl border p-4 flex gap-3 hover:opacity-90 transition-opacity ${item.color}`}
            >
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Step {item.step}</p>
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                <p className="text-xs text-blue-400 mt-1">Explore Module {item.step} →</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Key takeaways */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">What you&apos;ve learned</h2>
          <SpeakButton
            text="What you've learned. AI can understand and reply to natural language. It works by following four steps: tokenisation, embeddings, attention, and prediction. AI is not magic — it's clever maths and a lot of training data. You can talk to AI, question it, and learn from it — but always think critically about its answers."
            theme="green"
            size="xs"
          />
        </div>
        <ul className="space-y-3">
          {[
            "AI can understand and reply to natural language",
            "It works by following four steps: tokenisation, embeddings, attention, and prediction",
            "AI is not magic — it's clever maths and a lot of training data",
            "You can talk to AI, question it, and learn from it — but always think critically about its answers",
          ].map((point, i) => (
            <li key={i} className="flex gap-3 text-gray-300">
              <span className="text-cyan-400 mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500">Module 0 of 6 — Start here!</span>
          <Link href="/modules/m1" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            Next: M1 Tokenisation →
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
