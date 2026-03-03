# delegate

Run your life from markdown files. Plugin version of [Delegate with Claude](https://delegatewithclaude.com).

Built for local Claude Code with Obsidian. **Co-Work users:** see the [dispatch plugin](../dispatch/) instead.

## Install

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install delegate
```

## Commands

| Command | What it does | Platform |
|---|---|---|
| `delegate` | Process delegation.md task queue | All |
| `delegate-auto` | Autonomous delegation (scheduled) | All |
| `voice` | Route voice.md entries to files | All |
| `push` | Git commit/push with auto message | All |
| `editors` | Multi-perspective writing feedback | All |
| `meeting` | Search meeting notes | All |
| `weekly` | Weekly review | All |
| `drive` | Browse Google Drive via rclone | All |
| `calendar` | Calendar via icalBuddy | Mac |
| `mail` | Email via Mail.app | Mac |
| `messages` | Messages via Beeper Desktop | Mac |
| `morning` | Morning brief (calendar + mail + tasks) | Mac |
| `setup-transcription` | Voice memo transcription pipeline | Mac |

## Workspace Files

Commands expect: `delegation.md`, `tasks.md`, `voice.md`, `roadmap.md`. Get them from [delegate-workspace](https://github.com/derek-larson14/delegate-workspace) or create your own.
