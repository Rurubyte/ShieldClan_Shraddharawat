# NexoPrep

NexoPrep is an AI-powered interview simulation and behavioral analysis platform. This repository now contains the existing React/Vite client plus a production-oriented backend foundation for persistent interview sessions, reports, analytics, realtime events, and future voice or behavioral systems.

## Monorepo Layout

```text
apps/
  server/                 Fastify API and websocket server
packages/
  config/                 Environment validation
  database/               Prisma schema and database client
  events/                 Redis-backed event bus
  shared/                 Errors, ids, validation helpers
  types/                  Shared domain and event contracts
services/
  analytics-service/      Trends, weak areas, communication and emotion metrics
  memory-service/         Redis session and transcript buffers
  report-service/         Score aggregation and report persistence
  session-service/        Session lifecycle and transcript persistence
src/                      Existing frontend application
```

## Backend Stack

- Node.js + TypeScript
- Fastify
- PostgreSQL
- Prisma
- Redis
- Zod
- WebSocket realtime gateway

## Setup

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run dev:server
```

The backend defaults to `http://localhost:4000`.

REST endpoints, except health/readiness and websocket connection, require:

```http
x-api-key:SECRET_KEY
```

## Backend Scripts

```bash
npm run dev:server
npm run build:server
npm run db:generate
npm run db:migrate
```

## Frontend Scripts

The original frontend commands are unchanged:

```bash
npm run dev
npm run build
npm run preview
```

## Backend API Surface

- `GET /health`
- `GET /ready`
- `POST /api/users`
- `GET /api/users/:userId/history`
- `POST /api/sessions`
- `GET /api/sessions/:sessionId`
- `GET /api/sessions/:sessionId/state`
- `PATCH /api/sessions/:sessionId/state`
- `POST /api/sessions/:sessionId/transcripts`
- `POST /api/reports/sessions/:sessionId`
- `GET /api/reports/users/:userId`
- `GET /api/analytics/users/:userId`
- `POST /api/analytics/sessions/:sessionId/behavior-metrics`
- `POST /api/analytics/sessions/:sessionId/emotion-states`
- `WS /ws/realtime?userId=<user-id>`

## Persistence Model

The Prisma schema creates persistent storage for:

- users
- interview sessions
- interview rounds
- transcripts
- behavior metrics
- emotion states
- scores
- feedback reports
- roadmaps
- resume analysis
- event logs

Redis stores active session state, realtime speaker state, websocket event fanout, and temporary transcript buffers.
