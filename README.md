# Delegate Plugins

Claude Code plugins for delegation workflows and voice processing.

## Install

### Claude Code (CLI)

```
/plugin marketplace add derek-larson14/delegate-plugins
```

Then install individual plugins:

```
/plugin install delegate
/plugin install dispatch
/plugin install delegate-cowork
```

### Co-Work (GUI)

1. Click **Customize** in the left sidebar
2. Click **Browse Plugins**
3. Go to the **Personal** tab
4. Click **Add marketplace from GitHub**
5. Paste: `derek-larson14/delegate-plugins`
6. Install the plugins you want

## Plugins

### [delegate](plugins/delegate/)

13 commands for task processing, voice routing, email, messages, calendar, and more. Built for Claude Code on macOS with Obsidian.

### [delegate-cowork](plugins/delegate-cowork/)

8 commands for Co-Work -- task processing, morning briefs, weekly reviews, meetings, email, calendar, writing feedback, and research. Uses MCP connectors instead of macOS tools.

### [dispatch](plugins/dispatch/)

Take action on voice memos recorded with [Dispatch](https://dispatch.newyorkai.org). Claude reads transcripts and starts working. Works in both Claude Code and Co-Work.
