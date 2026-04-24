import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { fetchGmailEmails } from "@/lib/gmail"
import { orchestrate, summarizeEmails, classifyEmails } from "@/lib/agents"

export async function POST(req: NextRequest) {
  // 1. Auth check — user must be signed in
  const session = await getServerSession(authOptions)
  if (!session?.access_token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { query } = await req.json()
  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  try {
    // 2. Orchestrator decides what to fetch and what to do
    const plan = await orchestrate(query)

    // 3. Fetch emails from Gmail using the user's OAuth token
    const emails = await fetchGmailEmails(session.access_token, {
      type: plan.fetch.type,
      value: plan.fetch.value ?? undefined,
      count: plan.fetch.count,
    })

    if (emails.length === 0) {
      return NextResponse.json({ emails: [], summaries: [], classifications: [], plan })
    }

    // 4. Run summarize and/or classify in parallel
    const [summaries, classifications] = await Promise.all([
      plan.actions.includes("summarize") ? summarizeEmails(emails) : Promise.resolve([]),
      plan.actions.includes("classify") ? classifyEmails(emails) : Promise.resolve([]),
    ])

    return NextResponse.json({ emails, summaries, classifications, plan })
  } catch (err: any) {
    console.error("Pipeline error:", err)
    return NextResponse.json({ error: err.message ?? "Something went wrong" }, { status: 500 })
  }
}
