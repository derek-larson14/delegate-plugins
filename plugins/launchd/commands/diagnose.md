---
description: Diagnose LaunchAgent issues — check status, read error logs, report problems
allowed-tools: [Bash, Read, Glob]
---

# LaunchAgent Diagnose

Check the health of all LaunchAgents and report any issues.

## Step 1: Get agent status

```bash
launchctl list | grep -E "com\.(claude|exec|dispatch|voicememos|voicevault)"
```

Parse the output. Each line has: PID (or -), last exit status (or -), label.

- PID present = currently running
- Exit status != 0 = failed on last run
- Agent not in list but has a plist = unloaded

Also check which plists exist:

```bash
ls ~/Library/LaunchAgents/com.{claude,exec,dispatch,voicememos,voicevault}.*.plist 2>/dev/null
```

## Step 2: Read error logs for problem agents

For any agent with a non-zero exit code or that's unloaded unexpectedly, read its logs. The log paths are in the plist files.

For each problem agent, read its plist to find StandardErrorPath and StandardOutPath:

```bash
plutil -p ~/Library/LaunchAgents/[agent].plist
```

Then read the last 50 lines of stderr and stdout using the Read tool (with offset to get the tail).

## Step 3: Check for common issues

- **Exit code 137 or 143**: killed by timeout — check if the script has the 10-min timeout pattern
- **Exit code 1**: general failure — read stderr for the actual error
- **Exit code 124**: explicit timeout — script's timeout handler fired
- **Unloaded but plist exists**: was manually unloaded or crashed too many times
- **Disabled flag in plist**: explicitly disabled via `Disabled` key
- **StartInterval agents**: may stall during sleep/wake cycles on battery — recommend switching to StartCalendarInterval

## Step 4: Report

Give the user a clear summary:

**Healthy agents:** list them briefly (name, schedule, status)

**Problems found:** for each issue:
- What's wrong (failed, unloaded, crashed)
- The relevant error from the logs
- Likely cause
- How to fix it (specific commands)

If everything looks healthy, say so in one line.

Be direct. No filler.
