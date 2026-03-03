# dispatch

Turn voice notes into action with [Dispatch](https://dispatch.newyorkai.org).

Works in Claude Code and Co-Work. Reads transcripts from Google Drive (via MCP) or a local folder.

## Install

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install dispatch
```

## Commands

| Command | What it does |
|---|---|
| `work` | Read transcripts and execute — research, analysis, code, summaries |
| `voice` | Route transcripts to the right files in your workspace |

## Setup

**Google Drive (MCP):** Connect at [claude.ai/settings/connectors](https://claude.ai/settings/connectors). In Co-Work, Drive is a built-in connector.

**Local folder:** If no MCP, the commands ask for your transcript folder path on first run.
