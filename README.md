# Satoshi Standard ₿

**An AI-powered Bitcoin finance dashboard.** Convert prices into sats, track your portfolio, watch on-chain addresses, and chat with a live AI analyst — all in the browser, no login required.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-satoshi--standard.vercel.app-f7931a?style=flat-square&logo=vercel&logoColor=white)](https://satoshi-standard.vercel.app)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20llama--3.3--70b-orange?style=flat-square)](https://groq.com)

![Demo](docs/demo.gif)

---

## Features

### AI Bitcoin Analyst
- Streaming chat powered by **Groq** (llama-3.3-70b-versatile) — responses appear token-by-token
- Context-aware: the system prompt is pre-loaded with your portfolio totals, current mempool fee rates, and live BTC price
- Persistent chat history (localStorage, 20-message cap)
- Suggested questions to get started instantly

### On-Chain Address Watcher
- Look up any Bitcoin address (P2PKH, P2SH, bech32) via **Mempool.space** esplora API
- See confirmed balance, unconfirmed mempool balance, and total transaction count
- Transaction history table with direction indicators and **Confirmed / Pending** status badges
- Pin up to 5 addresses for one-click reload; AbortController cancels in-flight requests on rapid lookup

### Portfolio Tracker
- Save any item with a price and currency; auto-converted to sats at the current BTC rate
- Per-item DCA stacking progress bar and category badge
- Portfolio goal widget with animated progress arc
- Category allocation donut chart and fiat purchasing-power erosion chart
- CSV export / JSON import — your data never leaves the browser

### Converter & Market Data
- Real-time BTC price from three providers: **CoinGecko**, **CoinCap**, and **Mempool.space** (fallback chain)
- Live mempool fee ticker in the header (slow / medium / fast sat/vB)
- Multi-currency support (50+ fiat currencies)
- Sats-only mode — hide all fiat values

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| UI | React 19 + Vite | Fast HMR, modern hooks |
| Styling | Tailwind CSS v4 + framer-motion | Utility-first + fluid animations |
| AI | Groq API (streaming SSE) | Free tier, sub-second TTFT |
| On-chain | Mempool.space esplora | Open CORS, no API key needed |
| Price data | CoinGecko → CoinCap → Mempool.space | Multi-provider fallback |
| Persistence | localStorage | Zero backend, portfolio demo |
| Testing | Vitest + React Testing Library | Fast unit + component tests |

---

## Getting Started

```bash
git clone https://github.com/Taninwat-55/Satoshi-Standard.git
cd satoshi-standard
npm install
```

Copy the example env file and add your keys:

```bash
cp .env.example .env
```

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `VITE_GROQ_API_KEY` | **Yes** (for AI chat) | [console.groq.com](https://console.groq.com) — free tier |
| `VITE_COINGECKO_API_KEY` | Optional | [coingecko.com/en/api](https://www.coingecko.com/en/api) — free demo plan |

```bash
npm run dev      # http://localhost:5173
npm run test     # run unit tests
npm run build    # production build
```

---

## Design Decisions

**Client-side API keys** — All keys use the `VITE_` prefix and run in the browser. Acceptable for a portfolio demo where rate limits and key exposure are not a concern.

**No backend** — Fully static SPA. Price data, AI inference, and on-chain lookups all hit public or free-tier APIs directly from the browser. Zero infrastructure to maintain.

**Multi-provider price fallback** — CoinGecko is primary; if it returns a 401/429, the app silently falls back to CoinCap, then Mempool.space. Users never see a broken price.

**shadcn component patterns without HSL variables** — Dark-mode-only app. Adopted shadcn's `cn()` utility and component file structure but kept the existing `brand-orange` / `neutral-*` design tokens instead of wiring up a full HSL CSS variable system.

---

## Author

**Taninwat Kaewpankan** · [taninwatkaewpankan.xyz](https://taninwatkaewpankan.xyz)
