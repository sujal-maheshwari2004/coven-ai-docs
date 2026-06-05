---
id: executor
title: Executor
sidebar_position: 4
---

# Executor

**Stage 4.** The Executor iterates through topological levels in order. Within each level, all nodes are launched concurrently via `asyncio.gather()`.

## Execution flow

```
for each level:
    asyncio.gather(run_node(n) for n in level)
    if any node in level FAILED → halt pipeline
write final artifact bodies → DAG
```

## Per-node MCP server builds

For any node with non-empty `query_tool`, `AgentRunner` calls `MCPNodeBuilder.build_for_node()` **before** the LLM call. This:

1. Creates an isolated workspace at `<workspace>/mcp/<node_id>/`
2. Writes `queries.json` with the tool descriptions
3. Calls [ToolStorePy](https://pypi.org/project/toolstorepy/) to semantically search the tool index and build an MCP server
4. Stores the server path and port on the node

MCP builds within the same level also run concurrently. ToolStorePy's blocking `build()` call is wrapped in `run_in_executor` so it never blocks the event loop.

## Node types at execution time

### `DOMAIN` nodes

Standard LLM call with:
- All input artifact bodies as context
- Expected output artifact names
- MCP server path and tool descriptions (if tools were requested)

The agent returns `{"outputs": {"artifact_name": {...body...}}}` and each body is written to the `ArtifactStore`.

### `SYNTHESIZER` nodes

Delegates to `SynthesizerAgent` with:
- All partial artifact bodies (one per contributing agent)
- The target artifact definition
- Contributing agents' system prompts

The merged body is written back to the target artifact in the store.

## ArtifactStore

The `ArtifactStore` is a shared in-memory store initialized at the start of execution. It is thread-safe via `asyncio.Lock`.

```python
# Agents write outputs
await store.put("market_report", {"size": "4.2B", ...})

# Downstream agents read inputs
artifacts = await store.get_many(["market_report", "competitor_data"])
```

At the end of all levels, the full store snapshot is written back into the DAG's `artifacts` dict for the Compiler to consume.

## Failure behavior

If any node in a level returns `NodeStatus.FAILED`, the executor halts immediately and returns `DAGStatus.FAILED`. Subsequent levels never execute. The partially-executed DAG is still returned so callers can inspect which nodes failed and why.

## Implementation

```
coven/initiator/
  executor.py       ← Level-wise asyncio.gather orchestration
  agent_runner.py   ← Per-node MCP build + LLM call
  artifact_store.py ← Shared in-memory artifact store with async lock
```
