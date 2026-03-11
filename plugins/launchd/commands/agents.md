---
description: Toggle LaunchAgents on/off — "turn off gh-triage", "enable voice-auto"
allowed-tools: [Bash, Read, Glob]
---

# LaunchAgent Toggle

The user wants to enable or disable one or more LaunchAgents. Parse their request to figure out which agents and what action.

## Step 1: List current agents

Run this to see all agents and their status:

```bash
launchctl list | grep -E "com\.(claude|exec|dispatch|voicememos|voicevault)" 2>/dev/null
```

Also list available plist files:

```bash
ls ~/Library/LaunchAgents/com.{claude,exec,dispatch,voicememos,voicevault}.*.plist 2>/dev/null
```

Show the user a brief summary: agent name, whether it's loaded, PID if running, last exit code.

## Step 2: Match the user's request

The user may say things like:
- "turn off gh-triage" → find the agent with "gh-triage" in the label
- "disable voice-auto and delegate-auto" → match multiple agents
- "turn everything off" → unload all custom agents
- "enable transcribe" → load the matching agent

Match fuzzy names to actual labels. If ambiguous, ask which one they mean.

## Step 3: Execute

To **disable** (unload) an agent:
```bash
launchctl unload ~/Library/LaunchAgents/[plist-filename]
```

To **enable** (load) an agent:
```bash
launchctl load ~/Library/LaunchAgents/[plist-filename]
```

To **run now** (one-time kick):
```bash
launchctl kickstart gui/$(id -u)/[label]
```

## Step 4: Confirm

After toggling, run `launchctl list` again filtered to the agent label to verify the change took effect. Report what changed in one line per agent.
