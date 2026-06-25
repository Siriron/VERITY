# Contract Reference — VERITYCore

**Network:** GenLayer Bradbury (chain id `4221`)  
**Address:** `0xd1Dbf820eD19E7371EA72aB57a159263391A543C`  
**Language:** Python (GenVM)  
**Methods:** 5 total — 2 write, 3 view

---

## Data Structures

### `SourceRecord`

The core storage unit. One record per submitted source.

| Field | Type | Description |
|---|---|---|
| `source_id` | `u256` | Auto-incrementing identifier |
| `submitter` | `str` | Address that submitted the source |
| `url` | `str` | Full URL submitted |
| `domain` | `str` | Domain name label |
| `credibility_score` | `u256` | 0–100 (100 = highly credible) |
| `bias_score` | `u256` | 0–100 (0 = neutral, 100 = heavily biased) |
| `reliability_score` | `u256` | 0–100 (100 = very reliable) |
| `summary` | `str` | One-sentence LLM summary, max 280 chars |
| `status` | `str` | `ACTIVE` or `ARCHIVED` |
| `created_at` | `str` | Bradbury block datetime |

---

## Write Methods

### `submit_source(url: str, domain: str) → None`

**Decorator:** `@gl.public.write`  
**Gas:** Nondeterministic — triggers consensus round

Submits a URL for LLM evaluation. The method body contains:

1. **`leader_fn()`** — fetches the URL via `gl.nondet.web.get()`, truncates content to 3000 chars, runs the analysis prompt via `gl.nondet.exec_prompt()`, returns a `SCORES=<c>|<b>|<r>|<summary>` formatted string.

2. **`validator_fn(leader_result)`** — checks `isinstance(leader_result, gl.vm.Return)`, independently fetches and scores the URL, compares all three scores against the leader within ±25 tolerance.

3. **Post-nondet parsing** — splits the `SCORES=` string outside the nondet block, clamps values 0–100, stores the `SourceRecord`.

**Errors:**
- `"URL required"` — empty URL string
- `"Domain required"` — empty domain string

---

### `archive_source(source_id: int) → None`

**Decorator:** `@gl.public.write`

Sets the `status` field of an existing source to `"ARCHIVED"`. Reconstructs the full `SourceRecord` with all fields preserved except `status`.

**Errors:**
- `"Source not found"` — `source_id` does not exist in `self.sources`

---

## View Methods

### `get_all_sources(limit: int) → str`

**Decorator:** `@gl.public.view`

Returns a JSON array of up to `limit` source records. Iterates `self.sources.items()` and stops at `limit`. Each entry is the output of `SourceRecord.to_dict()`.

**Example response:**
```json
[
  {
    "source_id": "1",
    "submitter": "0xabc…",
    "url": "https://example.com",
    "domain": "example.com",
    "credibility_score": "82",
    "bias_score": "15",
    "reliability_score": "77",
    "summary": "A general-purpose reference site covering many topics.",
    "status": "ACTIVE",
    "created_at": "2026-06-03T14:22:00Z"
  }
]
```

---

### `get_source(source_id: int) → str`

**Decorator:** `@gl.public.view`

Returns a single source record as JSON. Returns `{"error": "Not found"}` if the ID does not exist.

---

### `get_total() → str`

**Decorator:** `@gl.public.view`

Returns `{"total": "<n>"}` where `n` is the current `source_count`.

---

## Nondeterminism Design

### Why `non_comparative` equivalence

VERITY uses score band comparison rather than exact matching. Validators independently assess the same URL — their absolute scores will differ slightly across LLM models. A ±25 tolerance on all three dimensions (credibility, bias, reliability) ensures honest validators reach agreement without spurious `Undetermined` outcomes.

### LLM prompt format

The prompt requests a strict single-line format:

```
SCORES=<credibility>|<bias>|<reliability>|<summary>
```

This avoids JSON parsing failures from malformed LLM responses. The `SCORES=` prefix is stripped and the pipe-delimited fields are parsed sequentially. All values are clamped to 0–100 before storage.

### Fetch failure handling

If `gl.nondet.web.get(url)` raises an exception:
- The leader returns default scores `50|50|50` with a "Could not retrieve" summary
- Validators check if their scores fall within ±25 of those defaults
- The transaction always finalizes — it never hangs on fetch errors

---

## Storage Layout

```python
class VERITYCore(gl.Contract):
    sources:      TreeMap[u256, SourceRecord]   # source_id → record
    source_count: u256                          # auto-increment counter
```

`TreeMap` is GenLayer's native ordered map. Keys are `u256` integers. The counter starts at 0 and increments by 1 on each successful `submit_source`.

---

## Contract Header

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

The `Depends` hash pins the exact GenLayer Python library version. This must appear on line 1, with no preceding comments, or the GenVM will reject the upload with `invalid_contract: trailing characters`.
