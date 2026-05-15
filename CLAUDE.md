# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Commands

```bash
npm i          # install dependencies
npm run dev    # start dev server at http://localhost:5173
npm run build  # production build
```

No test runner is configured.

## Architecture

This is a **React + Vite + TypeScript** frontend-only SPA — a LoRaWAN network server dashboard UI. There is no backend API; all data is hardcoded as `useState` arrays in `ModernDashboard.tsx`.

### State management

All application state (applications, gateways, endDevices, users, integrations, companies) lives in `src/app/components/ModernDashboard.tsx` and is passed down as props. There is no global store (no Redux, no Zustand, no Context API).

### Navigation

`ModernDashboard` controls routing via `activeView` string state. Views: `overview`, `monitoring`, `uplinks`, `applications`, `gateways`, `enddevices`, `analytics`, `storage`, `integrations`, `users`, `companies`, `settings`. `ModernSidebar` calls `onViewChange`; `ModernTopBar` calls `onNavigate` (which also accepts an `itemId` to pre-select a row).

### Component layers

- **Layout**: `ModernDashboard` → `ModernSidebar` + `ModernTopBar` + main content area
- **Page components**: one file per view (e.g. `Gateways.tsx`, `EndDevices.tsx`), receive state + setter as props
- **UI primitives**: `src/app/components/ui/` — shadcn/ui components built on Radix UI, do not edit these
- **Figma utilities**: `src/app/components/figma/ImageWithFallback.tsx`

### Styling

Tailwind CSS v4 (via `@tailwindcss/vite`). Global styles in `src/styles/` — `index.css` imports fonts, tailwind, and theme. Dark theme only; base palette is `slate-900/800/700`.

### Path alias

`@` resolves to `src/` (configured in `vite.config.ts`).

### Key dependencies

- `recharts` — charts (`ActivityChart`, `Analytics`)
- `motion/react` (Framer Motion v12) — page transition animations in `ModernDashboard`
- `lucide-react` — icons throughout
- `@mui/material` + `@emotion/*` — available but minimally used; prefer shadcn/ui components
