# delegate

Claude Code plugin for running your life from a set of markdown files. Built for local Claude Code on macOS, designed to work alongside Obsidian (or any editor where you read and edit your own files).

**Using Co-Work?** This plugin assumes you're editing markdown files locally. For a voice-first workflow that works in Co-Work, see the [dispatch plugin](../dispatch/).

## How It Works

You maintain a small set of markdown files — tasks, delegation queue, voice notes, meeting notes. Claude processes them: executing research, routing voice notes, reviewing your week, checking email and messages. The files are the interface between you and Claude.

This is the plugin version of the [Delegate with Claude](https://delegatewithclaude.com) workspace.

## Install

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install delegate
```

## Commands

### Works everywhere

These commands work on any platform. They need workspace files to be useful — run the [delegate-workspace](https://github.com/derek-larson14/delegate-workspace) setup or create the files yourself.

| Command | What it does | Needs |
|---|---|---|
| `delegate` | Process delegation.md task queue | `delegation.md`, `tasks.md` |
| `delegate-auto` | Autonomous delegation (scheduled runs) | `delegation.md`, `tasks.md` |
| `voice` | Route voice.md entries to the right files | `voice.md`, `tasks.md`, `delegation.md` |
| `push` | Git commit and push with auto-generated message | git repo |
| `editors` | Multi-perspective writing feedback | `reference/editors/` |
| `meeting` | Search and summarize meeting notes | `meetings/` folder |
| `weekly` | Weekly review as chief of staff | git history, task files |

### macOS only

These commands use macOS-specific tools (AppleScript, icalBuddy, Beeper Desktop, rclone). They won't work in Co-Work or on Linux/Windows.

| Command | What it does | Requires |
|---|---|---|
| `calendar` | View and query calendar events | icalBuddy (auto-installs via Homebrew) |
| `mail` | Read email from Mac Mail app | Mail.app + Automation permission |
| `messages` | Access messages across all platforms | Beeper Desktop + API token |
| `morning` | Morning brief with tasks, calendar, email | calendar + mail + task files |
| `drive` | Browse and download from Google Drive | rclone + OAuth |
| `setup-transcription` | Set up voice memo transcription pipeline | launchd, hear |

## Workspace Files

The delegation workflow depends on a few key files:

- **`delegation.md`** — Claude's task queue. You add items, Claude processes them.
- **`tasks.md`** — Your tasks. Things only you can do (decisions, messages, strategy).
- **`voice.md`** — Transcribed voice notes waiting to be routed.
- **`roadmap.md`** — Current priorities and timeline.

These files are your interface. You edit them in Obsidian (or any editor), then run commands to have Claude act on them.

If you're starting from scratch, clone the [delegate-workspace](https://github.com/derek-larson14/delegate-workspace) for the full setup with starter files, Obsidian plugins, and documentation. The plugin gives you the same commands without needing to clone the repo.

## Bundled Scripts

Scripts for mail, messages, drive, and transcription are included. No manual downloads needed.
