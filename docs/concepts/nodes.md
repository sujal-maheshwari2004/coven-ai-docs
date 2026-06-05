---
id: nodes
title: Nodes
sidebar_position: 3
---

# Nodes

A `Node` represents a single agent in the DAG. Every agent — regardless of role — shares the same `Node` model. The `node_type` field determines how the Executor handles it.

## Structure

```python
from coven.models import Node, NodeType, NodeStatus

Node(
    id="market_researcher",
    name="Market Research Agent",
    node_type=NodeType.DOMAIN,
    system_prompt="You are a market research analyst...",
    query_tool=[
        {"tool_description": "fetch financial data for a public company"}
    ],
    input_artifacts=["raw_brief"],
    output_artifacts=["market_analysis_report"],
    status=NodeStatus.PENDING,
)
```

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `str` | Unique snake_case identifier |
| `name` | `str` | Human-readable display name |
| `node_type` | `NodeType` | Role in the pipeline |
| `system_prompt` | `str` | The system prompt governing this agent |
| `query_tool` | `list[ToolQuery]` | Tool descriptions for ToolStorePy (empty if no tools needed) |
| `input_artifacts` | `list[str]` | Artifact names this node reads |
| `output_artifacts` | `list[str]` | Artifact names this node produces |
| `status` | `NodeStatus` | Current execution status |
| `result` | `dict` | Raw output after execution (error info on failure) |
| `contributor_system_prompts` | `list[str]` | System prompts of contributors (used by synthesizer nodes) |
| `mcp_server_path` | `str \| None` | Path to the built MCP server (set at runtime) |
| `mcp_server_port` | `int \| None` | Port the MCP server listens on (set at runtime) |

## NodeType

| Value | Description |
|---|---|
| `DOMAIN` | Standard task-execution agent created by the Decomposer |
| `SYNTHESIZER` | Auto-injected merger agent for multi-contributor artifacts |
| `COMPILER` | Final assembly agent (internal, not user-created) |
| `DECOMPOSER` | Pipeline stage node (internal) |

In normal usage you only interact with `DOMAIN` and `SYNTHESIZER` nodes. The Decomposer always creates `DOMAIN` nodes — the system injects all others.

## NodeStatus

| Value | Description |
|---|---|
| `PENDING` | Not yet executed |
| `RUNNING` | Currently executing (reserved for future streaming) |
| `COMPLETED` | Executed successfully |
| `FAILED` | Execution raised an exception |

## ToolQuery

`query_tool` is a list of `ToolQuery` objects:

```python
from coven.models.node import ToolQuery

ToolQuery(tool_description="evaluate a mathematical arithmetic expression securely")
```

Each entry describes one tool capability in plain English. [ToolStorePy](https://pypi.org/project/toolstorepy/) uses semantic search to find and build the right MCP tool.

## Checking node status after a run

```python
dag = await coven.run("...")

for node_id, node in dag.nodes.items():
    if node.status == NodeStatus.FAILED:
        print(f"Node {node_id} failed: {node.result.get('error')}")
    else:
        print(f"Node {node_id}: {node.status.value}")
```

## Nodes are immutable

All updates use `model_copy(update={...})`. The executor never mutates a node in place — it creates a new `Node` instance with the updated status and stores it back in the DAG.
