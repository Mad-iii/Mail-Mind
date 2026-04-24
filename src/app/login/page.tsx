"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    await signIn("google", { callbackUrl: "/" })
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Accent glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "300px",
        background: "radial-gradient(ellipse, rgba(200,240,96,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="animate-fade-up" style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "2.5rem", maxWidth: "400px", width: "100%",
      }}>
        {/* Logo mark */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "52px", height: "52px", margin: "0 auto 1.5rem",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent)", fontSize: "22px",
          }}>✦</div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.8rem", fontWeight: 400,
            color: "var(--text-primary)",
            lineHeight: 1, marginBottom: "0.75rem",
            letterSpacing: "-0.02em",
          }}>Mailmind</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.7 }}>
            AI-powered email summaries and classification.<br />
            Your inbox, understood at a glance.
          </p>
        </div>

        {/* Sign in card */}
        <div style={{
          width: "100%", padding: "2rem",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          background: "var(--bg-card)",
        }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "1.25rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Connect your account
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              width: "100%", padding: "0.85rem 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
              background: loading ? "var(--bg-hover)" : "var(--accent)",
              color: loading ? "var(--text-secondary)" : "#0a0a0a",
              border: "none", borderRadius: "4px",
              fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              letterSpacing: "0.02em",
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "14px", height: "14px", border: "1.5px solid currentColor",
                  borderTopColor: "transparent", borderRadius: "50%",
                  display: "inline-block",
                }} className="animate-spin-slow" />
                Connecting...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          <p style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "1rem", lineHeight: 1.6 }}>
            We request read-only Gmail access. Your emails are never stored — processed in real time and discarded.
          </p>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
          Works with Gmail accounts only.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
