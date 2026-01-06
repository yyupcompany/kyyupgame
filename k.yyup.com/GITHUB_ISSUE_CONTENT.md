# Reduce Token Cost by 70–80% via Tiered Query Routing and Context Minimization

## Summary
Implement a 3-tier routing pipeline (direct, semantic, complex) with aggressive context and tool-spec pruning, caching, and observability to cut average token usage from ~3000 to 300–800 for ≥70% of queries, without feature regressions.

## Goals
- Cost: ≥70% queries consume < 500 tokens; average 300–800
- Latency: direct P95 < 1s; semantic P95 < 3s; complex P95 < 10s
- Accuracy: direct keyword hit ≥95%; semantic Top-3 relevance ≥0.8
- Stability: 0 regressions on existing E2E/integration/unit tests; feature-flagged rollback
- Data policy: no frontend hardcoding, no backend mocks; demo/test data must come from DB seeds

## 🏁 Acceptance Criteria
- Token
  - ≥ 70% queries total tokens (prompt + context + tools) < 500
  - Average token down to 300–800 (≥70% reduction from ~3000)
- Latency
  - Direct P95 < 1s; Semantic P95 < 3s; Complex P95 < 10s
- Accuracy/Functionality
  - Keyword direct routing hit rate ≥95%
  - Semantic Top-3 relevance ≥0.8 (human sampled rubric)
  - 0 regressions on current test suites (E2E/integration/unit)
- Stability & Rollback
  - Feature flag allows one-click downgrade to previous flow
- Data Strategy
  - Prohibit frontend hardcoding and backend mocks; all demo/test data via DB seeds

## 📌 Scope / Out of Scope
- In Scope
  - Tiered routing: direct / semantic / complex with thresholds
  - Context minimization: prompt/tool-spec pruning by tier
  - Caching: fingerprint + TTL + tier-aware warmups
  - Metrics: token, latency, distribution, cache, failure
- Out of Scope
  - Vendor/model replacement
  - Full information architecture overhaul
  - New non-business tools

## 🗺️ Architecture (High Level)
- Router
  - Direct tier: keyword and intent dictionary with synonyms; minimal prompt, tool whitelist
  - Semantic tier: vector search, Top-K, relevance threshold; slimmed context
  - Complex tier: full planner + multi-tool orchestration; dynamic context assembly
- Context Pruning
  - Tool specs: per-tier white/gray lists, section-level pruning
  - History: minimal, recency-weighted, per-intent
- Cache
  - Query fingerprints, per-tier TTL, warmups on common intents
- Flags & Safeguards
  - Feature flags for tier enabling; dynamic thresholds; failover routes

## 🗃️ Data Strategy & DB Seeds (No Hardcode/No Mock)
- Principle: frontends cannot hardcode data; backends cannot return mock; all demo/test data is DB-backed
- Minimal Seeds (suggested):
  - students ≥ 50; teachers ≥ 20; activities ≥ 20
  - enrollment_plans ≥ 10; applications ≥ 50; consultations ≥ 100
- Execution:
  - Idempotent seed scripts (multi-run safe)
  - Auto-run in dev/test; prod by change review only
- Validation:
  - After seeds, pages must avoid empty states; tier distributions observable

## 🧭 Observability & Monitoring
- Metrics
  - Token usage by tier; latency P50/P95/P99; routing distribution; cache hit/miss; failure rate
- Dashboards & Alerts
  - Grafana/Datadog dashboards by tier
  - Alerts: direct P95>1.5s, semantic P95>4s, complex P95>12s, failures>1%

## ⚠️ Risks & Mitigations
- Misrouting reduces accuracy → dynamic thresholds + forced tier bump on low confidence
- Cold-start & cache penetration → warmups + fingerprint cache + backoff
- Over-pruning harms output → A/B and regression-set validation gates
- Keyword dictionary maintenance → sampling logs auto-discover new terms

## 🚀 Rollout & Rollback
- Gradual rollout: 10% → 30% → 100% by user/tenant/traffic
- Feature flags: control tier activation and pruning strength
- Rollback: hit redlines → immediately switch to old flow; keep full logs

## ✅ Deliverables & Timeline
- W1: Direct tier
  - Keyword dictionary + intent parsing (CN segmentation + synonyms)
  - Direct tool whitelist + trimmed prompt templates
  - Unit/integration tests and routing coverage report
- W2: Semantic tier
  - Vector indexes (students/teachers/activities/...)
  - Top-K retrieval + thresholds; cache + prewarm; retrieval metrics
- W3: Complex tier
  - Complexity scorer (length/intent/cross-domain/tools)
  - Dynamic context assembly; tool-spec cutter (on-demand)
- W4: Tests & Optimization
  - Performance baseline + A/B
  - Observability dashboards + alerts
  - Regression passing + release review

## 🧪 Validation & Tests
- Unit: router decisions/thresholds/pruner/cache
- Integration: end-to-end across direct/semantic/complex
- E2E: typical user journeys; data seeded from DB only
- A/B: pruning strength & routing threshold sensitivity

## 👥 Ownership & Roles
- FE: tier-specific UI hooks, context assembly, metrics emitters
- BE: router service, vector search, tool registry & pruning, metrics emitters
- Data: dictionary/synonyms, embeddings/index jobs, dashboards
- QA: regression set, E2E, A/B protocol & guardrails
- Infra: feature flags, dashboards, alerting
- Owners: @fe @be @data @qa @infra (to be assigned)

## ✅ Checklist
- [ ] Router: direct/semantic/complex enabled via flags
- [ ] Pruning: prompts/tools minimized per tier
- [ ] Cache: fingerprints/TTL/warmups in place
- [ ] Metrics: token/latency/distribution/cache/failure
- [ ] Seeds: idempotent DB scripts; no hardcode/mock data
- [ ] Tests: unit/integration/E2E/A-B all green
- [ ] Rollout: gray release + rollback ready

