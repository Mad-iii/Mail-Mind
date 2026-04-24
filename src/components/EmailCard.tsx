"use client"
import { ClassificationBadge } from "./ClassificationBadge"

interface Summary {
  id: string; from: string; date: string; subject: string; summary: string
}
interface Classification {
  id: string; subject: string; category: string; priority: string; reason: string
}

interface Props {
  summary?: Summary
  classification?: Classification
}

export function EmailCard({ summary, classification }: Props) {
  const subject = summary?.subject ?? classification?.subject ?? "Unknown"
  const from = summary?.from ?? ""
  const date = summary?.date ? new Date(summary.date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  }) : ""

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: "6px",
      background: "var(--bg-card)",
      marginBottom: "0.75rem",
      overflow: "hidden",
      transition: "border-color 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-light)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Header */}
      <div style={{
        padding: "0.85rem 1rem",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem",
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "1rem",
            color: "var(--text-primary)", marginBottom: "0.2rem",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {subject}
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {from && <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>{from}</span>}
            {date && <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{date}</span>}
          </div>
        </div>
        {classification && (
          <div style={{ flexShrink: 0, display: "flex", gap: "0.4rem", flexDirection: "column", alignItems: "flex-end" }}>
            <ClassificationBadge category={classification.category} priority={classification.priority} />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "0.85rem 1rem" }}>
        {summary && (
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.7, marginBottom: classification ? "0.75rem" : 0 }}>
            {summary.summary}
          </p>
        )}
        {classification && (
          <p style={{
            color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.6,
            paddingTop: summary ? "0.75rem" : 0,
            borderTop: summary ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ color: "var(--accent-dim)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "10px" }}>Reason · </span>
            {classification.reason}
          </p>
        )}
      </div>
    </div>
  )
}
