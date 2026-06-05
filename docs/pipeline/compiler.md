---
id: compiler
title: Compiler
sidebar_position: 5
---

# Compiler

**Stage 5.** The Compiler reads all completed artifact bodies from the executed DAG and assembles them into a single coherent final output.

## Responsibilities

- Synthesize all artifacts into a unified response
- Organize content into logical sections, each citing its source artifacts
- Surface synthesis decisions from synthesizer nodes
- Directly address the user's original task

## Output schema

```json
{
  "title": "Short descriptive title",
  "summary": "2-3 sentence executive summary",
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content — prose, structured data, or mixed",
      "source_artifacts": ["artifact_name_1", "artifact_name_2"]
    }
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ],
  "metadata": {
    "total_agents": 6,
    "artifacts_produced": 8,
    "synthesis_decisions": ["key decision from synthesizer QC notes"]
  }
}
```

## What gets filtered

Partial synthesizer artifacts (names containing `__partial__`) are filtered out before compilation. Their content has already been merged into the final target artifacts by the Synthesizer nodes.

## `to_text()` rendering

`Coven.to_text(dag)` calls `CompilerFormatter.to_text()` to render the compiled output as plain text:

```
============================================================
GO-TO-MARKET STRATEGY
============================================================

Executive summary here...

── Market Analysis ──────────────────────────────────────────
Content from market analysis...
  [sources: market_analysis_report]

── Recommendations ──────────────────────────────────────────
  1. Target mid-market first
  2. Lead with integration story

── Metadata ─────────────────────────────────────────────────
  Agents: 6
  Artifacts: 8
  Synthesis decisions:
    • Resolved conflict between market sizing estimates
============================================================
```

## Implementation

```
coven/compiler/
  agent.py      ← LLM call, CompilerResponse + OutputSection schemas
  formatter.py  ← Writes response into dag.final_output, renders to_text()
```

## Accessing the output programmatically

```python
dag = await coven.run("...")

# Rendered text
print(coven.to_text(dag))

# Structured dict
dag.final_output["title"]
dag.final_output["summary"]
dag.final_output["sections"]        # list of section dicts
dag.final_output["recommendations"] # list of strings
dag.final_output["metadata"]        # dict with dag_id, task, total_agents, ...
```
