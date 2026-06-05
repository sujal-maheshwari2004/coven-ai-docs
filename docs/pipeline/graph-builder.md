---
id: graph-builder
title: Graph Builder
sidebar_position: 2
---

# Graph Builder

**Stage 2.** The Graph Builder takes decomposed nodes and artifacts and constructs a validated DAG with explicit edges. It acts as both an LLM-based repair pass and a structural verifier.

## Responsibilities

- Verify artifact contributor/user wiring consistency
- Derive and formalize all directed edges
- Detect and repair broken references
- Detect cycles
- Flag artifacts needing synthesizer injection

## What the LLM does

For every artifact, the LLM derives edges from `contributors → users`. It also:

- Checks that every `input_artifact` a node declares has that node in the artifact's `users` list
- Checks that every `output_artifact` a node declares has that node in the artifact's `contributors` list
- Fixes mismatches and logs them in `issues`
- Removes dangling artifacts (no contributors or no users)

## Synthesizer injection hints

When an artifact has more than one contributor, the LLM adds to `issues`:

```
SYNTHESIZER_NEEDED: artifact_name
```

The `GraphBuilderParser` scans these issues and returns `synthesizer_targets` — a list of artifact names. The main pipeline then calls `SynthesizerInjector` to insert the appropriate nodes.

## Hard algorithmic safety net

After the LLM runs, `GraphBuilderValidator` performs a pure algorithmic check using [networkx](https://networkx.org/):

| Check | Error raised |
|---|---|
| Edge references unknown node | `GraphValidationError` |
| Graph contains a cycle | `GraphValidationError` |
| Node has no edges at all | `GraphValidationError` |

This means even if the LLM misses a cycle or creates a disconnected node, execution is halted before the pipeline advances.

## Output schema

```json
{
  "nodes": [...],
  "artifacts": [...],
  "edges": [
    {
      "from_node": "node_id_a",
      "to_node": "node_id_b",
      "artifact": "artifact_name"
    }
  ],
  "issues": [
    "SYNTHESIZER_NEEDED: market_data",
    "Removed dangling artifact 'unused_output'"
  ]
}
```

## Implementation

```
coven/graph_builder/
  agent.py      ← LLM call, GraphBuilderResponse + Edge schemas
  parser.py     ← Converts response to Node/Artifact/Edge models, extracts synthesizer targets
  validator.py  ← Algorithmic cycle/isolation/unknown-node checks via networkx
```
