# Delegate Plugins

Claude Code plugins for delegation workflows and voice processing.

## Install

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install delegate
/plugin install dispatch    # optional, for Dispatch users
```

## Plugins

### delegate

Full delegation toolkit. Commands:

| Command | What it does |
|---|---|
| `/delegate:delegate` | Process delegation.md task queue |
| `/delegate:delegate-auto` | Autonomous delegation (for scheduled runs) |
| `/delegate:voice` | Route voice notes from voice.md |
| `/delegate:morning` | Morning brief with tasks, calendar, email |
| `/delegate:weekly` | Weekly review as chief of staff |
| `/delegate:calendar` | View calendar via icalBuddy (Mac) |
| `/delegate:mail` | Read email via Mac Mail (Mac) |
| `/delegate:messages` | Access messages via Beeper Desktop |
| `/delegate:drive` | Browse/search Google Drive via rclone |
| `/delegate:push` | Git commit and push with auto-generated message |
| `/delegate:editors` | Multi-perspective writing feedback |
| `/delegate:meeting` | Search and summarize meeting notes |
| `/delegate:setup-transcription` | Set up voice memo transcription pipeline |

Platform: macOS for calendar, mail, and voice memos. Drive, delegation, and voice routing work everywhere.

### dispatch

Voice transcript processor for the [Dispatch](https://dispatch.newyorkai.org) app.

| Command | What it does |
|---|---|
| `/dispatch:voice` | Process Dispatch transcripts and route to workspace files |

Works on any platform.

## Updating

```
/plugin update delegate
/plugin update dispatch
```
