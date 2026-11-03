# Orbital Crash

A crypto-themed "crash game" simulator: a rocket's multiplier climbs until it randomly explodes, and you decide when to cash out. **It is a simulation. No real money, cryptocurrency, wallet or blockchain is involved.**

## Overview

Orbital Crash is a single-page React app that runs entirely in your browser. A game loop cycles through waiting, countdown, flight and crash phases. You place a simulated bet, optionally set an auto cash-out multiplier, and try to leave before the rocket crashes. Other "players" in the list are hard-coded fake entries, the amounts are unitless demo numbers labelled "ETH", and the "Connect Wallet" button and the `$0.00` balance are non-functional UI elements.

A separate Simulation tab lets you model the house-side economics of a round (pool collected, payouts, peer-to-peer fees) with preset scenarios.

## Features

- Live flight view with pool fill, countdown, rising multiplier and random crash
- Bet panel with manual and automatic cash-out
- Fake player list that resolves each round
- Bet history with simulated profit and loss
- Simulation tab with presets for crash point, cash-out behaviour and trade fees
- Animated, dark sci-fi interface

## How it works

```
waiting (pool fills) -> countdown (10 s) -> launched -> crashed -> reset (5 s) -> waiting
                                               │
                  multiplier +0.001 per second; crash chance each tick = (multiplier - 1) * 1%
```

All state lives in React hooks in `src/App.tsx`. There is no backend, database or network call.

## Tech stack

- React 19, TypeScript, Vite 6
- Tailwind CSS 4, Motion, lucide-react
- An Express and `@google/genai` dependency are declared in `package.json` but are not used by the current source

## Project structure

```
index.html              Vite entry
metadata.json           App metadata
vite.config.ts          Vite config (React, Tailwind, env define)
src/
  main.tsx              App bootstrap
  App.tsx               Game state machine and round logic
  index.css             Theme and effects
  components/
    GameDisplay.tsx     Rocket, multiplier and countdown view
    BettingPanel.tsx    Bet and cash-out controls
    PlayerList.tsx      Fake players
    HistoryView.tsx     Simulated bet history
    SimulationView.tsx  House economics simulator
    Header.tsx, Sidebar.tsx
```

## Setup

Prerequisite: Node.js 18+.

```bash
npm install
```

## Configuration

No configuration is required to play. `vite.config.ts` injects `GEMINI_API_KEY` (from `.env` or the shell) into the client bundle as `process.env.GEMINI_API_KEY`, but nothing in `src/` reads it. Do not set a real key for this app; anything injected this way becomes visible in the built JavaScript. See `.env.example`.

## Usage

```bash
npm run dev       # http://localhost:3000
npm run build     # production build in dist/
npm run preview   # serve the build
npm run lint      # type-check with tsc
```

## Status / limitations

- Prototype: the crash curve is a simple per-second probability, not a provably fair or audited algorithm.
- Fake players, balances and the wallet button are placeholders.
- No tests.
- Game cadence is deliberately slow (the multiplier rises 0.001 per second).

## Disclaimer

This is a demonstration and simulation only. It does not handle real funds and must not be used as, or turned into, a real-money gambling product without legal review, licensing and a proper fairness and security design. Not financial advice.
