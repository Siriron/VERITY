# VERITY — On-Chain Source Intelligence Protocol

> Decentralized source intelligence protocol. Submit any URL — GenLayer validators fetch live content and reach LLM consensus on credibility, bias, and reliability. Every domain builds an immutable trust record on Bradbury.

[![Live Demo](https://img.shields.io/badge/demo-verity--genlayer.vercel.app-1e56a0?style=flat-square)](https://verity-genlayer.vercel.app)
[![Contract](https://img.shields.io/badge/contract-Bradbury-emerald?style=flat-square)](https://explorer-bradbury.genlayer.com/address/0xd1Dbf820eD19E7371EA72aB57a159263391A543C)
[![GenLayer](https://img.shields.io/badge/built%20on-GenLayer-7c3aed?style=flat-square)](https://genlayer.com)

---

## What is VERITY?

VERITY is an Intelligent Contract deployed on GenLayer Bradbury that turns source evaluation into a public good. When a user submits a URL, GenLayer's validator network fetches the live page content, runs independent LLM analysis, and agrees on three scores through the Equivalence Principle:

| Score | Range | Meaning |
|---|---|---|
| **Credibility** | 0–100 | Factual accuracy and sourcing quality |
| **Bias** | 0–100 | 0 = neutral · 100 = heavily opinionated |
| **Reliability** | 0–100 | Consistency and trustworthiness over time |

Scores are minted immutably on-chain. No editorial override, no takedowns.

---

## Why GenLayer?

Media bias and source credibility have **no deterministic proxy**. You cannot reduce them to a formula. Evaluating them requires:

1. Fetching the **live** web content of the source
2. Reasoning over that content with language understanding
3. Reaching **consensus** across multiple independent evaluators

This is exactly what GenLayer's Intelligent Contracts enable — validators read the live web, run LLM reasoning, and agree through the Equivalence Principle rather than byte-for-byte matching. Remove that capability and the protocol has nothing to compute.

---

## Architecture

```
VERITY/
├── contracts/
│   └── verity.py           # Intelligent Contract (Python, runs on GenVM)
├── deploy/
│   └── deploy.js           # Bradbury deployment script
├── tests/
│   └── test_verity.py      # Contract unit tests
├── web/
│   └── app/                # React + Vite + TypeScript dashboard
│       ├── src/
│       │   ├── components/ # Navbar, SourceCard, ScoreRing, Footer
│       │   ├── hooks/      # useRegistry (live data polling)
│       │   ├── lib/        # genlayer.ts (client + helpers)
│       │   └── pages/      # Landing, Registry, Submit
│       └── ...
├── docs/
│   ├── CONTRACT.md         # Contract API reference
│   ├── ARCHITECTURE.md     # System design deep-dive
│   ├── DEPLOYMENT.md       # Step-by-step deploy guide
│   └── SCORING.md          # How scores are computed
└── README.md
```

---

## Live Deployment

| | |
|---|---|
| **Network** | GenLayer Bradbury (chain id `4221`) |
| **Contract** | [`0xd1Dbf820eD19E7371EA72aB57a159263391A543C`](https://explorer-bradbury.genlayer.com/address/0xd1Dbf820eD19E7371EA72aB57a159263391A543C) |
| **Dashboard** | [verity-genlayer.vercel.app](https://verity-genlayer.vercel.app) |
| **Class** | `VERITYCore` — 5 methods (3 view, 2 write) |
| **Status** | Deployed and verified on Bradbury |

---

## Contract API

### Write Methods

#### `submit_source(url: str, domain: str) → None`
Submits a URL for evaluation. Triggers a nondeterministic LLM consensus round:
- Validators independently fetch the URL content
- Each runs the analysis prompt and returns scores
- Consensus is reached within ±25 points on all three dimensions
- `SourceRecord` is stored with finalized scores

#### `archive_source(source_id: int) → None`
Marks an existing source as `ARCHIVED`. Only callable by any address (community curation).

### View Methods

#### `get_all_sources(limit: int) → str`
Returns a JSON array of all `SourceRecord` objects up to `limit`.

#### `get_source(source_id: int) → str`
Returns a single `SourceRecord` as JSON, or `{"error": "Not found"}`.

#### `get_total() → str`
Returns `{"total": "<count>"}`.

---

## Local Development

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.12

### Install dependencies

```bash
# Root (deploy scripts)
npm install

# Frontend
cd web/app
npm install
```

### Run the dashboard locally

```bash
cd web/app
npm run dev
```

The app reads directly from Bradbury via the public RPC — no backend needed.

### Deploy contract to Bradbury

```bash
cp .env.example .env
# Set ACCOUNT_PRIVATE_KEY in .env

npm run deploy:bradbury
```

Fund your account first at [testnet-faucet.genlayer.foundation](https://testnet-faucet.genlayer.foundation).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Python on GenVM |
| Contract Storage | `TreeMap` (GenLayer native) |
| Consensus | Equivalence Principle, ±25 bps tolerance |
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Chain Client | `genlayer-js` ^1.1.7 |
| Deployment | Vercel (frontend) |

---

## Engineering Notes

### Equivalence Principle choice
VERITY uses `non_comparative` equivalence — validators compare their own LLM scores against the leader's within a ±25 point band. Exact score matching would fail because heterogeneous LLM validators diverge on absolute assessments. The band preserves consensus accuracy without spurious `Undetermined` results.

### Score format
All scores are stored as integers 0–100. The contract clamps all values with `max(0, min(100, int(...)))` before storage, preventing any out-of-range data from malformed LLM responses.

### Fallback handling
If the URL cannot be fetched (network error, non-200, etc.), the leader returns default scores (50/50/50) and a `"Could not retrieve content"` summary. Validators match these defaults within tolerance, ensuring the transaction always finalizes rather than hanging.

### Content size
Each validator fetches and truncates content to 3000 characters. This keeps the validator consensus window manageable and prevents timeouts on large pages.

---

## Docs

- [Contract Reference](docs/CONTRACT.md)
- [Architecture Deep-Dive](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Scoring Methodology](docs/SCORING.md)

---

## License

MIT
