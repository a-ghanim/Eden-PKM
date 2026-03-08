# Eden

AI-powered personal knowledge management — capture, connect, and resurface your saved content.

<!-- ![Eden Screenshot](screenshot.png) -->

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, D3.js
- **Backend:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** Anthropic Claude API (summaries, tagging, connections, chat)
- **Auth:** Passport.js with local strategy (email/password)

## Features

- **One-click capture** — save any URL with automatic content extraction
- **AI analysis** — auto-generated summaries, smart tags, and concept extraction
- **Knowledge connections** — AI discovers relationships between saved items
- **Semantic search** — find content by meaning, not just keywords
- **Interactive knowledge graph** — visualize how your ideas connect (D3.js)
- **Batch import** — import multiple URLs or browser bookmark files at once
- **File upload** — ingest PDFs, HTML, Markdown, and text files
- **AI chat** — ask questions about your saved knowledge base
- **Bookmarklet** — save pages from any browser with one click
- **Dark/light theme** — full theme support

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
git clone https://github.com/a-ghanim/Eden-PKM.git
cd Eden-PKM
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Push the database schema:

```bash
npm run db:push
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000), create an account, and start saving.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for session encryption (generate with `openssl rand -hex 32`) |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI features |
| `PORT` | Server port (default: `5000`) |

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── assets/      # Static assets (images)
│   │   ├── components/  # UI components + shadcn/ui
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities, store, query client
│   │   └── pages/       # Route pages
│   └── index.html
├── server/              # Express backend
│   ├── auth/            # Authentication (passport-local)
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage layer
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   ├── models/          # Database models (Drizzle)
│   └── schema.ts        # Zod schemas
└── script/              # Build scripts
```

## License

MIT
