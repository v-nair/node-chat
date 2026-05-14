# node-chat-api

Express + TypeScript backend for the [Node Chat](../README.md) project. Implements the same chat-with-session-memory pattern as Project 1, in Node.js.

## Relationship to Other Services

| Service | Direction | Description |
| --- | --- | --- |
| `node-chat-ui` | ← receives requests | UI sends `POST /chat` with `session_id` + `message` |
| OpenAI API | → calls | Node.js `openai` SDK, `chat.completions.create` |

## Service Structure

```text
src/
├── app.ts                  # Express app, CORS, Zod validation, route handlers, error middleware
├── config.ts               # MODEL, MAX_HISTORY, SYSTEM_PROMPT constants
└── services/
    └── chatService.ts      # Session store, history trimming, OpenAI calls
```

## Configuration

| Constant | Value | Purpose |
| --- | --- | --- |
| `MODEL` | `gpt-4o` | OpenAI chat model |
| `MAX_HISTORY` | `20` | Max turns kept per session |
| `SYSTEM_PROMPT` | `"You are a helpful assistant."` | System instruction |

## Starting This Service

```bash
cp .env.example .env   # add OPENAI_API_KEY
docker compose up --build
```

Runs on `http://localhost:3001` (host) → port 3000 inside container.

Dev uses `tsx watch` for hot-reload without a build step.

## Logic — Pseudocode

```text
FUNCTION sendMessage(session_id, message):

    IF sessions[session_id] is undefined:
        sessions[session_id] = [{ role: "system", content: SYSTEM_PROMPT }]

    sessions[session_id].push({ role: "user", content: message })

    IF sessions[session_id].length > MAX_HISTORY + 1:
        sessions[session_id] = [sessions[session_id][0], ...last MAX_HISTORY]

    response = openai.chat.completions.create({
        model: MODEL,
        messages: sessions[session_id],
    })

    reply = response.choices[0].message.content
    sessions[session_id].push({ role: "assistant", content: reply })
    RETURN reply


FUNCTION clearSession(session_id):
    IF !sessions[session_id]: RETURN false
    DELETE sessions[session_id]
    RETURN true
```

## Python vs Node.js

| Concept | Python version | Node.js version |
| --- | --- | --- |
| Validation | `@field_validator` | `z.object().safeParse()` |
| 422 error | Pydantic auto | Manual `flatten().fieldErrors` |
| Async | `async def` | `async function` |
| Type safety | Type hints (runtime ignored) | TypeScript (compile-time enforced) |
| Session dict | `dict[str, list[dict]]` | `Record<string, MessageParam[]>` |
