# delegate-cowork

Delegation workflows for Claude Co-Work. Task processing, morning briefs, weekly reviews, meetings, email, and calendar — powered by MCP connectors instead of macOS tools.

## Connectors

Enable these in your Co-Work settings for the full experience:

| Connector | Required? | Used by |
|-----------|-----------|---------|
| Google Calendar | Recommended | `/morning`, `/weekly`, `/meeting`, `/calendar` |
| Gmail | Recommended | `/morning`, `/weekly`, `/mail` |
| GitHub | Optional | `/weekly` |
| Granola | Optional | `/meeting` |

Every command gracefully handles missing connectors. At minimum, mount your workspace folder and have a `delegation.md` or `tasks.md`.

## Install

```
/plugin install delegate-cowork
```

## Commands

| Command | Description | Connectors |
|---------|-------------|------------|
| `/delegate` | Process delegation.md — autonomously handle Claude's task queue | None (pure file tools + web) |
| `/morning` | Morning brief — state of things, today's focus, blockers, people | Calendar, Gmail |
| `/weekly` | Weekly review as chief of staff — mechanical + emotional + strategic | GitHub, Calendar, Gmail |
| `/meeting` | Search and summarize meeting notes | Granola, Calendar |
| `/mail` | Search, read, and manage email | Gmail |
| `/calendar` | View events, check availability, analyze schedule | Calendar |
| `/editors` | Multi-perspective feedback on writing (parallel subagents) | None |
| `/research` | Deep web research — go wide, then go deep | None (WebSearch/WebFetch) |

## How it differs from `delegate`

The `delegate` plugin is built for **Claude Code on macOS** — it uses Bash, icalBuddy, AppleScript, and rclone to access your Mac's native apps.

`delegate-cowork` is built for **Co-Work** — it uses MCP connectors (Gmail, Google Calendar, GitHub, Granola) to access the same data through APIs. No macOS required, no shell scripts, no local tool dependencies.

The workflows are the same. The plumbing is different.

## Workspace setup

1. Mount your working folder in Co-Work
2. Have at minimum a `delegation.md` or `tasks.md` in the root
3. Optional: `roadmap.md`, `scratch/`, `archive/`, `ops/reference/` for richer context

Commands discover what's available and work with what they find.
