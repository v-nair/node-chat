import { useEffect, useRef, useState } from "react"

const API_URL = "http://localhost:3001"
const SESSION_ID = `session-${Math.random().toString(36).slice(2, 10)}`

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setError("")
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, message: text }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const { reply } = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (e) {
      setError(e.message || "Connection error. Is the API running on port 3001?")
    } finally {
      setLoading(false)
    }
  }

  const clearChat = async () => {
    await fetch(`${API_URL}/chat/${SESSION_ID}`, { method: "DELETE" }).catch(() => {})
    setMessages([])
    setError("")
  }

  return (
    <div style={s.layout}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <h1 style={s.title}>Node Chat</h1>
          <div style={s.headerRight}>
            <span style={s.badge}>Express · TypeScript · GPT-4o</span>
            <button onClick={clearChat} style={s.clearBtn}>Clear</button>
          </div>
        </div>
      </header>

      <div style={s.messages}>
        {messages.length === 0 && !loading && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>💬</div>
            <p style={s.emptyText}>Same AI chat — different backend. This API is Node.js + Express + TypeScript.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ ...s.row, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ ...s.bubble, ...(m.role === "user" ? s.userBubble : s.aiBubble) }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ ...s.row, justifyContent: "flex-start" }}>
            <div style={{ ...s.bubble, ...s.aiBubble }}>
              <span className="typing" style={{ color: "#94a3b8" }}>Thinking</span>
            </div>
          </div>
        )}
        {error && (
          <div style={s.errorRow}>
            <div style={s.errorBubble}>{error}</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={s.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Message…"
          style={s.input}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            ...s.sendBtn,
            background: input.trim() && !loading ? "#3b82f6" : "#e2e8f0",
            color: input.trim() && !loading ? "#fff" : "#94a3b8",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}

const s = {
  layout: { display: "flex", flexDirection: "column", height: "100dvh", maxWidth: 680, margin: "0 auto" },
  header: { background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 },
  headerInner: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" },
  title: { fontSize: 18, fontWeight: 700, margin: 0, color: "#1a202c" },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  badge: { fontSize: 11, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 10px", fontWeight: 500 },
  clearBtn: { fontSize: 12, background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#64748b" },
  messages: { flex: 1, overflowY: "auto", padding: "16px 16px", display: "flex", flexDirection: "column", gap: 10 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10, paddingTop: 60 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center", maxWidth: 300, lineHeight: 1.6 },
  row: { display: "flex" },
  bubble: { maxWidth: "75%", padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.6 },
  userBubble: { background: "#3b82f6", color: "#fff", borderBottomRightRadius: 4 },
  aiBubble: { background: "#fff", color: "#1a202c", borderBottomLeftRadius: 4, border: "1px solid #e2e8f0" },
  errorRow: { display: "flex", justifyContent: "center" },
  errorBubble: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 14px", color: "#dc2626", fontSize: 13 },
  inputArea: { display: "flex", gap: 8, padding: "12px 16px", background: "#fff", borderTop: "1px solid #e2e8f0", flexShrink: 0 },
  input: { flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", color: "#1a202c", background: "#f8fafc" },
  sendBtn: { width: 40, height: 40, borderRadius: "50%", border: "none", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
}
