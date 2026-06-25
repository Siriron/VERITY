# Scoring Methodology — VERITY

This document explains how VERITY's three scores are computed, what they mean, and how to interpret them.

---

## The Three Dimensions

### Credibility (0–100)

Measures the factual accuracy and sourcing quality of the content.

| Range | Label | Interpretation |
|---|---|---|
| 75–100 | High | Well-sourced, factually grounded, cites evidence |
| 40–74 | Moderate | Mixed quality — some claims sourced, others not |
| 0–39 | Low | Unsourced claims, factual errors, or misleading content |

**What validators look for:**
- Presence of citations, links, and attributions
- Whether claims are verifiable or speculative
- Use of primary vs secondary sources
- Accuracy of any verifiable facts in the content

---

### Bias (0–100)

Measures how opinionated or slanted the content is. Lower is more neutral.

| Range | Label | Interpretation |
|---|---|---|
| 0–20 | Neutral | Balanced presentation, multiple perspectives |
| 21–50 | Slight Bias | Mild lean in one direction, mostly balanced |
| 51–75 | Moderate Bias | Clear ideological or narrative lean |
| 76–100 | High Bias | Strongly partisan or advocacy-oriented content |

**What validators look for:**
- Loaded or charged language
- One-sided presentation of issues
- Selective use of evidence
- Explicit advocacy for a position

**Note:** Bias is not inherently negative. An opinion column is expected to have high bias. Context matters — the score describes the content, not its quality.

---

### Reliability (0–100)

Measures the overall trustworthiness and consistency of the source.

| Range | Label | Interpretation |
|---|---|---|
| 70–100 | High | Established, consistent, professionally maintained |
| 40–69 | Moderate | Generally reliable with occasional lapses |
| 0–39 | Low | Inconsistent, poorly maintained, or unknown provenance |

**What validators look for:**
- Whether the source has an identifiable publisher or author
- Whether the content appears professionally edited
- Whether the source is stable and consistently available
- Whether the domain has an established presence

---

## How Scores Are Computed

### 1. Content Retrieval

The leader validator fetches the URL using `gl.nondet.web.get()` and extracts up to 3000 characters of text content. This is the raw material for analysis.

If the URL is unreachable (network error, non-200 response), the validator returns default scores of 50/50/50 with a `"Could not retrieve content"` summary.

### 2. LLM Analysis

The leader sends a structured prompt to the LLM:

```
You are an expert media analyst. Evaluate this web source.
URL: <url>

PAGE CONTENT:
<excerpt>

Score the source on three dimensions (integers 0-100):
- credibility: ...
- bias: ...
- reliability: ...
Also write a one-sentence summary of what this source is.

Reply ONLY in this exact format (one line):
SCORES=<credibility>|<bias>|<reliability>|<summary>
```

The strict format requirement reduces variability in responses and makes parsing reliable.

### 3. Validator Consensus

Each validator independently fetches the URL and runs the same analysis. They compare their scores against the leader's within a **±25 tolerance band**:

```
|validator_credibility - leader_credibility| ≤ 25  AND
|validator_bias        - leader_bias       | ≤ 25  AND
|validator_reliability - leader_reliability| ≤ 25
```

All three dimensions must agree. A validator that diverges on any single dimension returns `False` and triggers a new leader election.

### 4. Score Finalization

Once consensus is reached, the agreed scores are:
1. Extracted from the leader's result string
2. Clamped to `[0, 100]`
3. Stored as `u256` integers in the `SourceRecord`

---

## Limitations

### Single-page evaluation
Scores reflect the specific URL submitted, not the entire domain. A tabloid's fact-checking column might score higher than its front page. Submit representative URLs for the most useful results.

### Content freshness
Scores are computed at submission time against the live content of that moment. Pages that are updated after submission will not have their scores automatically refreshed. Submit the URL again to get updated scores.

### LLM variability
Different GenLayer validator LLMs may weigh criteria slightly differently. The ±25 consensus tolerance accounts for this natural variability. Scores should be interpreted as approximate ranges rather than precise measurements.

### Language
The analysis prompt is in English. Non-English content may receive less accurate scores depending on the LLM validators' multilingual capabilities.

---

## Score Immutability

Once a `SourceRecord` is stored on Bradbury, its scores cannot be changed. There is no re-evaluation mechanism — each submission creates a new, independent record. This is by design: VERITY is a **log**, not a live feed. The record at a given block reflects what the validators assessed at that moment in time.
