---
id: coven-class
title: Coven Class
sidebar_position: 1
---

# `Coven`

Top-level orchestrator for the pipeline.

```python
from coven import Coven
```

## Constructor

```python
Coven(
    model: str = "gpt-4o",
    workspace: str | Path = "coven_workspace",
    mcp_index: str | None = "core-tools",
    mcp_index_url: str | None = None,
    mcp_install_requirements: bool = False,
    mcp_host: str = "0.0.0.0",
    mcp_base_port: int = 8100,
    mcp_llm_scan: bool = False,
    mcp_llm_model: str = "claude-sonnet-4-6",
    mcp_verbose: bool = False,
)
```

See [Configuration](../configuration) for full parameter docs.

---

## `await coven.run(task)`

Execute the full pipeline for a given task.

**Signature:**
```python
async def run(self, task: str) -> DAG
```

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `task` | `str` | The complex task to solve, in plain English |

**Returns:** `DAG` — fully executed DAG with `final_output` populated (or `DAGStatus.FAILED` if a node failed).

**Example:**

```python
dag = await coven.run("Produce a go-to-market strategy for a B2B SaaS product")

if dag.status == DAGStatus.COMPLETED:
    print(coven.to_text(dag))
else:
    # Check which nodes failed
    for node_id, node in dag.nodes.items():
        if node.status == NodeStatus.FAILED:
            print(f"Failed: {node_id} — {node.result.get('error')}")
```

---

## `coven.to_text(dag)`

Render the compiled DAG output as plain text.

**Signature:**
```python
def to_text(self, dag: DAG) -> str
```

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `dag` | `DAG` | A completed DAG returned by `coven.run()` |

**Returns:** `str` — formatted plain text output, or `"Pipeline did not produce a final output."` if `dag.final_output` is empty.

**Example:**

```python
text = coven.to_text(dag)
print(text)
```

---

## Full example

```python
import asyncio
from coven import Coven, DAGStatus

async def main():
    coven = Coven(
        model="claude-sonnet-4-6",
        workspace="./my_workspace",
    )

    dag = await coven.run(
        "Analyze the competitive landscape for a no-code workflow automation tool"
    )

    if dag.status == DAGStatus.FAILED:
        print("Pipeline failed.")
        return

    # Plain text output
    print(coven.to_text(dag))

    # Structured access
    print(dag.final_output["title"])
    print(dag.final_output["summary"])

    for section in dag.final_output["sections"]:
        print(f"\n## {section['title']}")
        print(section["content"])

asyncio.run(main())
```
