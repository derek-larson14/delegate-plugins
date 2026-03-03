# dispatch

Claude Code plugin for [Dispatch](https://dispatch.newyorkai.org) — turn voice notes into action.

## Install

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install dispatch
```

## Commands

### /dispatch:work

Read your voice transcripts and start working on them. Research, analysis, code, file organization — everything actionable gets done immediately. User-only items (decisions, messages to send) get surfaced in a summary.

Works with Google Drive (via MCP) or a local transcript folder.

### /dispatch:voice

Route voice transcripts to the right files in your workspace. For when you want to sort ideas into existing docs rather than execute on them immediately.

## How It Works

1. Record on your phone with Dispatch
2. Transcripts upload to Google Drive
3. Run `/dispatch:work` — Claude reads the transcripts, does the research, writes the outputs
4. Or run `/dispatch:voice` — Claude routes ideas to your task files, docs, and project folders

## Transcript Sources

### Google Drive (via MCP)

The commands read transcripts directly from Google Drive. No local sync needed.

- **Claude Code:** Connect Google Drive at [claude.ai/settings/connectors](https://claude.ai/settings/connectors)
- **Co-Work:** Google Drive is available as a built-in connector

### Local folder (fallback)

If MCP isn't available, the commands fall back to reading from a local folder. Works with Google Drive for Desktop, rclone, or any sync method.

## What /dispatch:work Does

When you run `/dispatch:work`, Claude:

- Reads all new transcripts since the last run
- Pulls context from your workspace and Google Drive
- Executes actionable items (research, analysis, code, summaries)
- Writes outputs to files you can find later
- Surfaces decisions and user-only items in a summary

Think of it as a chief of staff that listens to your voice memos and gets to work.
