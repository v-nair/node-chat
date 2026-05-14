# node-chat-ui

React frontend for the [Node Chat](../README.md) project. Same chat bubble interface as Project 1, pointing to the Node.js/Express backend on port 3001.

## Relationship to Other Services

| Service | Direction | Description |
| --- | --- | --- |
| `node-chat-api` | → calls | Sends `POST /chat` with `session_id` + `message`, receives `reply` |

## Service Structure

```text
src/
├── main.jsx     # React entry point
├── index.css    # Light theme, typing animation
└── App.jsx      # Chat bubbles, clear button, Node.js badge in header
```

## Starting This Service

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` — requires `node-chat-api` on port 3001.

## Logic — Pseudocode

```text
ON send:
    messages.push({ role: "user", content: text })
    SET loading = true

    { reply } = POST http://localhost:3001/chat { session_id, message }

    messages.push({ role: "assistant", content: reply })
    SET loading = false

ON clear:
    DELETE http://localhost:3001/chat/{session_id}
    messages = []
```

## Design Notes

- **Light theme** — deliberately different from the dark voice/code projects to be visually distinct
- **Clear button** — calls `DELETE /chat/:session_id` to reset server-side history too, not just the UI
- **Node.js badge** — header badge "Express · TypeScript · GPT-4o" makes the tech stack visible
