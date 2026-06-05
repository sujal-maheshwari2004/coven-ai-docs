---
id: tool-use
title: Tool Use via ToolStorePy
sidebar_position: 4
---

# Tool Use via ToolStorePy

Coven integrates with [ToolStorePy](https://pypi.org/project/toolstorepy/) to give agents access to external tools. The decomposer describes what tools each agent needs in plain English — Coven handles everything else automatically.

## How it works

1. The Decomposer assigns `query_tool` entries to nodes that need external capabilities
2. Before each tool-using node executes, `MCPNodeBuilder` calls ToolStorePy
3. ToolStorePy semantically searches a tool index and builds a real MCP server
4. The MCP server path and port are injected into the agent's context
5. The agent can then use the tools to complete its task

```
node.query_tool = [
    {"tool_description": "evaluate a mathematical arithmetic expression"},
    {"tool_description": "convert between units of measurement"},
]
            │
            ▼
    ToolStorePy semantic search
            │
            ▼
    MCP server built at workspace/mcp/<node_id>/mcp_unified_server.py
            │
            ▼
    Agent receives server path + port in its context message
```

## Writing good tool descriptions

ToolStorePy uses semantic similarity to match your description against a curated tool index. Write descriptions as capability sentences, not tool names:

| ✅ Do this | ❌ Not this |
|---|---|
| `"evaluate a mathematical arithmetic expression securely"` | `"calculator"` |
| `"convert between different units of measurement like length and temperature"` | `"use numpy"` |
| `"calculate cryptographic hash of a file or encode decode base64 text"` | `"crypto library"` |
| `"get current weather conditions temperature and humidity for a city"` | `"weather API"` |
| `"preview rows or get summary statistics from a CSV or Excel file"` | `"data tool"` |

Be specific about the capability, not the implementation.

## When to use `query_tool`

Only add `query_tool` entries when the agent **genuinely needs** external data or computation:

**Use tools for:**
- Fetching real-time data (weather, stock prices, news)
- File I/O (reading CSVs, Excel files)
- Mathematical computation
- API calls to external services
- Cryptographic operations

**Don't use tools for:**
- Reasoning and analysis (just needs the LLM)
- Synthesizing text from existing context
- Formatting and structuring data already in the DAG

```python
# Agent that only reasons → no tools needed
Node(query_tool=[])

# Agent that needs to fetch market data → tools needed
Node(query_tool=[
    ToolQuery(tool_description="fetch financial market data and stock prices"),
])
```

## Custom tool index

By default, Coven uses the `"core-tools"` built-in index. You can point to your own:

```python
coven = Coven(
    model="gpt-4o",
    mcp_index_url="https://example.com/my-tool-index.zip",
)
```

## Isolated workspaces

Each node with tools gets its own workspace under `<workspace>/mcp/<node_id>/`. This means:
- Parallel nodes never conflict during builds
- Each node's `queries.json` is independent
- MCP server files are isolated per node

## Security scanning

Enable LLM-based security review of tool repositories before they're built:

```python
coven = Coven(
    model="gpt-4o",
    mcp_llm_scan=True,
    mcp_llm_model="claude-sonnet-4-6",
)
```

The scanner reviews each tool repo autonomously — no human prompts required.

## What gets injected into the agent

When a node's MCP server is ready, its user message includes:

```json
{
  "mcp_tools": {
    "server_path": "/path/to/workspace/mcp/node_id/mcp_unified_server.py",
    "server_port": 8101,
    "available_tools": [
      "evaluate a mathematical arithmetic expression securely"
    ],
    "instructions": "A ToolStorePy MCP server has been built for you..."
  }
}
```
