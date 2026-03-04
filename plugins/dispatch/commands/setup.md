---
description: Set up Dispatch — connect Google Drive and schedule automatic transcription
---

# Dispatch Setup

Connect your Dispatch recordings to this computer.

## Step 1: Determine source

Ask the user:

"How do you want to access your Dispatch transcripts?"
- **Google Drive (MCP)** — read directly from Drive, no local sync needed
- **Google Drive (rclone)** — sync Drive to a local folder, runs on a schedule
- **Local folder** — transcripts already land somewhere on this computer

### If MCP:

Try using MCP Google Drive tools to search for "dispatch" on Drive. If tools respond:

Create `.dispatch/settings.json`:
```json
{
  "source": "drive-mcp",
  "drive_path": "dispatch/transcripts",
  "last_processed": null
}
```

Tell the user: "Connected to Google Drive via MCP. Run `/dispatch:work` to process your transcripts."

If MCP tools don't respond, tell the user MCP isn't available and suggest rclone or local folder instead.

### If rclone:

Run the bundled setup script:
```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup-dispatch.sh"
```

This installs rclone (if needed), connects Google Drive, and schedules hourly transcription via launchd.

After the script completes, create `.dispatch/settings.json`:
```json
{
  "source": "drive-rclone",
  "transcript_path": "/Users/them/dispatch",
  "last_processed": null
}
```

Use the path from `~/.dispatch/config` if the setup script created one, otherwise default to `~/dispatch`.

### If local folder:

Ask for the folder path. Create `.dispatch/settings.json`:
```json
{
  "source": "local",
  "transcript_path": "/path/to/transcripts",
  "last_processed": null
}
```

## Step 2: Verify

If rclone or local, check that the transcript folder exists and has `.md` files. If MCP, search for transcript files on Drive.

Report what was set up and tell the user to run `/dispatch:work`.

## If already configured

If `.dispatch/settings.json` already exists, show the current config and ask if they want to reconfigure.
