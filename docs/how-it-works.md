---
id: how-it-works
title: How It Works
sidebar_position: 2
---

# How It Works

Coven runs five stages in sequence. Each stage is a separate agent with its own prompt, parser, and validator — no stage can corrupt the next.

```
Task (plain English)
  │
  ▼
[1] Decomposer       → breaks task into focused agent nodes + artifacts
  │
  ▼
[2] Graph Builder    → validates wiring, formalizes edges, injects synthesizer hints
  │
  ▼
[3] Sorter           → topological sort into parallel execution levels
  │
  ▼
[4] Executor         → runs each level concurrently via asyncio.gather
  │         └── per-node MCP server built automatically via ToolStorePy
  ▼
[5] Compiler         → assembles all artifact outputs into one coherent final result
```

## Stage 1 — Decomposer

The Decomposer takes your plain-English task and returns a list of domain agent **nodes** and **artifacts**. Each node gets:

- A scoped `system_prompt` describing its role
- `input_artifacts` it reads
- `output_artifacts` it produces
- `query_tool` entries describing any external tools it needs (plain English)

The decomposer keeps agents focused, avoids cycles, and uses `query_tool` only when an agent genuinely needs external data or computation.

→ [Decomposer deep dive](./pipeline/decomposer)

## Stage 2 — Graph Builder

The Graph Builder takes the decomposed nodes and artifacts, verifies the wiring, derives explicit edges, repairs mismatches, detects cycles, and flags artifacts with multiple contributors for synthesizer injection.

A hard algorithmic cycle check runs after the LLM stage — the graph is never trusted on structural correctness alone.

→ [Graph Builder deep dive](./pipeline/graph-builder)

## Stage 2b — Synthesizer Injection

When multiple agents contribute to the same artifact, Coven automatically injects a **Synthesizer node** between them and the downstream consumers. It merges partial outputs, resolves conflicts, and attaches QC notes — without the decomposer needing to know this will happen.

→ [Synthesizer deep dive](./pipeline/synthesizer)

## Stage 3 — Sorter

Pure topological sort via [networkx](https://networkx.org/). Produces execution **levels** — each level is a list of node IDs that can run fully in parallel. No LLM involved.

→ [Sorter deep dive](./pipeline/sorter)

## Stage 4 — Executor

Runs each level with `asyncio.gather`. For each node with `query_tool` entries, it calls `MCPNodeBuilder` to build a dedicated [ToolStorePy](https://pypi.org/project/toolstorepy/) MCP server before execution. MCP builds within a level also run concurrently. Each node gets its own isolated workspace so parallel builds never conflict.

→ [Executor deep dive](./pipeline/executor)

## Stage 5 — Compiler

Reads all completed artifact bodies and compiles them into a single coherent output: title, summary, sections (each citing source artifacts), recommendations, and metadata.

→ [Compiler deep dive](./pipeline/compiler)

---

## Artifacts — the edges of the DAG

Artifacts are the edges of the DAG — structured JSON objects passed between agents. An artifact has:

| Field | Description |
|---|---|
| `name` | Unique snake_case identifier |
| `description` | What this artifact contains |
| `contributors` | Agent node IDs that write to it |
| `users` | Agent node IDs that read from it |
| `body` | Free-form JSON, populated at runtime |

The graph structure emerges entirely from artifact wiring — no explicit edge list is needed at definition time.

→ [Artifacts concept guide](./concepts/artifacts)

## Parallel execution

Agents in the same topological level run concurrently. A pipeline with 10 agents across 3 dependency levels makes only **3 sequential round trips**, not 10.

```
Level 0: [data_ingestion]                          ← 1 round trip
Level 1: [market_researcher, competitor_analyst]   ← 1 round trip (2 agents in parallel)
Level 2: [synthesizer_market_data]                 ← 1 round trip
Level 3: [strategy_agent]                          ← 1 round trip
```
