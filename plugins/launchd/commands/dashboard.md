---
description: Launch the launchd agents dashboard (macOS)
allowed-tools: [Bash, Read]
model: sonnet
---

# Launchd Dashboard

Open the web dashboard for macOS LaunchAgents. Shows scheduled jobs, status, logs, and lets you run them on demand.

**Mac only.** If not on macOS, tell the user this tool requires macOS LaunchAgents.

## Step 1: Find the server script

The server lives in this plugin's scripts directory. Find it:

```bash
# The plugin installs to ~/.claude/plugins/ or the project's .claude/plugins/
# Find server.py relative to this command file
find ~/.claude -path "*/launchd/scripts/server.py" -print -quit 2>/dev/null
```

If not found, check the project directory too:

```bash
find .claude -path "*/launchd/scripts/server.py" -print -quit 2>/dev/null
```

If still not found, tell the user: "Can't find the launchd plugin. Try reinstalling with `/plugin install launchd`."

Save the path to the server script for the next step.

## Step 2: Check if already running

```bash
lsof -ti:3847 2>/dev/null
```

If a process is on port 3847, just open the browser:

```bash
open http://localhost:3847
```

Tell the user the dashboard is open and stop.

## Step 3: Start the server

```bash
python3 /path/to/server.py &
```

Use the actual path found in Step 1. Run it in the background.

Tell the user: "Dashboard is running at http://localhost:3847. It auto-exits after 10 minutes idle."
