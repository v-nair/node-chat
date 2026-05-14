import "dotenv/config"
import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import { z } from "zod"
import { clearSession, sendMessage } from "./services/chatService.js"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables")
}

const app = express()
app.use(cors())
app.use(express.json())

const ChatRequestSchema = z.object({
  session_id: z.string().min(1, "session_id must not be empty"),
  message: z.string().min(1, "message must not be empty"),
})

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "node-chat-api is running" })
})

app.post("/chat", async (req: Request, res: Response) => {
  const parsed = ChatRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.flatten().fieldErrors })
    return
  }
  const { session_id, message } = parsed.data
  try {
    const reply = await sendMessage(session_id, message)
    res.json({ reply, session_id })
  } catch {
    res.status(502).json({ error: "AI service unavailable" })
  }
})

app.delete("/chat/:session_id", (req: Request, res: Response) => {
  const cleared = clearSession(req.params.session_id)
  if (!cleared) {
    res.status(404).json({ error: "Session not found" })
    return
  }
  res.json({ status: "session cleared", session_id: req.params.session_id })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`node-chat-api running on port ${PORT}`)
})
