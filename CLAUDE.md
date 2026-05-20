# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — online gaming platform where users play classic arcade games and compete for points on per-game leaderboards. Uses **Spec Driven Design** via the `/spec` and `/spec-impl` skills from `npx skills@latest add Klerith/fernando-skills` (see `skills-lock.json`).

## Stack

- **Next.js 16.2.6** with App Router — read `node_modules/next/dist/docs/` before writing Next.js code; APIs differ from training data
- **React 19.2.4**
- **Tailwind CSS v4** (PostCSS plugin via `@tailwindcss/postcss`)
- **TypeScript**
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) — auth + scores persistence
- **Resend** — contact form email delivery

No test runner configured.

## Skills

Usa siempre `/frontend-design` para diseñar la interfaz de usuario.

## Agentes

- **`game-planner`** (`.claude/agents/game-planner.md`) — planifica y sugiere el próximo juego a implementar. Lee el catálogo actual, evalúa candidatos por diversidad de género, factibilidad en canvas 2D y reconocimiento clásico, y mantiene una memoria persistente de sugerencias en `references/game-suggestions-todo.md`. Úsalo cuando el usuario pregunte qué juego sigue o pida ideas.

## Architecture

App Router exclusively — no `pages/` directory.

### Routes (`app/`)

- `layout.tsx` — root layout (Geist fonts, global CSS, `UserContext` provider, `Nav`)
- `page.tsx` — home / landing
- `about/` — about + contact form
- `api/contact/` — Resend-backed contact endpoint
- `auth/` — Supabase auth page
- `games/` — games index (`GamesGrid.tsx`) + per-game routes like: `arkanoid`, `asteroids`, `snake`, `tetris` and more...
  (see `references/implemented-games.md`) when you need to check which games are implemented and how to implement new ones.

- `games/[id]/` — dynamic game detail with nested `play/` route
- `hall-of-fame/` — leaderboard / scores
- `context/UserContext.tsx` — client-side auth user context
- `data/` — static catalog: `games.ts`, `scores.ts`, `index.ts`
- `RevealObserver.tsx` — scroll-reveal animations

### Shared code

- `components/Nav.tsx` — top navigation
- `components/games/` — canvas game implementations (`ArkanoidGame`, `AsteroidsGame`, `SnakeGame`, `TetrisGame`)
- `lib/supabase/` — `client.ts` (browser), `server.ts` (RSC/route handlers), `types.ts` (DB types)
- `public/` — sprite sheets (`spritesheet-breakout.png`, `fruits.png`) and audio (`ball-bounce.mp3`, `break-sound.mp3`)

### Specs

`specs/` holds the spec-driven design history (01 → 09): MVP screens, landing, about+contact, Supabase integration, each game, and the shared games-table/leaderboard schema.

## Conventions

- Server Components by default; add `"use client"` only when needed (game canvases, auth context, interactive forms).
- New routes: folder under `app/` with `page.tsx`.
- Shared UI in `components/`; game logic colocated in `components/games/<Game>.tsx`.
- Supabase: import from `lib/supabase/server` in RSC / route handlers, `lib/supabase/client` in client components.
- New games follow the existing pattern: spec in `specs/`, canvas component in `components/games/`, route under `app/games/<name>/`, score writes through `lib/supabase`.
