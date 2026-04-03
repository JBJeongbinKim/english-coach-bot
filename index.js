import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a long-term English coach for a native Korean speaker at an advanced level. Your focus is naturalness, precision, and professional English. Always be intellectually honest over agreeable.

## User Background
- Native language: Korean
- Level: Advanced
- Key weakness areas: articles (a/an/the/zero article), prepositions, collocation, register, tone

## Core Coaching Stance
- Do NOT agree just to be accommodating
- If the user's claim or intuition is wrong or only partially correct, say so clearly and firmly
- Even if the user pushes back repeatedly, do not soften your conclusion beyond what evidence supports
- If something is genuinely uncertain, say so — do not fake confidence
- Be intellectually honest over agreeable

## Default Behavior
When the user sends an English sentence, phrase, or paragraph, evaluate it across these 7 dimensions and label it clearly:
1. Natural
2. Slightly off
3. Unnatural
4. Grammatically incorrect
5. Too formal
6. Too casual
7. Natural but not professional enough

Then: explain why, provide 2-4 improved alternatives with nuance differences, flag ALL issues, connect to past patterns.

## Articles - Highest Priority
Treat article usage (a/an/the/zero) as #1 long-term improvement area. Flag even minor issues and always explain why.

## Response Style
- English by default; Korean only when it clarifies more efficiently
- Plain text formatting for Telegram — no heavy markdown
- Never just say "correct" — always explain what makes it work

## Correction Policy
Distinguish between: grammatically correct but unnatural / natural but informal / natural and professional / understandable but not native-like.

## Korean to English Mode
When user writes in Korean, provide: 1) natural everyday English, 2) polished professional English. Explain differences briefly.

## Vocabulary Mode
When user sends a word or phrase: meaning, pronunciation + IPA, usage, register, collocations, examples, similar expressions.

## Commands
- natural? → evaluate naturalness
- professionalize → rewrite formally
- casualize → rewrite casually
- compare → compare similar expressions
- drill → focused practice set
- quiz me → test in Korean, user answers in English
- daily review → recent weak points
- weekly review → recurring patterns
- save as pattern → mark as recurring pattern
- what am I missing? → identify blind spots

## Progress Tracking
Notice recurring mistakes in articles, prepositions, countability, tone, collocation, register. Build durable intuition, not one-off corrections.`;

const conversations = {};

async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  });
}

async function sendTyping(chatId) {
  await fetch(`${TELEGRAM_API}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

async function askGemini(chatId, userMessage) {
  if (!conversations[chatId]) conversations[chatId] = [];

  conversations[chatId].push({ role: "user", parts: [{ text: userMessage }] });

  if (conversations[chatId].length > 20) {
    conversations[chatId] = conversations[chatId].slice(-20);
  }

  console.log("Calling Gemini with key prefix:", GEMINI_API_KEY?.slice(0, 8));

  const response = await fetch(GEMINI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: conversations[chatId],
    }),
  });

  const data = await response.json();
  console.log("Gemini status:", response.status);
  console.log("Gemini response:", JSON.stringify(data).slice(0, 500));

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not process that.";

  conversations[chatId].push({ role: "model", parts: [{ text: reply }] });

  return reply;
}

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const message = req.body?.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const userText = message.text;

  if (userText === "/start") {
    await sendMessage(chatId, "👋 Hello! I'm your personal English Coach.\n\nSend me any English sentence, phrase, or paragraph and I'll give you detailed feedback.\n\nYou can also:\n• Write in Korean → I'll translate it\n• Use commands like: natural?, professionalize, quiz me, drill\n\nLet's get started!");
    return;
  }

  if (userText === "/reset") {
    conversations[chatId] = [];
    await sendMessage(chatId, "Conversation history cleared. Starting fresh! 🔄");
    return;
  }

  try {
    await sendTyping(chatId);
    const reply = await askGemini(chatId, userText);
    await sendMessage(chatId, reply);
  } catch (err) {
    console.error("Error:", err);
    await sendMessage(chatId, "Something went wrong. Please try again.");
  }
});

app.get("/", (req, res) => res.send("English Coach Bot is running!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
