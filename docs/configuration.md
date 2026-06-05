---
id: configuration
title: Configuration
sidebar_position: 3
---

# Configuration

All configuration is passed to the `Coven` constructor.

```python
from coven import Coven

coven = Coven(
    model="gpt-4o",
    workspace="coven_workspace",
    mcp_index="core-tools",
    mcp_index_url=None,
    mcp_install_requirements=False,
    mcp_host="0.0.0.0",
    mcp_base_port=8100,
    mcp_llm_scan=False,
    mcp_llm_model="claude-sonnet-4-6",
    mcp_verbose=False,
)
```

## Parameters

### `model`

**Type:** `str`  **Default:** `"gpt-4o"`

Any [LiteLLM-compatible model string](https://docs.litellm.ai/docs/providers). This model is used for all pipeline stages — Decomposer, Graph Builder, Compiler, and every domain agent.

```python
Coven(model="gpt-4o")
Coven(model="claude-sonnet-4-6")
Coven(model="azure/gpt-4o")
Coven(model="gemini/gemini-1.5-pro")
```

### `workspace`

**Type:** `str | Path`  **Default:** `"coven_workspace"`

Root directory for all run artifacts and MCP server workspaces. Created automatically if it doesn't exist. Each node with tools gets its own subdirectory under `<workspace>/mcp/<node_id>/`.

### `mcp_index`

**Type:** `str | None`  **Default:** `"core-tools"`

The built-in [ToolStorePy](https://pypi.org/project/toolstorepy/) index to use for tool lookup. Set to `None` if you're providing a custom `mcp_index_url`.

### `mcp_index_url`

**Type:** `str | None`  **Default:** `None`

Direct URL to a custom ToolStorePy index ZIP. When set, overrides `mcp_index`.

```python
coven = Coven(
    model="gpt-4o",
    mcp_index_url="https://example.com/my-tool-index.zip",
)
```

### `mcp_install_requirements`

**Type:** `bool`  **Default:** `False`

Whether to install the tool repository's `requirements.txt` into an isolated venv during MCP server build. Set to `True` for tool repos with external dependencies.

### `mcp_host`

**Type:** `str`  **Default:** `"0.0.0.0"`

Host address MCP servers bind to. Change to `"127.0.0.1"` if you want servers only accessible locally.

### `mcp_base_port`

**Type:** `int`  **Default:** `8100`

Starting port for MCP servers. Each node that gets a server is assigned the next available port, incrementing from this base. Ensure the port range `[mcp_base_port, mcp_base_port + N]` is open when running pipelines with many tool-using nodes.

### `mcp_llm_scan`

**Type:** `bool`  **Default:** `False`

When `True`, uses an LLM to autonomously review each tool repository for security concerns before building the MCP server. No human prompts — fully automated. Useful for pipelines that pull from untrusted tool sources.

### `mcp_llm_model`

**Type:** `str`  **Default:** `"claude-sonnet-4-6"`

The model used for LLM security scanning (only active when `mcp_llm_scan=True`). Any LiteLLM/LangChain model string works.

### `mcp_verbose`

**Type:** `bool`  **Default:** `False`

Enable verbose logging from ToolStorePy during MCP server builds. Useful for debugging tool retrieval and build failures.

---

## Environment variables

Coven loads environment variables via [python-dotenv](https://github.com/theskumar/python-dotenv). Create a `.env` file in your working directory:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Azure OpenAI (optional)
AZURE_API_KEY=...
AZURE_API_BASE=...
AZURE_API_VERSION=...
```

---

## Configuration patterns

### Minimal (OpenAI, no tools)

```python
coven = Coven(model="gpt-4o")
```

### Anthropic with verbose tool builds

```python
coven = Coven(
    model="claude-sonnet-4-6",
    mcp_verbose=True,
    mcp_install_requirements=True,
)
```

### Custom tool index with security scanning

```python
coven = Coven(
    model="gpt-4o",
    mcp_index_url="https://example.com/my-tool-index.zip",
    mcp_llm_scan=True,
    mcp_llm_model="claude-sonnet-4-6",
)
```

### High-parallelism pipeline (many nodes, many ports)

```python
coven = Coven(
    model="gpt-4o",
    mcp_base_port=9000,   # start from port 9000
    workspace="/tmp/coven_runs",
)
```
