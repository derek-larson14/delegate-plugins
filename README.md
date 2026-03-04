# Delegate Plugins

Slash commands for running your life with Claude. Task processing, voice notes, email, calendar, weekly reviews, and more.

Learn more at [Delegate with Claude](https://delegatewithclaude.com).

## Install

### Claude Code

```
/plugin marketplace add derek-larson14/delegate-plugins
/plugin install delegate
```

### Co-Work

1. Click **Customize** > **Browse Plugins**
2. Go to the **Personal** tab
3. Click **Add marketplace from GitHub**
4. Paste: `derek-larson14/delegate-plugins`
5. Install the plugins you want

## Plugins

### [delegate](plugins/delegate/)

The full toolkit for Claude Code. Task processing, voice routing, email, messages, calendar, weekly reviews, and more.

- `/delegate` -- Hand off tasks to Claude
- `/morning` -- What to focus on today
- `/weekly` -- Review the week, plan what's next
- `/voice` -- Process voice notes into tasks, ideas, file edits
- `/meeting` -- Ask questions about your meeting notes
- `/calendar` -- Check schedule, find open time (Mac only)
- `/mail` -- Read and search email (Mac only)
- `/messages` -- Search messages across WhatsApp, iMessage, Slack, etc.
- `/drive` -- Browse, search, download from Google Drive
- `/editors` -- Multiple AI reviewers critique your writing in parallel
- `/push` -- Auto-commit and push changes

New to this? Download the [delegate-workspace](https://github.com/derek-larson14/delegate-workspace) to get started with a ready-made folder and placeholder files.

### [delegate-cowork](plugins/delegate-cowork/)

The same workflows adapted for Co-Work. Uses MCP connectors (Calendar, Gmail, GitHub, Granola) instead of macOS tools.

- `/delegate-cowork:delegate` -- Hand off tasks to Claude
- `/delegate-cowork:morning` -- Morning brief with Calendar + Gmail
- `/delegate-cowork:weekly` -- Weekly review with GitHub + Calendar + Gmail
- `/delegate-cowork:meeting` -- Meeting notes via Granola or Calendar
- `/delegate-cowork:mail` -- Email via Gmail connector
- `/delegate-cowork:calendar` -- Events via Calendar connector
- `/delegate-cowork:editors` -- Multi-perspective writing feedback
- `/delegate-cowork:research` -- Deep web research

### [dispatch](plugins/dispatch/)

Take action on voice memos recorded with [Dispatch](https://dispatch.newyorkai.org). Claude reads transcripts and starts working. Works in both Claude Code and Co-Work.

- `/dispatch:work` -- Read transcripts and execute
- `/dispatch:route` -- Route ideas to the right files

---

By [Derek Larson](https://dtlarson.com). MIT License.
