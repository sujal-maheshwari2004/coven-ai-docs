---
id: dag
title: DAG
sidebar_position: 1
---

# DAG

The `DAG` object is the central data structure in Coven. It holds the full pipeline state — nodes, artifacts, execution levels, status, and final output.

## Structure

```python
from coven.models import DAG, DAGStatus

dag = await coven.run("...")

dag.id              # str — unique run identifier (8-char UUID prefix)
dag.task            # str — original plain-English task
dag.nodes           # dict[str, Node] — all agents keyed by node ID
dag.artifacts       # dict[str, Artifact] — all artifacts keyed by name
dag.levels          # list[list[str]] — topologically sorted execution levels
dag.status          # DAGStatus — PLANNED | RUNNING | COMPLETED | FAILED
dag.final_output    # dict — compiled output after all nodes complete
```

## DAGStatus

| Value | Meaning |
|---|---|
| `PLANNED` | Initial state, before execution starts |
| `RUNNING` | Executor is actively processing levels |
| `COMPLETED` | All nodes finished successfully, final output compiled |
| `FAILED` | At least one node failed; execution was halted |

## Helper methods

```python
# Get a single node by ID
node = dag.get_node("market_researcher")

# Get a single artifact by name
artifact = dag.get_artifact("market_analysis_report")

# Get all input artifacts for a node
inputs = dag.get_input_artifacts("strategy_agent")

# Get all output artifacts for a node
outputs = dag.get_output_artifacts("market_researcher")

# Check if all nodes completed successfully
dag.is_complete()  # → bool
```

## Checking node statuses

```python
for node_id, node in dag.nodes.items():
    print(f"{node_id}: {node.status.value}")

# Output:
# market_researcher: completed
# competitor_analyst: completed
# strategy_agent: completed
```

## Checking artifact bodies

```python
for name, artifact in dag.artifacts.items():
    if "__partial__" not in name:  # skip synthesizer intermediates
        print(f"{name}: {artifact.body}")
```

## Execution levels

`dag.levels` shows which nodes ran in parallel:

```python
dag.levels
# [
#   ["data_ingestion"],
#   ["market_researcher", "competitor_analyst"],
#   ["synthesizer_market_data"],
#   ["strategy_agent"],
# ]
```

## Immutability

The `DAG` model uses Pydantic's `model_copy(update={...})` pattern — all updates create new instances rather than mutating in place. This means the DAG passed to `coven.run()` is never modified; the returned DAG is always a new object.
