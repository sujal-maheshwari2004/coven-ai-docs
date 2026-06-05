---
id: synthesizer
title: Synthesizer
sidebar_position: 6
---

# Synthesizer

The Synthesizer is a meta-agent injected automatically by Coven when multiple domain agents contribute to the same artifact. It merges partial outputs, resolves conflicts, and produces a single high-quality artifact body.

## When it's injected

The Graph Builder flags any artifact with more than one contributor:

```
issues: ["SYNTHESIZER_NEEDED: market_data"]
```

`SynthesizerInjector` then rewires the graph:

```
Before injection:
  agent_a ──┐
            ├── market_data ── agent_c
  agent_b ──┘

After injection:
  agent_a ──► market_data__partial__agent_a ──┐
                                               ├── synthesizer_market_data ──► market_data ──► agent_c
  agent_b ──► market_data__partial__agent_b ──┘
```

## What the injector creates

For each artifact needing synthesis:

1. **Partial artifacts** — one per contributor (e.g. `market_data__partial__agent_a`)
2. **A Synthesizer node** — reads all partials, writes the final artifact
3. **Updated contributor outputs** — each contributor's `output_artifacts` is rewritten to point to its partial artifact

The original artifact's `contributors` list is replaced with just `[synthesizer_node_id]`.

## What the Synthesizer agent does

The Synthesizer receives:
- The target artifact's `name` and `description`
- The `system_prompt` of every contributing agent (so it understands each agent's intent and perspective)
- All partial artifact bodies

It produces:
- A single merged `body` that fulfills the artifact description
- `qc_notes` — a list of strings explaining conflicts resolved, gaps filled, and key decisions made

## Output schema

```json
{
  "body": {
    "...merged artifact content..."
  },
  "qc_notes": [
    "Resolved conflict: agent_a reported market size as $4.2B, agent_b as $3.8B. Used agent_a's figure as it cited a more recent source.",
    "Filled gap: neither contributor addressed enterprise segment — synthesized from available context."
  ]
}
```

## QC notes in downstream stages

`qc_notes` are stored in the merged artifact body under the `__qc_notes__` key:

```python
artifact.body["__qc_notes__"]  # list of strings
```

The Compiler surfaces key synthesis decisions in `metadata.synthesis_decisions`.

## Quality control standards

| Issue | Synthesizer behavior |
|---|---|
| Contributors disagree | Reasons about which is more grounded, explains choice in `qc_notes` |
| Artifact description requires content no contributor addressed | Synthesizes from available context, flags in `qc_notes` |
| Redundant content across contributions | Merges cleanly — no repetition |
| Inconsistent terminology | Normalizes to a single consistent form |

## Implementation

```
coven/synthesizer/
  agent.py    ← LLM call, SynthesizerResponse schema
  injector.py ← Rewires nodes/artifacts/graph, creates partial artifacts + synth node
  parser.py   ← Applies merged body + qc_notes back onto the target artifact
```
