---
description: Process voice transcripts from Dispatch and route ideas to the right files
---

# Process voice transcripts from Dispatch

Read new voice transcripts and help route ideas to the right places in this workspace.

## Step 1: Determine transcript source

Check for `.dispatch/settings.json`. If it exists, read `source` and skip to Step 2.

If it doesn't exist, detect what's available:

### Try Google Drive MCP first

Attempt to search Google Drive for files matching "dispatch" using whatever MCP Google Drive tools are available. Common tool patterns: `mcp__gdrive__search`, `mcp__google-drive__search`, or any tool that searches Google Drive.

**If MCP Drive tools are available and respond:**

Tell the user: "I can read your Dispatch transcripts directly from Google Drive."

Search for `.md` files in the `dispatch/transcripts` folder on Drive. If found, create config:

```json
{
  "source": "drive-mcp",
  "drive_path": "dispatch/transcripts",
  "last_processed": null
}
```

Write to `.dispatch/settings.json`. Create the `.dispatch/` directory if needed.

**If MCP Drive tools are NOT available (no tools found, or errors):**

Ask the user:

"How do your Dispatch transcripts reach this computer?"

Options:
- **Google Drive (synced locally)** — using Google Drive for Desktop or rclone
- **Local folder** — Mac Shortcut, iCloud, Obsidian, or another method

If Google Drive synced locally, ask for the folder path (default: `~/dispatch`).
If local folder, ask for the full path.

Create config:

```json
{
  "source": "local",
  "transcript_path": "/path/to/transcripts",
  "last_processed": null
}
```

Write to `.dispatch/settings.json`.

## Step 2: Find new transcripts

Read `.dispatch/settings.json` for `source` and `last_processed`.

Transcript filenames follow the pattern `dispatch_YYYYMMDD_HHMMSS.md`. These are lexicographically sortable by date. If `last_processed` is set, only process files whose names sort after it. If null, process everything.

### Source: drive-mcp

Use MCP Google Drive tools to:
1. Search for `.md` files in the `drive_path` folder (default: `dispatch/transcripts`)
2. Filter to files newer than `last_processed` (by filename sort order)
3. Read the content of each new file directly from Drive

If the Drive search returns nothing or the folder doesn't exist, tell the user: "No transcripts found in Google Drive at `dispatch/transcripts/`. Record something with Dispatch first."

### Source: local

List all `.md` files in `transcript_path` (and `transcripts/` subfolder if it exists).

If no new transcripts, say so and stop.

## Step 3: Understand the workspace

Before routing anything, scan this project to understand what you're working with:

- **Code repo** — has source files, package.json/Cargo.toml/go.mod/etc., maybe a README
- **Notes or docs workspace** — mostly markdown, might have tasks.md, projects, notes folders
- **Mixed** — code with docs alongside it

Note what organizational files already exist (TODO.md, TASKS.md, tasks.md, README.md, CHANGELOG.md, docs/, notes/, etc.). You'll route to what's already here rather than creating new structure.

## Step 4: Process each transcript

For each new transcript (in chronological order):

1. Read the full content
2. Extract every distinct idea, task, or note. A single recording often contains 5+ separate thoughts. Don't miss any.
3. Preserve the original wording — do not rewrite or summarize.

## Step 5: Route ideas

**If the workspace has clear structure** (existing task files, docs, notes), route each idea to where it fits. Append to existing files, matching their format.

**If this is a code repo with no docs structure**, ask the user on the first run:
- "Where should I put tasks and ideas? I can create a `TODO.md`, append to an existing file, or just print a summary."
- Remember their answer for this session.

**If you're unsure where something goes**, list the idea with your best guess and ask. Don't silently drop anything.

General rules:
- Append-only. Never overwrite existing content.
- Only modify `.md` files. Never touch source code, configs, or anything that isn't a markdown document.
- If a target file doesn't exist and you think one should, ask before creating it.

## Step 6: After processing

1. Update `last_processed` in `.dispatch/settings.json` to the filename of the newest transcript you processed
2. Report what was routed and where
