# dispatch

Claude Code plugin for processing voice transcripts from the [Dispatch](https://dispatch.newyorkai.org) app.

## Install

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install dispatch
```

## Commands

- **voice** — Process Dispatch voice transcripts and route ideas to the right files in your workspace

## How It Works

1. Record on your phone with Dispatch
2. Transcripts upload to Google Drive
3. Run `/dispatch:voice` to route ideas to tasks, docs, and project files

## Transcript Sources

The command auto-detects how to read your transcripts:

### Google Drive (via MCP) — works in Co-Work and Claude Code

If you have a Google Drive MCP connection configured, the command reads transcripts directly from Drive. No local sync needed.

**Setup in Claude Code:** Connect Google Drive at [claude.ai/settings/connectors](https://claude.ai/settings/connectors). The MCP tools automatically appear.

**Setup in Co-Work:** Google Drive is available as a built-in connector.

### Local folder — Claude Code only

If MCP isn't available, the command falls back to reading transcripts from a local folder. Works with Google Drive for Desktop, rclone, or any sync method that puts `.md` files on your disk.

## Works With Any Workspace

The command scans your project structure and routes ideas to where they fit:
- **Code repos** — creates or appends to TODO.md, docs, or wherever you choose
- **Notes workspaces** — routes to existing task files, project folders, and notes
- **Mixed projects** — adapts to whatever structure exists
