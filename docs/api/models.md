---
id: models
title: Models
sidebar_position: 2
---

# Models

All models are importable from `coven.models`:

```python
from coven.models import DAG, DAGStatus, Node, NodeType, NodeStatus, Artifact
from coven.models.node import ToolQuery
```

---

## `Artifact`

```python
class Artifact(BaseModel):
    name: str
    description: str
    contributors: list[str] = []
    users: list[str] = []
    body: dict[str, Any] = {}
```

| Field | Type | Description |
|---|---|---|
| `name` | `str` | Unique snake_case identifier |
| `description` | `str` | What this artifact contains |
| `contributors` | `list[str]` | Node IDs of agents that write to this artifact |
| `users` | `list[str]` | Node IDs of agents that read from this artifact |
| `body` | `dict` | Free-form JSON payload, populated at runtime |

---

## `ToolQuery`

```python
class ToolQuery(BaseModel):
    tool_description: str
```

A single plain-English description of an external tool capability. Used in `Node.query_tool` to build MCP servers via ToolStorePy.

---

## `Node`

```python
class Node(BaseModel):
    id: str
    name: str
    node_type: NodeType
    system_prompt: str
    query_tool: list[ToolQuery] = []
    input_artifacts: list[str] = []
    output_artifacts: list[str] = []
    status: NodeStatus = NodeStatus.PENDING
    result: dict[str, Any] = {}
    contributor_system_prompts: list[str] = []
    mcp_server_path: str | None = None
    mcp_server_port: int | None = None
```

---

## `NodeType`

```python
class NodeType(str, Enum):
    DECOMPOSER  = "decomposer"
    DOMAIN      = "domain"
    SYNTHESIZER = "synthesizer"
    COMPILER    = "compiler"
```

---

## `NodeStatus`

```python
class NodeStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    COMPLETED = "completed"
    FAILED    = "failed"
```

---

## `DAG`

```python
class DAG(BaseModel):
    id: str
    task: str
    nodes: dict[str, Node] = {}
    artifacts: dict[str, Artifact] = {}
    levels: list[list[str]] = []
    status: DAGStatus = DAGStatus.PLANNED
    final_output: dict[str, Any] = {}
```

### Methods

| Method | Signature | Description |
|---|---|---|
| `get_node` | `(node_id: str) → Node` | Returns node or raises `KeyError` |
| `get_artifact` | `(artifact_name: str) → Artifact` | Returns artifact or raises `KeyError` |
| `get_input_artifacts` | `(node_id: str) → list[Artifact]` | All input artifacts for a node |
| `get_output_artifacts` | `(node_id: str) → list[Artifact]` | All output artifacts for a node |
| `is_complete` | `() → bool` | `True` if all nodes are `COMPLETED` |

### Validation

The `DAG` model validator checks that every `contributor` and `user` referenced in artifacts matches a real node ID. A `ValueError` is raised on construction if references are broken.

---

## `DAGStatus`

```python
class DAGStatus(str, Enum):
    PLANNED   = "planned"
    RUNNING   = "running"
    COMPLETED = "completed"
    FAILED    = "failed"
```
