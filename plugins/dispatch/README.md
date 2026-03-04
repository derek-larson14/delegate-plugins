# dispatch

Take action on voice memos recorded with [Dispatch](https://dispatch.newyorkai.org).

Claude reads transcripts and starts working. Works in Claude Code and Co-Work. Reads from Google Drive (via MCP) or a local folder.

## Install

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install dispatch
```

## Commands

| Command | What it does |
|---|---|
| `setup` | Connect Google Drive and schedule automatic transcription |
| `work` | Read transcripts and execute — research, analysis, code, summaries |
| `voice` | Route transcripts to the right files in your workspace |

## Transcript Sources (auto-detected)

1. **Google Drive MCP** — reads directly from Drive. Connect at [claude.ai/settings/connectors](https://claude.ai/settings/connectors). In Co-Work, Drive is a built-in connector.
2. **rclone** — syncs Drive to a local folder. Run `/dispatch:setup` to install and configure.
3. **Local folder** — any folder with transcript `.md` files.
