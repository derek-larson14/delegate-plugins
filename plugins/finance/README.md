## Finance

Personal finance powered by Era Finance. Works in Claude Code (CLI) and Co-Work.

### Install

```
/plugin install finance@delegate-plugins
```

### Prerequisites

- An Era Finance account (era.app) with your bank accounts connected
- Setup happens automatically on first run if not configured

### Commands

- `/finance:ask` — Financial snapshot and analysis (Era)
- `/finance:import` — Connect accounts, import CSVs, manage data sources
- `/finance:mercury` — Pull Mercury banking data via read-only API token

### How it works

- **Claude Code (CLI):** Bundled scripts talk to Era's MCP endpoint over HTTP
- **Co-Work:** Uses the Era Context connector (MCP) directly

Commands auto-detect which environment you're in and use the right path.
