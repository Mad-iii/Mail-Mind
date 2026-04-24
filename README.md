# Mailmind — AI Email Assistant

AI-powered email summaries and classification. Sign in with Google, ask in plain English, get instant insights about your inbox.

## Stack

- **Next.js 14** — frontend + API routes (no separate backend needed)
- **NextAuth.js** — Google OAuth (handles login + Gmail token securely)
- **Gmail API** — fetches real emails using the user's OAuth token
- **Groq + LLaMA 3.3** — AI agents for orchestration, summarization, classification
- **Vercel** — deployment (free tier works)

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/email-assistant.git
cd email-assistant
npm install
```

### 2. Set up Google OAuth + Gmail API

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. "Mailmind")
3. Go to **APIs & Services → Library** → enable **Gmail API**
4. Go to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - Fill in app name, support email
   - Add scope: `https://www.googleapis.com/auth/gmail.readonly`
   - Add your email as a test user
5. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local)
     - `https://YOUR_APP.vercel.app/api/auth/callback/google` (for production)
6. Copy the **Client ID** and **Client Secret**

### 3. Create your .env.local

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GROQ_API_KEY=your_groq_api_key
```

Get your Groq key at [console.groq.com](https://console.groq.com)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/email-assistant.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Go to **Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NEXTAUTH_SECRET` | your random secret (same as local) |
| `NEXTAUTH_URL` | `https://YOUR_APP.vercel.app` |
| `GOOGLE_CLIENT_ID` | your Google client ID |
| `GOOGLE_CLIENT_SECRET` | your Google client secret |
| `GROQ_API_KEY` | your Groq API key |

4. Click **Deploy**

### 3. Update Google OAuth redirect URI

Back in Google Cloud Console → Credentials → your OAuth client:
- Add `https://YOUR_APP.vercel.app/api/auth/callback/google` to Authorized redirect URIs

---

## How it works

```
User types a query
      ↓
Orchestrator Agent (Groq) → returns JSON plan
      ↓
Gmail API fetches emails using user's OAuth token  ← runs server-side, token never exposed
      ↓
Summarizer Agent (Groq) → 2-3 sentence summaries
Classifier Agent (Groq) → category + priority tags
      ↓
Results rendered in UI
```

**Security model:**
- Google OAuth tokens are stored server-side in the NextAuth JWT (encrypted with NEXTAUTH_SECRET)
- Groq API key lives only in Vercel environment variables — never sent to the browser
- Gmail access is read-only — emails are processed in memory and never stored

---

## Project structure

```
src/
  app/
    page.tsx                    # Main dashboard
    login/page.tsx              # Login page
    globals.css                 # Global styles
    layout.tsx                  # Root layout + fonts
    api/
      auth/[...nextauth]/       # NextAuth Google OAuth handler
      summarize/route.ts        # Main pipeline API route
  components/
    Providers.tsx               # SessionProvider wrapper
    EmailCard.tsx               # Email result card
    ClassificationBadge.tsx     # Category + priority badges
  lib/
    gmail.ts                    # Gmail API fetcher (server-side)
    agents.ts                   # Groq AI agents (server-side)
  types/
    next-auth.d.ts              # Session type extension
```
