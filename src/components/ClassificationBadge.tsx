"use client"

const CATEGORY_COLORS: Record<string, string> = {
  Meeting:    "#3b8bd4",
  Billing:    "#c8f060",
  Support:    "#ffb830",
  Newsletter: "#888880",
  Alert:      "#ff5c5c",
  Personal:   "#b794f4",
  Work:       "#4caf80",
  Spam:       "#444440",
  Other:      "#555550",
}

const PRIORITY_COLORS: Record<string, string> = {
  high:   "#ff5c5c",
  medium: "#ffb830",
  low:    "#4caf80",
}

const PRIORITY_DOTS: Record<string, string> = {
  high: "🔴", medium: "🟡", low: "🟢"
}

interface Props {
  category: string
  priority: string
}

export function ClassificationBadge({ category, priority }: Props) {
  const catColor = CATEGORY_COLORS[category] ?? "#555"
  const priColor = PRIORITY_COLORS[priority] ?? "#555"

  return (
    <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
      <span style={{
        padding: "0.15rem 0.5rem",
        borderRadius: "3px",
        fontSize: "10px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontWeight: 500,
        background: catColor + "18",
        color: catColor,
        border: `1px solid ${catColor}44`,
      }}>
        {category}
      </span>
      <span style={{
        padding: "0.15rem 0.5rem",
        borderRadius: "3px",
        fontSize: "10px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontWeight: 500,
        background: priColor + "18",
        color: priColor,
        border: `1px solid ${priColor}44`,
      }}>
        {PRIORITY_DOTS[priority]} {priority}
      </span>
    </div>
  )
}
