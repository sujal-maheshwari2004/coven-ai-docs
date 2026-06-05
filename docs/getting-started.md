---
id: getting-started
title: Getting Started
sidebar_position: 1
---

# Getting Started

Coven is a multi-agent DAG pipeline framework. Give it a task in plain English — it spawns specialized agents, builds a dependency graph, executes agents in parallel, and compiles a final output.

## Installation

```bash
pip install coven-ai
```

**Requirements:** Python ≥ 3.12 and an API key for any [LiteLLM-supported model](https://docs.litellm.ai/docs/providers).

## Set your API key

Copy `.env.example` to `.env` and fill in your key:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Coven uses [LiteLLM](https://github.com/BerriAI/litellm) under the hood — any provider it supports works.

## Quick start

### Python

```python
import asyncio
from coven import Coven

async def main():
    coven = Coven(model="gpt-4o")
    dag   = await coven.run("Produce a go-to-market strategy for a B2B SaaS product")
    print(coven.to_text(dag))

asyncio.run(main())
```

### CLI

```bash
# default model (gpt-4o)
uv run main.py "Produce a competitive analysis for a B2B SaaS product"

# specify a model
uv run main.py "Write a research report on LLM inference optimization" claude-sonnet-4-6
```

## Sample output

`coven.to_text(dag)` renders the compiled result to plain text:

```
============================================================
GO-TO-MARKET STRATEGY: B2B SAAS PRODUCT
============================================================

Executive summary of what was produced...

── Market Analysis ─────────────────────────────────────────
Market sizing, segments, and growth trends...
  [sources: market_analysis_report]

── Competitive Landscape ───────────────────────────────────
Competitor analysis and positioning gaps...
  [sources: competitive_analysis]

── Recommendations ─────────────────────────────────────────
  1. Target mid-market first — faster sales cycles
  2. Lead with integration story — buyers are already in the ecosystem

── Metadata ────────────────────────────────────────────────
  Agents: 6
  Artifacts: 8
============================================================
```

## Next steps

- Read [How It Works](./how-it-works) to understand the five-stage pipeline
- See [Configuration](./configuration) for all `Coven(...)` options
- Browse [Examples](./examples) for real-world usage patterns
