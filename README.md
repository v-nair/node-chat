# Node Chat

The same conversational AI from Project 1 — rebuilt in Node.js with TypeScript, Express, and Zod. Shows how the same architecture translates across Python and JavaScript ecosystems.

## Architecture

```text
React UI (Vite)        Express + TypeScript            OpenAI
     │                         │                         │
     │  POST /chat             │                         │
     │ ──────────────────────► │                         │
     │  {session_id, message}  │  chat.completions       │
     │                         │ ──────────────────────► │
     │                         │  GPT-4o response        │
     │  {reply, session_id}    │ ◄────────────────────── │
     │ ◄────────────────────── │                         │
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js 20, TypeScript, Express 5 |
| Validation | Zod (equivalent of Pydantic in JS) |
| AI | OpenAI Node.js SDK, GPT-4o |
| Frontend | React 19, Vite |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```text
node-chat/
├── node-chat-api/
│   ├── src/
│   │   ├── app.ts                  # Express app, CORS, Zod validation, routes
│   │   ├── config.ts               # MODEL, MAX_HISTORY, SYSTEM_PROMPT
│   │   └── services/
│   │       └── chatService.ts      # Session store, history trimming, OpenAI calls
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── docker-compose.yml
└── node-chat-ui/
    └── src/
        └── App.jsx                 # Chat bubble UI — same pattern, points to port 3001
```

## Running Locally

**Prerequisites:** Docker, Node.js, OpenAI API key

**Backend:**

```bash
cd node-chat-api
cp .env.example .env   # add OPENAI_API_KEY
docker compose up --build
```

**Frontend:**

```bash
cd node-chat-ui
npm install
npm run dev
```

| Service | URL |
| --- | --- |
| API | <http://localhost:3001> |
| UI | <http://localhost:5173> |

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health check |
| `POST` | `/chat` | Send a message, receive a reply |
| `DELETE` | `/chat/:session_id` | Clear a session's history |

**POST /chat — request:**

```json
{
  "session_id": "user-abc123",
  "message": "What is the capital of France?"
}
```

**POST /chat — response:**

```json
{
  "reply": "The capital of France is Paris.",
  "session_id": "user-abc123"
}
```

## Python vs Node.js Comparison

| Concept | Python (Project 1) | Node.js (Project 7) |
| --- | --- | --- |
| Framework | FastAPI | Express 5 |
| Validation | Pydantic `BaseModel` | Zod `z.object()` |
| Type system | Python type hints | TypeScript |
| Async | `async def` / `await` | `async` / `await` |
| Error handling | `HTTPException` | `res.status(N).json()` |
| Session store | `dict[str, list]` | `Record<string, array>` |
| AI SDK | `openai` PyPI | `openai` npm |

## What This Demonstrates

- **TypeScript** — strict types, interfaces from OpenAI SDK, `Record<>` session store
- **Express 5** — routing, JSON body parsing, error middleware
- **Zod** — schema validation with `.safeParse()`, equivalent to Pydantic's `field_validator`
- **Node.js ecosystem** — `npm`, `tsx` for dev hot-reload, `tsconfig.json`
- **Same pattern, different runtime** — demonstrates language-agnostic API design
