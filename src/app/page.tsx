"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { EmailCard } from "@/components/EmailCard"
import { ClassificationBadge } from "@/components/ClassificationBadge"

interface Summary {
  id: string; from: string; date: string; subject: string; summary: string
}
interface Classification {
  id: string; subject: string; category: string; priority: string; reason: string
}
interface Plan {
  fetch: { type: string; value: string | null; count: number }
  actions: string[]
}

const SUGGESTIONS = [
  "Show my last 5 emails",
  "Find emails from my boss",
  "Search for billing emails and classify them",
  "Summarize and tag my latest 3 emails",
  "Any emails about meetings?",
]

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [classifications, setClassifications] = useState<Classification[]>([])
  const [plan, setPlan] = useState<Plan | null>(null)
  const [hasResults, setHasResults] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "20px", height: "20px", border: "1.5px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%" }} className="animate-spin-slow" />
      </div>
    )
  }

  const handleSubmit = async (q?: string) => {
    const finalQuery = q ?? query
    if (!finalQuery.trim() || loading) return

    setLoading(true)
    setError("")
    setSummaries([])
    setClassifications([])
    setPlan(null)
    setHasResults(false)

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery }),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error ?? "Something went wrong"); return }
      if (data.summaries.length === 0 && data.classifications.length === 0) {
        setError("No emails found matching your request.")
        return
      }

      setSummaries(data.summaries)
      setClassifications(data.classifications)
      setPlan(data.plan)
      setHasResults(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Merge summaries + classifications by ID
  const emailIds = Array.from(new Set([
    ...summaries.map(s => s.id),
    ...classifications.map(c => c.id),
  ]))

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 2rem",
        height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "var(--bg)", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ color: "var(--accent)", fontSize: "16px" }}>✦</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Mailmind</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--text-secondary)",
            padding: "0.3rem 0.75rem", borderRadius: "3px", cursor: "pointer",
            fontFamily: "var(--font-body)", fontSize: "12px",
            transition: "all 0.15s",
          }}>Sign out</button>
        </div>
      </header>

      <main style={{ maxWidth: "780px", margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Hero text */}
        {!hasResults && (
          <div className="animate-fade-up" style={{ marginBottom: "2.5rem" }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "2.2rem",
              fontWeight: 400, letterSpacing: "-0.02em",
              color: "var(--text-primary)", lineHeight: 1.1, marginBottom: "0.75rem",
            }}>
              What do you want to know<br />
              <span style={{ color: "var(--accent)" }}>about your inbox?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Ask in plain English — AI fetches, summarizes, and classifies your emails.
            </p>
          </div>
        )}

        {/* Search bar */}
        <div style={{
          display: "flex", gap: "0.5rem", marginBottom: "1rem",
          border: "1px solid var(--border-light)",
          borderRadius: "6px", padding: "0.5rem",
          background: "var(--bg-card)",
          transition: "border-color 0.15s",
        }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. 'Find emails from Alice and classify them'"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--text-primary)", fontFamily: "var(--font-body)",
              fontSize: "13px", padding: "0.25rem 0.5rem",
            }}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !query.trim()}
            style={{
              background: loading || !query.trim() ? "var(--bg-hover)" : "var(--accent)",
              color: loading || !query.trim() ? "var(--text-secondary)" : "#0a0a0a",
              border: "none", borderRadius: "4px",
              padding: "0.5rem 1.25rem", cursor: loading || !query.trim() ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500,
              letterSpacing: "0.03em", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: "0.5rem",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? (
              <>
                <span style={{ width: "12px", height: "12px", border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} className="animate-spin-slow" />
                Processing
              </>
            ) : "Run →"}
          </button>
        </div>

        {/* Suggestions */}
        {!hasResults && !loading && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "2.5rem" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); handleSubmit(s) }} style={{
                background: "none", border: "1px solid var(--border)", borderRadius: "3px",
                color: "var(--text-secondary)", padding: "0.3rem 0.65rem",
                fontFamily: "var(--font-body)", fontSize: "11px", cursor: "pointer",
                transition: "all 0.15s", letterSpacing: "0.02em",
              }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: "0.75rem 1rem", border: "1px solid #ff5c5c33",
            borderLeft: "3px solid var(--high)", borderRadius: "4px",
            color: "#ff9999", fontSize: "13px", marginBottom: "1.5rem",
            background: "#1a0808",
          }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ padding: "2rem 0" }}>
            {["🧠 Orchestrator analyzing request...", "📥 Fetching emails from Gmail...", "✦ Running AI agents..."].map((s, i) => (
              <div key={s} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                color: "var(--text-secondary)", fontSize: "13px",
                marginBottom: "0.5rem",
                animation: `fadeUp 0.3s ease ${i * 0.15}s both`,
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite` }} />
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Plan badge */}
        {plan && hasResults && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            marginBottom: "1.5rem", flexWrap: "wrap",
          }}>
            <span style={{ color: "var(--text-muted)", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Plan</span>
            <span style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-dim)", padding: "0.15rem 0.5rem", borderRadius: "3px", fontSize: "11px" }}>
              {plan.fetch.type} {plan.fetch.value ? `· "${plan.fetch.value}"` : `· ${plan.fetch.count} emails`}
            </span>
            {plan.actions.map(a => (
              <span key={a} style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)", padding: "0.15rem 0.5rem", borderRadius: "3px", fontSize: "11px" }}>
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Results */}
        {hasResults && emailIds.map((id, i) => {
          const summary = summaries.find(s => s.id === id)
          const classification = classifications.find(c => c.id === id)
          return (
            <div key={id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <EmailCard summary={summary} classification={classification} />
            </div>
          )
        })}

        {/* New search button */}
        {hasResults && (
          <button onClick={() => { setHasResults(false); setSummaries([]); setClassifications([]); setQuery(""); setPlan(null) }}
            style={{
              marginTop: "2rem", background: "none", border: "1px solid var(--border)",
              color: "var(--text-secondary)", padding: "0.5rem 1rem", borderRadius: "4px",
              cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "12px",
              transition: "all 0.15s",
            }}>
            ← New search
          </button>
        )}
      </main>
    </div>
  )
}
