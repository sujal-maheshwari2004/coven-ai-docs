---
id: examples
title: Examples
sidebar_position: 8
---

# Examples

## Go-to-market strategy

```python
import asyncio
from coven import Coven

async def main():
    coven = Coven(model="gpt-4o")
    dag = await coven.run("Produce a go-to-market strategy for a B2B SaaS product targeting mid-market companies")
    print(coven.to_text(dag))

asyncio.run(main())
```

## Research report

```python
import asyncio
from coven import Coven

async def main():
    coven = Coven(model="claude-sonnet-4-6")
    dag = await coven.run("Write a comprehensive research report on LLM inference optimization techniques in 2024")
    print(coven.to_text(dag))

asyncio.run(main())
```

## Competitive analysis

```python
import asyncio
from coven import Coven

async def main():
    coven = Coven(model="gpt-4o")
    dag = await coven.run(
        "Produce a competitive analysis for a no-code workflow automation tool "
        "targeting small businesses, covering market positioning, pricing, and feature gaps"
    )

    # Access structured output directly
    output = dag.final_output
    print(f"Title: {output['title']}")
    print(f"\nSummary:\n{output['summary']}")

    for section in output['sections']:
        print(f"\n## {section['title']}")
        print(section['content'])
        print(f"  Sources: {', '.join(section['source_artifacts'])}")

    if output['recommendations']:
        print("\n## Recommendations")
        for i, rec in enumerate(output['recommendations'], 1):
            print(f"  {i}. {rec}")

asyncio.run(main())
```

## With a custom tool index

```python
import asyncio
from coven import Coven

async def main():
    coven = Coven(
        model="gpt-4o",
        mcp_index_url="https://example.com/my-tool-index.zip",
        mcp_install_requirements=True,
        mcp_verbose=True,
    )
    dag = await coven.run("Analyze sales data from the attached CSV and produce a performance summary")
    print(coven.to_text(dag))

asyncio.run(main())
```

## Inspecting node and artifact state

```python
import asyncio
from coven import Coven, NodeStatus, DAGStatus

async def main():
    coven = Coven(model="gpt-4o")
    dag = await coven.run("Produce a product launch plan for a developer tool")

    print(f"Pipeline status: {dag.status.value}")
    print(f"Execution levels: {len(dag.levels)}")
    print()

    print("── Node statuses ───────────────────────────────")
    for node_id, node in dag.nodes.items():
        mcp = f" (MCP port {node.mcp_server_port})" if node.mcp_server_port else ""
        print(f"  {node_id}: {node.status.value}{mcp}")

    print()
    print("── Artifact bodies ─────────────────────────────")
    for name, artifact in dag.artifacts.items():
        if "__partial__" not in name and artifact.body:
            print(f"  {name}: {list(artifact.body.keys())}")

asyncio.run(main())
```

## Error handling

```python
import asyncio
from coven import Coven, NodeStatus, DAGStatus

async def main():
    coven = Coven(model="gpt-4o")
    dag = await coven.run("Complex research task...")

    if dag.status == DAGStatus.FAILED:
        failed = [
            (node_id, node.result.get("error", "unknown"))
            for node_id, node in dag.nodes.items()
            if node.status == NodeStatus.FAILED
        ]
        for node_id, error in failed:
            print(f"Node '{node_id}' failed: {error}")
        return

    print(coven.to_text(dag))

asyncio.run(main())
```

## CLI usage

```bash
# Use the bundled main.py entry point
uv run main.py "Produce a competitive analysis for a B2B SaaS product"

# Specify a model
uv run main.py "Write a research report on transformer architectures" claude-sonnet-4-6

# Any LiteLLM model string works
uv run main.py "Analyze the AI chip market landscape" gemini/gemini-1.5-pro
```
