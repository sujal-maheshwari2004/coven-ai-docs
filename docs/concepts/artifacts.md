---
id: artifacts
title: Artifacts
sidebar_position: 2
---

# Artifacts

Artifacts are the edges of the DAG. They are structured JSON objects that carry data between agents. The DAG's graph structure emerges entirely from artifact wiring — no explicit edge list is ever specified.

## Structure

```python
from coven.models import Artifact

Artifact(
    name="market_analysis_report",
    description="Comprehensive analysis of target market size, segments, and growth trends.",
    contributors=["market_researcher"],   # agents that write to this artifact
    users=["strategy_agent", "pitch_deck_agent"],  # agents that read from this artifact
    body={},  # populated at runtime
)
```

## Fields

| Field | Type | Description |
|---|---|---|
| `name` | `str` | Unique snake_case identifier |
| `description` | `str` | Human/LLM-readable description of what this artifact contains |
| `contributors` | `list[str]` | Node IDs of agents that produce/write to this artifact |
| `users` | `list[str]` | Node IDs of agents that consume/read this artifact |
| `body` | `dict` | Free-form JSON payload, populated at runtime |

## How edges are inferred

An edge `A → B` via artifact `X` exists when:
- `A` is in `X.contributors`
- `B` is in `X.users`

You never define edges directly — only artifacts and their wiring.

## Multiple contributors → Synthesizer injection

When more than one agent contributes to an artifact, Coven automatically injects a Synthesizer node:

```python
Artifact(
    name="market_data",
    contributors=["quantitative_researcher", "qualitative_researcher"],
    users=["strategy_agent"],
    ...
)
```

This becomes:

```
quantitative_researcher → market_data__partial__quantitative_researcher ──┐
                                                                           ├─► synthesizer_market_data → market_data → strategy_agent
qualitative_researcher  → market_data__partial__qualitative_researcher  ──┘
```

The partial artifacts are named `<artifact_name>__partial__<contributor_id>`. The synthesizer's output overwrites the original artifact.

## Partial artifacts

Partial artifacts are internal implementation details created by the Synthesizer injector. They follow the naming pattern `<name>__partial__<contributor_id>`.

You can identify and skip them:

```python
final_artifacts = {
    name: artifact
    for name, artifact in dag.artifacts.items()
    if "__partial__" not in name
}
```

The Compiler and `CompilerFormatter` already apply this filter automatically.

## Accessing artifact bodies

After a successful run, artifact bodies are fully populated:

```python
dag = await coven.run("...")

report = dag.get_artifact("market_analysis_report")
report.body  # → {"market_size": "4.2B", "segments": [...], ...}
```

## Body schema

Artifact bodies are free-form JSON dicts. The domain agent that produces the artifact decides the schema — there is no enforced structure. This gives agents flexibility to produce whatever format best serves downstream consumers.

The synthesizer adds a `__qc_notes__` key to merged artifact bodies:

```python
artifact.body["__qc_notes__"]  # list[str] — synthesis decisions
```
