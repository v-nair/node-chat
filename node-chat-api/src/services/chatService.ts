import OpenAI from "openai"
import { MAX_HISTORY, MODEL, SYSTEM_PROMPT } from "../config.js"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const sessions: Record<string, OpenAI.Chat.ChatCompletionMessageParam[]> = {}

function getOrCreateSession(
  sessionId: string
): OpenAI.Chat.ChatCompletionMessageParam[] {
  if (!sessions[sessionId]) {
    sessions[sessionId] = [{ role: "system", content: SYSTEM_PROMPT }]
  }
  return sessions[sessionId]
}

/**
 * Append ``message`` to the session history, call GPT-4o, and return the reply.
 *
 * Trims the history to ``[systemMessage, ...last MAX_HISTORY turns]`` when it
 * grows beyond the configured limit, keeping the system prompt at index 0.
 *
 * @throws {Error} Propagates any OpenAI SDK error to the caller.
 */
export async function sendMessage(
  sessionId: string,
  message: string
): Promise<string> {
  const history = getOrCreateSession(sessionId)
  history.push({ role: "user", content: message })

  if (history.length > MAX_HISTORY + 1) {
    sessions[sessionId] = [history[0], ...history.slice(-MAX_HISTORY)]
  }

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: sessions[sessionId],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const reply = response.choices[0].message.content ?? ""
  sessions[sessionId].push({ role: "assistant", content: reply })
  console.log(`[chatService] session=${sessionId} messages=${sessions[sessionId].length}`)
  return reply
}

/**
 * Delete the conversation history for ``sessionId``.
 *
 * @returns ``true`` if the session existed and was removed, ``false`` otherwise.
 */
export function clearSession(sessionId: string): boolean {
  if (!sessions[sessionId]) return false
  delete sessions[sessionId]
  return true
}
