import OpenAI from "openai"
import { EmailData } from "./gmail"

// Groq is OpenAI-compatible — we use the openai SDK pointed at Groq's base URL
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
})

const MODEL = "llama-3.3-70b-versatile"

async function chat(systemPrompt: string, userMessage: string): Promise<string> {
  const res = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
  })
  return res.choices[0].message.content ?? ""
}

// ─── Orchestrator ──────────────────────────────────────────────────────────

export interface Plan {
  fetch: {
    type: "recent" | "keyword" | "sender"
    value: string | null
    count: number
  }
  actions: Array<"summarize" | "classify">
}

export async function orchestrate(userInput: string): Promise<Plan> {
  const raw = await chat(
    `You are the orchestrator of an email assistant. Understand the user's request and return ONLY a JSON plan.
Format:
{
  "fetch": { "type": "recent"|"keyword"|"sender", "value": "<string or null>", "count": <number> },
  "actions": ["summarize"] | ["classify"] | ["summarize","classify"]
}
Rules:
- type=recent: user wants latest emails (value=null)
- type=sender: user mentions a specific person (value=their name/email)
- type=keyword: user mentions a topic/subject (value=the keyword)
- count default=5
- actions must have at least one entry
Respond with ONLY the JSON object, no markdown, no explanation.`,
    userInput
  )

  // Strip markdown fences if model adds them
  const cleaned = raw.replace(/```json|```/g, "").trim()
  return JSON.parse(cleaned) as Plan
}

// ─── Summarizer ────────────────────────────────────────────────────────────

export interface EmailSummary {
  id: string
  from: string
  date: string
  subject: string
  summary: string
}

export async function summarizeEmails(emails: EmailData[]): Promise<EmailSummary[]> {
  const results: EmailSummary[] = []

  for (const em of emails) {
    const summary = await chat(
      "You are a concise email summarizer. Given an email, write a 2-3 sentence summary of its body. Return ONLY the summary text, nothing else.",
      `From: ${em.from}\nSubject: ${em.subject}\nBody:\n${em.body}`
    )
    results.push({
      id: em.id,
      from: em.from,
      date: em.date,
      subject: em.subject,
      summary: summary.trim(),
    })
  }

  return results
}

// ─── Classifier ────────────────────────────────────────────────────────────

export type Category = "Meeting" | "Billing" | "Support" | "Newsletter" | "Alert" | "Personal" | "Work" | "Spam" | "Other"
export type Priority = "high" | "medium" | "low"

export interface EmailClassification {
  id: string
  subject: string
  category: Category
  priority: Priority
  reason: string
}

export async function classifyEmails(emails: EmailData[]): Promise<EmailClassification[]> {
  const results: EmailClassification[] = []

  for (const em of emails) {
    const raw = await chat(
      `You classify emails. Return ONLY a JSON object:
{"category": "<one of: Meeting|Billing|Support|Newsletter|Alert|Personal|Work|Spam|Other>", "priority": "<high|medium|low>", "reason": "<one sentence>"}
No markdown, no extra text.`,
      `From: ${em.from}\nSubject: ${em.subject}\nBody:\n${em.body}`
    )
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(cleaned)
      results.push({
        id: em.id,
        subject: em.subject,
        category: parsed.category,
        priority: parsed.priority,
        reason: parsed.reason,
      })
    } catch {
      results.push({
        id: em.id,
        subject: em.subject,
        category: "Other",
        priority: "low",
        reason: "Could not classify.",
      })
    }
  }

  return results
}
