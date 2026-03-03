---
description: Process voice transcripts from Dispatch and route ideas to the right files
allowed-tools: Read, Edit, Glob, Grep, Write, AskUserQuestion
---

# Process voice transcripts from Dispatch

Read new voice transcripts and help route ideas to the right places in this workspace.

## Setup (first run only)

Check for `.dispatch/settings.json`. If it doesn't exist:

1. Ask how transcripts reach this computer:
   - "How do your Dispatch transcripts get here?"
     - **Google Drive** — ran the setup script or using Google Drive for Desktop
     - **Local folder** — Mac Shortcut, iCloud, Obsidian, or another local method
2. Ask where the transcripts folder is:
   - "Where do your transcripts land?"
   - Default for Drive: `~/dispatch`
   - For local: ask for the full path (e.g. iCloud folder, Obsidian vault, project subfolder)
3. Create `.dispatch/settings.json`:

```json
{
  "source": "drive",
  "transcript_path": "/Users/them/dispatch",
  "last_processed": null
}
```

- `source`: `"drive"` if syncing from Google Drive, `"local"` if using Mac Shortcut, iCloud, Obsidian, or any other local method
- `transcript_path`: absolute path to the folder containing transcript `.md` files
- `last_processed`: last processed filename (null = process everything)

Create the `.dispatch/` directory if it doesn't exist.

## Find new transcripts

Read `transcript_path` from `.dispatch/settings.json`. List all `.md` files in that folder (and `transcripts/` subfolder if it exists).

Transcript filenames follow the pattern `dispatch_YYYYMMDD_HHMMSS.md`. These are lexicographically sortable by date.

If `last_processed` is set, only process files whose names sort after it. If null, process everything.

If no new transcripts, say so and stop.

## Understand the workspace

Before routing anything, scan this project to understand what you're working with:

- **Code repo** — has source files, package.json/Cargo.toml/go.mod/etc., maybe a README
- **Notes or docs workspace** — mostly markdown, might have tasks.md, projects, notes folders
- **Mixed** — code with docs alongside it

Note what organizational files already exist (TODO.md, TASKS.md, tasks.md, README.md, CHANGELOG.md, docs/, notes/, etc.). You'll route to what's already here rather than creating new structure.

## Process each transcript

For each new transcript (in chronological order):

1. Read the full content
2. Extract every distinct idea, task, or note. A single recording often contains 5+ separate thoughts. Don't miss any.
3. Preserve the original wording — do not rewrite or summarize.

## Route ideas

**If the workspace has clear structure** (existing task files, docs, notes), route each idea to where it fits. Append to existing files, matching their format.

**If this is a code repo with no docs structure**, ask the user on the first run:
- "Where should I put tasks and ideas? I can create a `TODO.md`, append to an existing file, or just print a summary."
- Remember their answer for this session.

**If you're unsure where something goes**, list the idea with your best guess and ask. Don't silently drop anything.

General rules:
- Append-only. Never overwrite existing content.
- Only modify `.md` files. Never touch source code, configs, or anything that isn't a markdown document.
- If a target file doesn't exist and you think one should, ask before creating it.

## After processing

1. Update `last_processed` in `.dispatch/settings.json` to the filename of the newest transcript you processed
2. Report what was routed and where
