---
description: Set up Dispatch to run on a schedule — process transcripts automatically
allowed-tools: [Bash, Read, Write, Glob, AskUserQuestion]
---

# Schedule Dispatch

Set up automated processing of Dispatch transcripts on a recurring schedule.

## Before you start

**Read this.** Running Dispatch on a schedule means voice transcripts flow into an AI agent that reads files, writes files, and (with `work`) executes code — all without you watching. That's the point, but it comes with real risks:

- Voice transcripts pass through an external pipeline before they reach your agent. If that pipeline is compromised, injected instructions could be executed automatically.
- The `work` and `route` commands include prompt injection scanning, but no scan is perfect. A well-crafted injection could slip through.
- On a schedule with no human review, a bad transcript gets processed before you see it.

**Mitigations:**
- Use `dispatch:route` instead of `dispatch:work` if you want a lighter touch — it only appends to markdown files, never touches code.
- Review the `.dispatch/` logs periodically.
- Install [Claude Guard](https://github.com/derek-larson14/claude-guard) for an additional security layer that monitors agent actions.
- Keep your Dispatch app updated — newer versions include tighter on-device validation.

If you're not comfortable with unattended execution, skip this and run `/dispatch:work` or `/dispatch:route` manually when you're ready.

## Step 1: Choose the command

Ask the user:

**"Which command should run on the schedule?"**
- **`dispatch:work`** — reads transcripts AND executes (research, code, file changes). More powerful, more risk.
- **`dispatch:route`** — reads transcripts and routes ideas to files. No code execution. Safer for unattended use.

## Step 2: Choose a frequency

Ask the user:

**"How often should it run?"**

Suggest based on their usage:
- **Every 30 minutes** — good if you dispatch throughout the day and want fast turnaround
- **Every hour** — balanced, most common
- **A few times a day** (e.g., 9am / 1pm / 6pm) — good if you batch dispatches
- **Once a day** (e.g., 9am) — low frequency, process overnight dispatches in the morning

Default recommendation: every hour during waking hours (8am–10pm).

## Step 3: Detect environment

Determine whether this is Claude Code (CLI) or Co-Work (GUI).

Check for CLI indicators:
- Does the `Bash` tool work? If yes, this is Claude Code.
- If Bash is not available, this is likely Co-Work.

### Co-Work path

Walk the user through setting up a scheduled session:

1. Go to **Customize** in the left sidebar
2. Click **Scheduled Sessions**
3. Click **New Session**
4. Set the command to `/dispatch:work` or `/dispatch:route` (whichever they chose)
5. Set the schedule to their chosen frequency
6. Optionally set a workspace/project context so the command runs in the right place

Tell them: "Co-Work handles the rest. Your transcripts will be processed on that schedule and you'll see results in the session history."

Then stop — no script or plist needed for Co-Work.

### Claude Code path

Continue to Step 4.

## Step 4: Create the script (Claude Code only)

Determine the workspace path (current working directory).

Determine which command to use based on Step 1:
- `dispatch:work` → use `/dispatch:work`
- `dispatch:route` → use `/dispatch:route`

Write a shell script to the dispatch plugin's scripts directory. Use the workspace path and selected command:

```bash
#!/bin/bash
# Dispatch auto-processing
# Runs on schedule via launchd — no human input required

WORKSPACE="WORKSPACE_PATH_HERE"
cd "$WORKSPACE" || exit 1

DISPATCH_DIR=".dispatch"
LOG="$DISPATCH_DIR/auto.log"
mkdir -p "$DISPATCH_DIR"

# Only run between 8am and 10pm
HOUR=$(date +%H)
if [ "$HOUR" -lt 8 ] || [ "$HOUR" -ge 22 ]; then
    echo "$(date): Outside active hours, skipping" >> "$LOG"
    exit 0
fi

# Find claude binary
CLAUDE=$(which claude 2>/dev/null || echo "$HOME/.local/bin/claude")
if [ ! -f "$CLAUDE" ]; then
    echo "$(date): Claude CLI not found" >> "$LOG"
    exit 1
fi

echo "$(date): Starting dispatch processing" >> "$LOG"

# Run Claude with timeout — a hung process blocks launchd from re-running
TMPOUT=$(mktemp)
$CLAUDE -p "COMMAND_HERE" --max-turns 25 --dangerously-skip-permissions >"$TMPOUT" 2>&1 &
CLAUDE_PID=$!

# Kill after 10 minutes
( sleep 600; kill $CLAUDE_PID 2>/dev/null ) &
TIMER_PID=$!

wait $CLAUDE_PID
EXIT_CODE=$?
kill $TIMER_PID 2>/dev/null

OUTPUT=$(cat "$TMPOUT")
rm -f "$TMPOUT"

if [ $EXIT_CODE -eq 137 ] || [ $EXIT_CODE -eq 143 ]; then
    echo "$(date): Timed out after 10 minutes" >> "$LOG"
    exit 1
fi

if [ $EXIT_CODE -ne 0 ]; then
    echo "$(date): Failed (exit code $EXIT_CODE)" >> "$LOG"
    echo "$OUTPUT" | grep -i "error\|fail\|401\|403\|timeout" | head -3 >> "$LOG"
    exit 1
fi

echo "$(date): Complete" >> "$LOG"
```

Replace `WORKSPACE_PATH_HERE` with the actual workspace path. Replace `COMMAND_HERE` with `/dispatch:work` or `/dispatch:route`.

Write the script to `.dispatch/dispatch-auto.sh` in the workspace and make it executable.

## Step 5: Create and load the launchd plist (Claude Code only)

Generate a plist at `~/Library/LaunchAgents/com.dispatch.auto.plist`.

Use `StartCalendarInterval` (not `StartInterval` — it stalls during sleep/wake cycles on battery).

Build the schedule array from the user's choice in Step 2. For "every hour" between 8am and 10pm:

```xml
<key>StartCalendarInterval</key>
<array>
    <dict><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
    <!-- ... through hour 21 ... -->
</array>
```

For "every 30 minutes" add both :00 and :30 entries for each hour. For specific times, add just those entries.

Full plist template:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.dispatch.auto</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>SCRIPT_PATH_HERE</string>
    </array>
    <key>StartCalendarInterval</key>
    SCHEDULE_HERE
    <key>StandardOutPath</key>
    <string>/tmp/dispatch-auto.stdout</string>
    <key>StandardErrorPath</key>
    <string>/tmp/dispatch-auto.stderr</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:HOME/.local/bin</string>
        <key>HOME</key>
        <string>HOME</string>
    </dict>
</dict>
</plist>
```

Replace placeholders with actual values. Validate with `plutil -lint`, then load:

```bash
launchctl load ~/Library/LaunchAgents/com.dispatch.auto.plist
```

Verify:
```bash
launchctl list | grep com.dispatch.auto
```

## Step 6: Confirm

Report what was set up:
- Command: `dispatch:work` or `dispatch:route`
- Schedule: what they chose
- Where: Co-Work scheduled session or launchd plist path
- Logs: `.dispatch/auto.log` (Claude Code) or session history (Co-Work)

Offer to run it once now to verify it works:
- Claude Code: `launchctl kickstart gui/$(id -u)/com.dispatch.auto`
- Co-Work: "You can trigger it manually by running `/dispatch:work` or `/dispatch:route` right now."
