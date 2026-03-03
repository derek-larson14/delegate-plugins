---
description: Set up Dispatch — connect Google Drive and schedule automatic transcription
---

# Dispatch Setup

Connect Google Drive so your voice transcripts sync automatically.

## Step 1: Detect what's available

Check if `.dispatch/settings.json` exists and has a `source` set.

**If source is already set**, tell the user what's configured and ask if they want to reconfigure.

**If no settings exist**, detect what's available:

### Try MCP Google Drive first

Attempt to search Google Drive using whatever MCP Google Drive tools are available.

**If MCP responds:** Tell the user: "Google Drive is connected via MCP. Your transcripts will be read directly from Drive — no local sync needed."

Create `.dispatch/settings.json`:

```json
{
  "source": "drive-mcp",
  "drive_path": "dispatch/transcripts",
  "last_processed": null
}
```

Done. Skip to Step 3.

### No MCP — set up rclone

Check if rclone is installed and gdrive is configured:

```bash
rclone listremotes 2>/dev/null | grep -q "^gdrive:" && echo "READY" || echo "NEEDS_SETUP"
```

**If READY:** Create settings with `"source": "local"` and `"transcript_path"` pointing to the sync folder (default: `~/dispatch`). Skip to Step 2.

**If NEEDS_SETUP:** Run the setup script:

```bash
chmod +x "${CLAUDE_PLUGIN_ROOT}/scripts/setup-dispatch.sh"
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-dispatch.sh"
```

This installs rclone (no Homebrew needed), opens a browser for Google auth, and schedules hourly transcription via launchd.

After the script completes, create `.dispatch/settings.json`:

```json
{
  "source": "local",
  "transcript_path": "~/dispatch",
  "last_processed": null
}
```

## Step 2: Verify connection

```bash
rclone lsd gdrive:dispatch 2>/dev/null && echo "DISPATCH_FOLDER_FOUND" || echo "NO_DISPATCH_FOLDER"
```

If the dispatch folder exists, tell the user setup is complete. If not, tell them it appears after their first recording with Dispatch.

## Step 3: Confirm

Tell the user what's configured:

- **drive-mcp**: "Transcripts read directly from Google Drive. Run `/dispatch:work` to process them."
- **local** (rclone): "Transcripts sync to `[path]` every hour. Run `/dispatch:work` to process them."

Remind them to record something with Dispatch on their phone to test the pipeline.
