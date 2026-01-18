# Eden - Personal Knowledge Management System

## Overview

Eden is an intelligent personal knowledge management (PKM) application designed to solve the "tab overflow" problem. It functions as a "second brain" that captures, organizes, and resurfaces web content using AI-powered analysis. Users can save URLs with one click, and the system automatically extracts content, generates summaries, applies tags, identifies key concepts, and discovers connections between saved items.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

### Design Overhaul
- **Theme**: Dark-first design with near-black background (hsl(0 0% 4%))
- **Branding**: Minimal "eden" text wordmark (Instrument Serif font)
- **Typography**: Instrument Serif for headings, Inter for body text
- **Cards**: Matter-style image-forward bento grid with glassmorphism effects
- **Effects**: Dotted grid backgrounds, floating 3D spheres, glassmorphism panels
- **Knowledge Graph**: 3D force-directed layout with tag-based clusters and liquid blob boundaries
- **Colors**: Muted sage accent (#6b8a7a), subtle borders, soft glows

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: React Context (`EdenProvider`) combined with TanStack Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **Animations**: Framer Motion for UI transitions
- **Data Visualization**: Recharts for the knowledge graph visualization
- **Build Tool**: Vite with path aliases (`@/` for client, `@shared/` for shared code)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful JSON endpoints under `/api/`
- **AI Integration**: Anthropic Claude API for content analysis, summarization, and chat functionality
- **Development Server**: Vite middleware for HMR in development
- **Production Build**: esbuild for server bundling, Vite for client bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains Zod schemas and type definitions
- **Current Storage**: In-memory storage implementation (`MemStorage` class) with demo data seeding
- **Database Ready**: Drizzle configuration exists for PostgreSQL migration when database is provisioned
- **Validation**: Zod schemas with `drizzle-zod` integration for type-safe data handling

### Key Data Models
- **SavedItem**: Core entity for captured content (URL, title, content, summary, tags, concepts, intent, reading progress)
- **Collection**: Groups of related items (auto-generated from tags/concepts)
- **Concept**: Extracted key ideas, people, technologies from content
- **ChatMessage**: Conversation history for AI assistant interactions

### Application Features
- **Universal Capture**: Save URLs with intent classification (read later, reference, inspiration, tutorial)
- **AI Analysis**: Automatic content summarization, tagging, and concept extraction
- **Knowledge Graph**: Visual representation of connections between saved content
- **Smart Collections**: Auto-generated groupings based on shared tags and concepts
- **AI Chat**: Context-aware assistant that can query saved knowledge base
- **Reader Mode**: Focused reading experience with related content suggestions
- **Theme Support**: Light and dark mode with localStorage persistence

## External Dependencies

### AI Services
- **Anthropic Claude API**: Primary AI provider for content analysis and chat
  - Environment variables: `AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`
  - Models used: `claude-sonnet-4-5` for content analysis

### Database
- **PostgreSQL**: Target database (requires `DATABASE_URL` environment variable)
- **connect-pg-simple**: Session storage for PostgreSQL

### Third-Party UI Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Framer Motion**: Animation library
- **Recharts**: Chart visualization
- **Embla Carousel**: Carousel component
- **CMDK**: Command palette component

### Development Tools
- **Replit Plugins**: Dev banner, error overlay, cartographer (Replit-specific integrations)
- **Drizzle Kit**: Database migration tooling (`db:push` script)