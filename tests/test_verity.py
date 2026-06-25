"""
Basic contract tests for VERITYCore.
Run with: pytest tests/
"""

import pytest
import json


# ---------------------------------------------------------------------------
# Fixtures — replace with your GenLayer test client when running locally
# ---------------------------------------------------------------------------

class MockContract:
    """Minimal mock to unit-test pure logic without a live node."""

    def __init__(self):
        self.sources: dict      = {}
        self.source_count: int  = 0

    def submit_source_mock(self, url: str, domain: str, submitter: str,
                            credibility: int, bias: int, reliability: int, summary: str):
        """Bypass nondet for unit testing — inject scores directly."""
        assert url.strip(),    "URL required"
        assert domain.strip(), "Domain required"
        new_id = self.source_count + 1
        self.source_count = new_id
        self.sources[new_id] = {
            "source_id":         str(new_id),
            "submitter":         submitter,
            "url":               url,
            "domain":            domain,
            "credibility_score": str(max(0, min(100, credibility))),
            "bias_score":        str(max(0, min(100, bias))),
            "reliability_score": str(max(0, min(100, reliability))),
            "summary":           summary[:280],
            "status":            "ACTIVE",
            "created_at":        "2026-01-01T00:00:00Z",
        }
        return new_id

    def get_source(self, source_id: int):
        if source_id not in self.sources:
            return json.dumps({"error": "Not found"})
        return json.dumps(self.sources[source_id])

    def get_all_sources(self, limit: int):
        result = []
        for i, (k, v) in enumerate(self.sources.items()):
            if i >= limit:
                break
            result.append(v)
        return json.dumps(result)

    def get_total(self):
        return json.dumps({"total": str(self.source_count)})

    def archive_source(self, source_id: int):
        if source_id not in self.sources:
            raise Exception("Source not found")
        self.sources[source_id]["status"] = "ARCHIVED"


@pytest.fixture
def contract():
    return MockContract()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestSubmitSource:
    def test_submit_creates_record(self, contract):
        sid = contract.submit_source_mock(
            "https://example.com", "example.com", "0xabc",
            82, 15, 77, "A general-purpose reference site."
        )
        assert sid == 1
        record = json.loads(contract.get_source(1))
        assert record["url"] == "https://example.com"
        assert record["domain"] == "example.com"
        assert record["status"] == "ACTIVE"

    def test_submit_increments_counter(self, contract):
        contract.submit_source_mock("https://a.com", "a.com", "0xabc", 70, 10, 80, "Source A")
        contract.submit_source_mock("https://b.com", "b.com", "0xabc", 60, 30, 65, "Source B")
        total = json.loads(contract.get_total())
        assert total["total"] == "2"

    def test_submit_clamps_scores(self, contract):
        sid = contract.submit_source_mock(
            "https://example.com", "example.com", "0xabc",
            150, -10, 999, "Clamping test."
        )
        record = json.loads(contract.get_source(sid))
        assert int(record["credibility_score"]) == 100
        assert int(record["bias_score"])        == 0
        assert int(record["reliability_score"]) == 100

    def test_submit_empty_url_raises(self, contract):
        with pytest.raises(AssertionError):
            contract.submit_source_mock("", "example.com", "0xabc", 50, 50, 50, "No URL")

    def test_submit_empty_domain_raises(self, contract):
        with pytest.raises(AssertionError):
            contract.submit_source_mock("https://example.com", "", "0xabc", 50, 50, 50, "No domain")

    def test_summary_truncated(self, contract):
        long_summary = "x" * 400
        sid = contract.submit_source_mock(
            "https://example.com", "example.com", "0xabc", 50, 50, 50, long_summary
        )
        record = json.loads(contract.get_source(sid))
        assert len(record["summary"]) <= 280


class TestGetSource:
    def test_get_existing(self, contract):
        contract.submit_source_mock("https://a.com", "a.com", "0x1", 80, 20, 75, "Test source")
        result = json.loads(contract.get_source(1))
        assert "error" not in result
        assert result["source_id"] == "1"

    def test_get_nonexistent(self, contract):
        result = json.loads(contract.get_source(999))
        assert "error" in result


class TestGetAllSources:
    def test_returns_all(self, contract):
        for i in range(5):
            contract.submit_source_mock(f"https://site{i}.com", f"site{i}.com", "0x1", 70, 20, 65, f"Site {i}")
        sources = json.loads(contract.get_all_sources(10))
        assert len(sources) == 5

    def test_respects_limit(self, contract):
        for i in range(10):
            contract.submit_source_mock(f"https://site{i}.com", f"site{i}.com", "0x1", 70, 20, 65, f"Site {i}")
        sources = json.loads(contract.get_all_sources(3))
        assert len(sources) == 3

    def test_empty_registry(self, contract):
        sources = json.loads(contract.get_all_sources(50))
        assert sources == []


class TestArchiveSource:
    def test_archive_changes_status(self, contract):
        contract.submit_source_mock("https://a.com", "a.com", "0x1", 80, 20, 75, "A source")
        contract.archive_source(1)
        record = json.loads(contract.get_source(1))
        assert record["status"] == "ARCHIVED"

    def test_archive_nonexistent_raises(self, contract):
        with pytest.raises(Exception, match="Source not found"):
            contract.archive_source(999)

    def test_archived_preserves_scores(self, contract):
        contract.submit_source_mock("https://a.com", "a.com", "0x1", 82, 15, 77, "A source")
        contract.archive_source(1)
        record = json.loads(contract.get_source(1))
        assert record["credibility_score"] == "82"
        assert record["bias_score"]        == "15"
        assert record["reliability_score"] == "77"


class TestScoringLogic:
    def test_validator_tolerance_band(self):
        """Simulate the ±25 consensus check."""
        def within_band(leader, validator, tolerance=25):
            return abs(validator - leader) <= tolerance

        # Should agree
        assert within_band(80, 72)
        assert within_band(50, 50)
        assert within_band(30, 55)

        # Should disagree
        assert not within_band(80, 50)
        assert not within_band(10, 40)
        assert not within_band(90, 60)

    def test_score_parsing_from_format(self):
        """Simulate parsing SCORES=<c>|<b>|<r>|<summary>"""
        raw = "SCORES=82|15|77|A well-cited academic reference."
        if "SCORES=" in raw:
            raw = raw.split("SCORES=", 1)[1]
        parts = raw.split("|")
        assert int(parts[0]) == 82
        assert int(parts[1]) == 15
        assert int(parts[2]) == 77
        assert parts[3] == "A well-cited academic reference."

    def test_score_parsing_handles_missing_prefix(self):
        """Handles if LLM omits SCORES= prefix."""
        raw = "85|30|80|A news aggregator with moderate bias."
        parts = raw.split("|")
        assert len(parts) >= 3
        c, b, r = int(parts[0]), int(parts[1]), int(parts[2])
        assert 0 <= c <= 100
        assert 0 <= b <= 100
        assert 0 <= r <= 100
