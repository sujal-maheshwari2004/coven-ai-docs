---
id: decomposer
title: Decomposer
sidebar_position: 1
---

# Decomposer

**Stage 1.** The Decomposer takes a raw plain-English task and returns a structured list of domain agent nodes and artifacts via a single LLM call.

## Responsibilities

- Break the task into the smallest meaningful units of work
- Assign each agent a scoped `system_prompt`
- Define artifact edges (what each agent reads and writes)
- Identify which agents need external tools via `query_tool`

## Output schema

```json
{
  "nodes": [
    {
      "id": "snake_case_unique_id",
      "name": "Human Readable Agent Name",
      "node_type": "domain",
      "system_prompt": "Detailed system prompt...",
      "query_tool": [
        {"tool_description": "plain English description of a tool this agent needs"}
      ],
      "input_artifacts": ["artifact_name_1"],
      "output_artifacts": ["artifact_name_2"]
    }
  ],
  "artifacts": [
    {
      "name": "artifact_name",
      "description": "Clear description of what this artifact contains.",
      "contributors": ["node_id_a"],
      "users": ["node_id_b"],
      "body": {}
    }
  ]
}
```

## Rules the Decomposer follows

### Nodes

- Every node has a unique `snake_case` id
- `node_type` is always `"domain"` — synthesizer, compiler, and decomposer nodes are injected by the system, not created here
- `system_prompt` must be detailed and scoped to that agent's single responsibility
- All artifact names referenced must exist in the `artifacts` list

### Artifacts

- Unique `snake_case` names
- `body` is always `{}` at decomposition time — populated at runtime
- An artifact with **multiple contributors** automatically triggers synthesizer injection in Stage 2b

### `query_tool` — critical

`query_tool` is a list of `{"tool_description": "..."}` objects. Each entry describes one external tool capability in plain English. [ToolStorePy](https://pypi.org/project/toolstorepy/) uses this to semantically search a curated tool index and build a real MCP server before the agent executes.

| ✅ Good | ❌ Bad |
|---|---|
| `"evaluate a mathematical arithmetic expression securely"` | `"calculator"` |
| `"convert between different units of measurement"` | `"use numpy"` |
| `"get current weather conditions for a city"` | `"python tool"` |
| `"preview rows or get summary statistics from a CSV file"` | `"data tool"` |

Only add `query_tool` entries when the agent genuinely needs an external tool. Agents that only reason, synthesize, or analyze text should have `query_tool: []`.

## Validation

After parsing, the `DecomposerParser` validates:

- Every artifact referenced in a node's `input_artifacts` and `output_artifacts` exists
- Every `contributor` and `user` referenced in an artifact matches a real node ID

A `ValueError` is raised on any broken reference, preventing corrupted state from reaching later stages.

## Implementation

```
coven/decomposer/
  agent.py    ← LLM call, DecomposerResponse schema
  parser.py   ← Converts response to Node/Artifact models, validates references
```
