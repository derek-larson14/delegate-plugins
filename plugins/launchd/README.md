## launchd

A localhost web dashboard for macOS LaunchAgents. See your scheduled jobs, their status, and manage them.

Zero dependencies beyond Python 3 and macOS.

### Commands

- `/launchd:dashboard` — Open the dashboard

### Features

- Live status for all agents in `~/Library/LaunchAgents/` (running, idle, failed, unloaded, disabled)
- Expand any agent to see schedule, program path, and log tails
- **Run Now** kicks off any agent via `launchctl kickstart`
- **Load/Unload** agents from the dashboard
- **Hide** agents you don't care about
- **Diagnose with Claude** scans statuses and error logs, tells you what's broken (requires Claude CLI)
- **Describe Agents** generates descriptions from plist + script contents (requires Claude CLI)
- Auto-opens browser, auto-exits after 10 minutes idle

### Also works standalone

```bash
python3 scripts/server.py
python3 scripts/server.py --port 8080
python3 scripts/server.py --no-open
```
