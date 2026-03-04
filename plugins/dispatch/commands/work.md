---
description: Read Dispatch voice transcripts and start working on them
model: opus
---

# Dispatch Work

Read voice transcripts from Dispatch and act on them. Research, analyze, build, file -- do everything you can without waiting.

## Step 1: Setup check

Check for `.dispatch/settings.json`. If it doesn't exist, run setup inline:

Ask the user: "How do you want to access your Dispatch transcripts?"
- **Google Drive (MCP)** -- read directly from Drive, no local sync needed
- **Google Drive (rclone)** -- sync Drive to a local folder
- **Local folder** -- transcripts already land somewhere on this computer

**If MCP:** Try using MCP Google Drive tools to search for "dispatch" on Drive. If tools respond, create `.dispatch/settings.json`:
```json
{
  "source": "drive-mcp",
  "drive_path": "dispatch/transcripts",
  "last_processed": null
}
```

**If rclone:** Ask for the local sync path (default `~/dispatch`). Create `.dispatch/settings.json`:
```json
{
  "source": "drive-rclone",
  "transcript_path": "/Users/them/dispatch",
  "last_processed": null
}
```

**If local folder:** Ask for the folder path. Create `.dispatch/settings.json`:
```json
{
  "source": "local",
  "transcript_path": "/path/to/transcripts",
  "last_processed": null
}
```

Create the `.dispatch/` directory if needed.

After creating settings, also write `.dispatch/CONTEXT.md`:
```
# Dispatch

This workspace is configured to receive voice transcripts from Dispatch.
Settings are in `.dispatch/settings.json`.
```

## Step 2: Get transcripts

Read `source` from `.dispatch/settings.json`:

- **`drive-mcp`**: Use MCP Google Drive tools to find `.md` files in the configured `drive_path`
- **`drive-rclone`** or **`local`**: Read `.md` files from the configured `transcript_path`

### Read transcripts

Transcript filenames: `dispatch_YYYYMMDD_HHMMSS.md` (lexicographically sortable).

If `last_processed` is set, only process files newer than it. If null, process everything.

Read all new transcripts. If none found, say so and stop.

## Step 3: Build context

Before acting on anything, understand the workspace:

- What files exist? (tasks.md, TODO.md, docs/, notes/, src/, etc.)
- What kind of project is this? (code repo, notes workspace, mixed)
- What's the recent git history? What's in progress?

Also scan Google Drive (if MCP available) for context. If a transcript mentions a document, spreadsheet, or file by name, search Drive and read it. Use everything available to understand what the user is working on.

## Step 4: Parse and classify

Extract every distinct idea, task, or note from the transcripts. A single recording often contains 5+ separate thoughts. Don't miss any.

Classify each item:

**DO NOW** -- things you can execute without the user:
- Research (competitors, tools, markets, people, topics)
- Data analysis (numbers, comparisons, summaries)
- Code and scripts (prototypes, utilities, automation)
- File organization (restructuring, consolidating, cleaning up)
- Summarization (condensing docs, extracting key points)
- Writing drafts based on clear direction
- Finding and reading relevant Drive files for context
- List generation (options, pros/cons, recommendations)

**SURFACE** -- things only the user can do:
- Decisions and strategy calls
- Messages to send, people to contact
- Things requiring their voice or judgment

**UNCLEAR** -- items where intent or desired action is ambiguous. Do not silently drop these.

## Step 5: Execute

**Use subagents for independent tasks.** Run research, analysis, and file tasks in parallel. The goal is throughput.

For each DO NOW item:
1. Do the work
2. Write substantive output to files in the workspace:
   - Research and analysis: `scratch/YYYY-MM-DD-[slug].md`
   - Task lists and action items: append to existing task files if they exist, or create `tasks.md`
   - Ideas for specific projects: append to relevant project files
   - Code/scripts: appropriate location in the project
3. If you need more context from Drive (a referenced document, a spreadsheet with data), pull it via MCP and use it

Create the `scratch/` directory if it doesn't exist.

For SURFACE items: collect them for the summary.

For UNCLEAR items: collect them for the summary with their original transcript text.

## Step 6: Summary

End with a structured report in plain markdown:

```
## Summary

Processed N transcripts. Executed M items, surfaced K for review, L unclear.

## Done
- [item] -- [what was done, where output lives]
- [item] -- [what was done, where output lives]

## For you
- [item that needs your decision or action]
- [item that needs your input]

## Needs review
- "[original transcript text]" -- couldn't determine what action to take
- "[original transcript text]" -- ambiguous reference, needs clarification

## Files created
- scratch/2026-03-03-competitor-research.md
- scratch/2026-03-03-pricing-analysis.md
```

Link every file you created or modified so the user can find them.

If a section has no items, omit it.

## Step 7: Update state

Update `last_processed` in `.dispatch/settings.json` to the newest transcript filename.

## Rules

- **Preserve the user's words.** When capturing ideas or tasks, use their language, not yours.
- **Do the work, don't describe the work.** "Research X" means go research X and write findings, not "I recommend researching X."
- **Pull context aggressively.** If a transcript mentions a file, person, company, or topic, search for relevant context in Drive and the workspace before acting.
- **Write to files, not just the chat.** Outputs should be in files the user can find later. The chat summary points to the files.
- **Don't create structure the user didn't ask for.** Use existing files and folders. Only create new files for substantial output (research, analysis). Don't create organizational scaffolding.
- **Never silently drop items.** If something is unclear, surface it under "Needs review" with the original text.
- **Ask if truly stuck.** If something is ambiguous AND high-stakes, ask. Otherwise, make your best call and note the assumption.
