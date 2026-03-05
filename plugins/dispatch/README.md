# dispatch

Take action on voice memos recorded with [Dispatch](https://dispatch.newyorkai.org).

Claude reads transcripts and starts working. Works in Claude Code and Co-Work. Reads from Google Drive (via MCP) or a local folder.

## Install

### Claude Code (CLI)

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install dispatch@delegate-plugins
```

### Co-Work (GUI)

1. Click **Customize** > **Browse Plugins**
2. Go to the **Personal** tab
3. Click **Add marketplace from GitHub**
4. Paste: `derek-larson14/delegate-plugins`
5. Install **dispatch**

## Commands

| Command | What it does |
|---|---|
| `work` | Read transcripts and execute -- research, analysis, code, summaries |
| `route` | Route transcripts to the right files in your workspace |

## Transcript Sources (auto-detected)

1. **Google Drive MCP** -- reads directly from Drive. Connect at [claude.ai/settings/connectors](https://claude.ai/settings/connectors). In Co-Work, Drive is a built-in connector.
2. **rclone** -- syncs Drive to a local folder. Both `work` and `route` run setup on first use if needed.
3. **Local folder** -- any folder with transcript `.md` files.
