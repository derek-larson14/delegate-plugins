---
description: Process voice transcripts from Dispatch and route ideas to the right files
---

# Process voice transcripts from Dispatch

Read new voice transcripts and help route ideas to the right places in this workspace.

## Step 1: Find new transcripts

Check for `.dispatch/settings.json`. If it doesn't exist, tell the user: "Run `/dispatch:setup` first to connect your transcripts." Stop.

Read `source` and `last_processed` from settings.

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
