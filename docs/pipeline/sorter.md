---
id: sorter
title: Sorter
sidebar_position: 3
---

# Sorter

**Stage 3.** The Sorter is a pure algorithmic stage — no LLM involved. It takes the validated `nx.DiGraph` and produces execution **levels** using Kahn's algorithm (`networkx.topological_generations`).

## What a level is

Each level is a list of node IDs that:
- Have no unresolved dependencies on each other
- Can be executed fully in parallel

When level `N` begins, all artifacts produced by levels `0…N-1` are guaranteed to be available.

## Example

A pipeline with a research, analysis, synthesis, and strategy stage:

```
Level 0: [data_ingestion]
Level 1: [market_researcher, competitor_analyst]   ← parallel
Level 2: [synthesizer_market_data]
Level 3: [strategy_agent]
```

This pipeline makes **4 sequential round trips** regardless of how many total agents it contains — only the number of levels matters for latency.

## Pre-sort validation

Before sorting, `SorterValidator` runs checks that are distinct from the graph-structural checks in Stage 2:

| Check | Error raised |
|---|---|
| Graph is empty | `SorterValidationError` |
| Node in registry missing from graph | `SorterValidationError` |
| Extra node in graph with no model | `SorterValidationError` |
| Node has no output artifacts | `SorterValidationError` |
| Input artifact not in registry | `SorterValidationError` |

## Implementation

```
coven/sorter/
  topological.py  ← TopologicalSorter.sort(), describe(), get_execution_order()
  validator.py    ← SorterValidator pre-sort checks
```

## `describe()` output

`TopologicalSorter.describe(G, nodes)` produces a human-readable execution plan logged during the pipeline run:

```
Execution Plan:
  Level 0: [ Data Ingestion Agent ]
  Level 1: [ Market Researcher ‖ Competitor Analyst ]
  Level 2: [ Synthesizer: market_data ]
  Level 3: [ Strategy Agent ]
```
