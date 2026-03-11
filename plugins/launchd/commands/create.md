---
description: Create a new LaunchAgent — guided setup with schedule, script, and best practices
allowed-tools: [Bash, Read, Write, Glob, AskUserQuestion]
---

# Create a LaunchAgent

Walk the user through creating a new scheduled LaunchAgent. Show existing agents as examples, then build a new one interactively.

## Step 1: Show existing agents as examples

Read the current agents to show patterns:

```bash
launchctl list | grep -E "com\.(claude|exec|dispatch)" 2>/dev/null
```

For each loaded agent, show a high-level summary:
- **Name** (humanized label)
- **Schedule** (e.g., "9am/3pm/9pm daily", "every hour at :05", "8:15am daily")
- **What it does** (one line — read the description from `~/.cache/launchd-dashboard/descriptions.json` if it exists, otherwise infer from the label)

Do NOT show script contents, file paths, API keys, or personal details. Just the pattern: name, schedule, purpose.

Present these as "Here are your current agents for reference."

## Step 2: Ask what they want

Use AskUserQuestion to ask:

**"What should this agent do?"**

Get a plain-language description. Examples: "run my test suite every morning", "check for new emails every 30 minutes", "back up my notes at midnight".

## Step 3: Ask about schedule

Based on their answer, suggest a schedule and confirm. Use AskUserQuestion:

**"How often should it run?"**

Options to suggest based on their use case:
- **Specific times** (e.g., 9am daily, 9am/3pm/9pm) → StartCalendarInterval
- **Every N minutes/hours** → StartCalendarInterval with Minute intervals (preferred over StartInterval — more reliable on macOS, especially on battery)
- **On login/boot** → RunAtLoad
- **When a file changes** → WatchPaths

Always prefer StartCalendarInterval over StartInterval. StartInterval stalls during sleep/wake cycles on battery.

## Step 4: Ask about the script

Use AskUserQuestion:

**"What command or script should it run?"**

If they describe something that needs a script, offer to create one at `~/Github/exec/ops/scripts/scheduled/[name].sh`.

If it involves Claude, add these to the script:
- 10-minute timeout (background process + sleep/kill pattern, since macOS has no `timeout` command)
- Unset CLAUDECODE env var
- Use `--effort low/medium/high` to control cost
- Use `--allowed-tools` to restrict tool access

## Step 5: Choose a label

Generate a label following the existing convention:
- `com.claude.[name]` — for agents that run Claude
- `com.exec.[name]` — for agents that manage the exec workspace
- `com.dispatch.[name]` — for Dispatch-related agents

Confirm with the user.

## Step 6: Generate and install the plist

Generate a plist using this template structure. Adapt the schedule section based on user input.

For **StartCalendarInterval** (specific times):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>LABEL_HERE</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>SCRIPT_PATH_HERE</string>
    </array>
    <key>StartCalendarInterval</key>
    <array>
        <!-- Repeat this dict for each time -->
        <dict>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
    </array>
    <key>StandardOutPath</key>
    <string>/tmp/NAME.stdout</string>
    <key>StandardErrorPath</key>
    <string>/tmp/NAME.stderr</string>
</dict>
</plist>
```

For **StartCalendarInterval** (every N minutes — e.g., every 10 min):
```xml
    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Minute</key><integer>0</integer></dict>
        <dict><key>Minute</key><integer>10</integer></dict>
        <dict><key>Minute</key><integer>20</integer></dict>
        <dict><key>Minute</key><integer>30</integer></dict>
        <dict><key>Minute</key><integer>40</integer></dict>
        <dict><key>Minute</key><integer>50</integer></dict>
    </array>
```

For **WatchPaths**:
```xml
    <key>WatchPaths</key>
    <array>
        <string>/path/to/watch</string>
    </array>
```

Write the plist to `~/Library/LaunchAgents/[label].plist`.

## Step 7: Validate and load

```bash
plutil -lint ~/Library/LaunchAgents/[label].plist
```

If valid:
```bash
launchctl load ~/Library/LaunchAgents/[label].plist
```

Verify it loaded:
```bash
launchctl list | grep [label]
```

## Step 8: Offer a test run

Ask if they want to run it now:

```bash
launchctl kickstart gui/$(id -u)/[label]
```

Then read the log files briefly to confirm it works.

Report the result: agent name, schedule, what it does, plist location.
