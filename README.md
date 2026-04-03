# English Coach Telegram Bot — Setup Guide

A personal Telegram bot that uses Claude as your English coach.
Every message you send is treated as an English coaching request.

---

## What you need (takes ~20 minutes total)

1. A Telegram account
2. A Claude API key
3. A free Railway account for hosting

---

## Step 1 — Create your Telegram Bot (2 min)

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name: e.g. `My English Coach`
4. Choose a username: e.g. `myenglishcoach_bot` (must end in `bot`)
5. BotFather will give you a **token** like:
   `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`
6. Save this token — you'll need it in Step 3

---

## Step 2 — Get your Claude API Key (2 min)

1. Go to **https://console.anthropic.com**
2. Sign in or create an account
3. Go to **API Keys** → **Create Key**
4. Copy and save the key

---

## Step 3 — Deploy to Railway (10 min)

Railway is a free hosting platform. No credit card needed for the free tier.

1. Go to **https://railway.app** and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
   - If you don't want to use GitHub, click **Empty Project** → **Add Service** → **Empty Service**
3. In the service settings, go to **Variables** and add:
   - `TELEGRAM_TOKEN` = your token from Step 1
   - `ANTHROPIC_API_KEY` = your key from Step 2
4. Go to **Settings** → **Networking** → **Generate Domain**
   - Copy the domain URL, e.g. `https://english-coach-bot.up.railway.app`
5. Upload or paste the code files (index.js, package.json) into the service

---

## Step 4 — Register the Webhook (2 min)

This tells Telegram to send your messages to your bot server.

Open your browser and go to this URL (replace the placeholders):

```
https://api.telegram.org/bot<YOUR_TELEGRAM_TOKEN>/setWebhook?url=https://<YOUR_RAILWAY_DOMAIN>/webhook
```

Example:
```
https://api.telegram.org/bot123456789:ABCdef/setWebhook?url=https://english-coach-bot.up.railway.app/webhook
```

You should see: `{"ok":true,"result":true}`

---

## Step 5 — Test it!

1. Open Telegram
2. Search for your bot by its username
3. Send `/start`
4. Send any English sentence and get coaching!

---

## Commands available in the bot

| Command | What it does |
|---|---|
| `/start` | Welcome message |
| `/reset` | Clear conversation history |
| `natural?` | Evaluate naturalness |
| `professionalize` | Rewrite formally |
| `casualize` | Rewrite casually |
| `compare` | Compare similar expressions |
| `drill` | Focused practice set |
| `quiz me` | Test in Korean, answer in English |
| `daily review` | Recent weak points |
| `weekly review` | Recurring patterns |
| `what am I missing?` | Identify blind spots |

---

## Troubleshooting

**Bot doesn't respond:**
- Check that your webhook URL is correct
- Make sure both environment variables are set in Railway
- Check Railway logs for errors

**"Something went wrong" message:**
- Usually means the API key is wrong or has no credits
- Check https://console.anthropic.com for usage/billing

---

## Notes

- The bot remembers the last 20 messages in each conversation for context
- Use `/reset` to start a fresh conversation anytime
- The bot only works in direct messages (not groups) by default
