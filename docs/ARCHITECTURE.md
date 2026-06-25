# Architecture — VERITY

This document describes the full system architecture of VERITY, from the on-chain contract to the frontend dashboard.

---

## System Overview

```
User Browser
    │
    ├── Read path  ──→  genlayer-js readContract  ──→  Bradbury RPC (CORS-open)
    │                       └── get_all_sources / get_source / get_total
    │
    └── Write path ──→  genlayer-js writeContract ──→  Bradbury mempool
                            └── submit_source(url, domain)
                                        │
                                    GenLayer Consensus
                                        │
                              ┌─────────┴──────────┐
                              │  Leader Validator   │
                              │  • fetch URL        │
                              │  • exec LLM prompt  │
                              │  • return SCORES=…  │
                              └─────────┬──────────┘
                                        │
                              ┌─────────┴──────────┐
                              │  N Validators       │
                              │  • fetch URL        │
                              │  • exec LLM prompt  │
                              │  • compare ±25      │
                              └─────────┬──────────┘
                                        │
                              Equivalence Principle
                                        │
                              SourceRecord minted
                              on Bradbury
```

---

## Contract Layer

### `VERITYCore` (Python, GenVM)

The contract runs on GenLayer's GenVM — a modified EVM that supports nondeterministic execution blocks. Standard EVM contracts require byte-exact determinism; GenVM relaxes this constraint through the Equivalence Principle, allowing contracts to call LLMs and fetch live web data.

**Storage:**
- `TreeMap[u256, SourceRecord]` — primary record store, keyed by auto-incrementing ID
- `u256 source_count` — total records counter

**Execution flow for `submit_source`:**

```
1. Validate inputs (non-empty url, domain)
2. Enter nondet block:
   a. leader_fn():
      - gl.nondet.web.get(url) → fetch live content
      - truncate to 3000 chars
      - gl.nondet.exec_prompt(analysis_prompt) → LLM scores
      - return "SCORES=<c>|<b>|<r>|<summary>"
   b. validator_fn(leader_result):
      - isinstance check on gl.vm.Return
      - parse leader's three scores
      - independently fetch URL and score it
      - return abs(val - leader) ≤ 25 for all three
3. Parse raw result outside nondet (deterministic)
4. Clamp scores to [0, 100]
5. Store SourceRecord with gl.message.sender_address and gl.message_raw["datetime"]
6. Increment source_count
```

### Why outside the nondet block?

All storage writes must happen outside `gl.vm.run_nondet_unsafe`. Inside the block, execution is nondeterministic — the GenVM runs the leader and validators independently. Storage writes inside would conflict. Only the final agreed-upon result is returned; parsing and storing happen deterministically after.

---

## Frontend Layer

### Stack

| Concern | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Chain client | `genlayer-js` ^1.1.7 |
| Deployment | Vercel (static) |

### Data flow

```
App.tsx
  └── useRegistry hook (polling every 15s)
        ├── getAllSources() → readContract → Bradbury RPC
        └── getTotal()     → readContract → Bradbury RPC

Pages:
  Landing   → display total count from useRegistry
  Registry  → display + filter + sort SourceRecord[]
  Submit    → writeContract → submit_source()
```

The dashboard is **fully static** — no backend, no API server. The Bradbury RPC is CORS-open, so the browser reads contract state directly via `readContract` from `genlayer-js`. There is no intermediary service.

### Score rendering

Scores are stored as integers 0–100 on-chain. The frontend renders them as:
- **ScoreRing** — animated SVG circle showing the score numerically
- Color coding: green ≥ 70, amber 40–69, red < 40 (inverted for bias)
- Labels: "High / Moderate / Low" (credibility, reliability) or "Neutral / Slight / Moderate / High" (bias)

---

## Consensus Design

### Equivalence Principle

GenLayer does not require validators to return identical bytes. Instead, a comparison function determines whether two results are "equivalent." VERITY uses score band comparison:

```python
return (
    abs(vc - lc) <= 25 and
    abs(vb - lb) <= 25 and
    abs(vr - lr) <= 25
)
```

This is appropriate because:
- Different LLM backends assign slightly different absolute scores to the same content
- A ±25 tolerance captures genuine agreement without being so wide that it allows bad faith validators
- Three dimensions must all agree — a validator cannot pass by agreeing on two and diverging on one

### Prompt engineering for consistency

The analysis prompt requests a strict format:
```
SCORES=<credibility>|<bias>|<reliability>|<summary>
```

Format strictness reduces variance in validator outputs. The `SCORES=` prefix guards against preamble text. Pipe delimiters are less ambiguous than commas for the summary field.

---

## Security Considerations

- **No admin keys** — `archive_source` is callable by any address (community curation model). No privileged owner.
- **No financial mechanics** — no staking, no token transfers, no payable functions.
- **Input validation** — URL and domain are validated for non-emptiness before entering the nondet block.
- **Score clamping** — all LLM-produced integers are clamped `max(0, min(100, int(...)))` before storage, preventing out-of-range values from malformed responses.
- **Private key handling** — the frontend signs transactions locally in the browser. The private key is never sent to any server.

---

## Deployment Topology

```
GitHub (source) ──→ Vercel (auto-deploy on push)
                         └── Static SPA at verity-genlayer.vercel.app
                                   │
                              Reads/writes via Bradbury RPC
                                   │
                         GenLayer Bradbury Testnet
                                   │
                         VERITYCore contract
                         0xd1Dbf820eD19E7371EA72aB57a159263391A543C
```
