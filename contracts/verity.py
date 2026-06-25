# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass
import json


@allow_storage
@dataclass
class SourceRecord:
    source_id:         u256
    submitter:         str
    url:               str
    domain:            str
    credibility_score: u256   # 0–100
    bias_score:        u256   # 0–100 (0 = neutral, 100 = heavily biased)
    reliability_score: u256   # 0–100
    summary:           str
    status:            str    # ACTIVE | ARCHIVED
    created_at:        str

    def to_dict(self):
        return {
            "source_id":         str(self.source_id),
            "submitter":         self.submitter,
            "url":               self.url,
            "domain":            self.domain,
            "credibility_score": str(self.credibility_score),
            "bias_score":        str(self.bias_score),
            "reliability_score": str(self.reliability_score),
            "summary":           self.summary,
            "status":            self.status,
            "created_at":        self.created_at,
        }


class VERITYCore(gl.Contract):
    sources:      TreeMap[u256, SourceRecord]
    source_count: u256

    def __init__(self):
        self.source_count = u256(0)

    # ── views ────────────────────────────────────────────────────────

    @gl.public.view
    def get_all_sources(self, limit: int) -> str:
        result = []
        count = 0
        for k, v in self.sources.items():
            if count >= limit:
                break
            result.append(v.to_dict())
            count += 1
        return json.dumps(result)

    @gl.public.view
    def get_source(self, source_id: int) -> str:
        idx = u256(source_id)
        if idx not in self.sources:
            return json.dumps({"error": "Not found"})
        return json.dumps(self.sources[idx].to_dict())

    @gl.public.view
    def get_total(self) -> str:
        return json.dumps({"total": str(self.source_count)})

    # ── write ────────────────────────────────────────────────────────

    @gl.public.write
    def submit_source(self, url: str, domain: str) -> None:
        url    = url.strip()
        domain = domain.strip()
        if not url:
            raise Exception("URL required")
        if not domain:
            raise Exception("Domain required")

        def leader_fn() -> str:
            evidence = ""
            try:
                r = gl.nondet.web.get(url)
                evidence = r.body.decode("utf-8")[:3000]
            except Exception as e:
                evidence = "FETCH_ERROR: " + str(e)

            prompt = (
                "You are an expert media analyst and fact-checker.\n"
                "Evaluate the credibility, bias, and reliability of this web source.\n\n"
                "URL: " + url + "\n\n"
                "PAGE CONTENT:\n" + evidence + "\n\n"
                "Score on three dimensions (integers 0-100):\n"
                "- credibility: factual accuracy and sourcing quality (100 = highly credible)\n"
                "- bias: how opinionated or slanted (0 = neutral, 100 = heavily biased)\n"
                "- reliability: consistency and trustworthiness (100 = very reliable)\n"
                "Also write a one-sentence summary of what this source is.\n\n"
                "Reply ONLY in this exact format (one line):\n"
                "SCORES=<credibility>|<bias>|<reliability>|<summary>\n\n"
                "Example: SCORES=85|20|90|A peer-reviewed science journal covering climate research."
            )
            return gl.nondet.exec_prompt(prompt)

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False

            def parse_scores(raw: str):
                raw = str(raw).strip()
                if "SCORES=" in raw:
                    raw = raw.split("SCORES=", 1)[1]
                parts = raw.split("|")
                if len(parts) < 3:
                    return None
                try:
                    c = max(0, min(100, int(parts[0].strip())))
                    b = max(0, min(100, int(parts[1].strip())))
                    r = max(0, min(100, int(parts[2].strip())))
                    return (c, b, r)
                except Exception:
                    return None

            leader_scores = parse_scores(str(leader_result.calldata))
            if leader_scores is None:
                return False

            my_raw = leader_fn()
            my_scores = parse_scores(my_raw)
            if my_scores is None:
                return False

            lc, lb, lr = leader_scores
            vc, vb, vr = my_scores
            return (
                abs(vc - lc) <= 25 and
                abs(vb - lb) <= 25 and
                abs(vr - lr) <= 25
            )

        raw = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        # parse outside nondet
        raw = str(raw).strip()
        if "SCORES=" in raw:
            raw = raw.split("SCORES=", 1)[1]
        parts = raw.split("|")

        try:
            credibility = u256(max(0, min(100, int(parts[0].strip()))))
            bias        = u256(max(0, min(100, int(parts[1].strip()))))
            reliability = u256(max(0, min(100, int(parts[2].strip()))))
            summary     = parts[3].strip()[:280] if len(parts) > 3 else "No summary available."
        except Exception:
            credibility = u256(50)
            bias        = u256(50)
            reliability = u256(50)
            summary     = "Could not parse evaluation."

        new_id            = u256(int(self.source_count) + 1)
        self.source_count = new_id
        self.sources[new_id] = SourceRecord(
            source_id         = new_id,
            submitter         = str(gl.message.sender_address),
            url               = url,
            domain            = domain,
            credibility_score = credibility,
            bias_score        = bias,
            reliability_score = reliability,
            summary           = summary,
            status            = "ACTIVE",
            created_at        = gl.message_raw["datetime"],
        )

    @gl.public.write
    def archive_source(self, source_id: int) -> None:
        idx = u256(source_id)
        if idx not in self.sources:
            raise Exception("Source not found")
        r = self.sources[idx]
        self.sources[idx] = SourceRecord(
            source_id         = r.source_id,
            submitter         = r.submitter,
            url               = r.url,
            domain            = r.domain,
            credibility_score = r.credibility_score,
            bias_score        = r.bias_score,
            reliability_score = r.reliability_score,
            summary           = r.summary,
            status            = "ARCHIVED",
            created_at        = r.created_at,
        )
