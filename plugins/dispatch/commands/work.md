---
description: Read Dispatch voice transcripts and start working on them
model: opus
---

# Dispatch Work

Read voice transcripts from Dispatch and act on them. Research, analyze, build, file — do everything you can without waiting.

## Step 1: Get transcripts

Check for `.dispatch/settings.json`. If it exists, read `source`.

If it doesn't exist, detect what's available:

### Try Google Drive MCP first

Attempt to search Google Drive for files matching "dispatch" using whatever MCP Google Drive tools are available.

**If MCP Drive tools respond:** Search for `.md` files in `dispatch/transcripts` on Drive. Create config:

```json
{
  "source": "drive-mcp",
  "drive_path": "dispatch/transcripts",
  "last_processed": null
}
```

Write to `.dispatch/settings.json`.

**If no MCP Drive tools:** Check if rclone is configured (`rclone listremotes 2>/dev/null | grep -q "^gdrive:"`). If yes, use the local sync folder (default: `~/dispatch`). Create config with `"source": "local"` and `"transcript_path"`.

**If no MCP and no rclone:** Tell the user: "No transcript source found. Run `/dispatch:setup` to connect Google Drive, or tell me where your transcript folder is."

### Read transcripts

Transcript filenames: `dispatch_YYYYMMDD_HHMMSS.md` (lexicographically sortable).

If `last_processed` is set, only process files newer than it. If null, process everything.

Read all new transcripts. If none found, say so and stop.

## Step 2: Build context

Before acting on anything, understand the workspace:

- What files exist? (tasks.md, TODO.md, docs/, notes/, src/, etc.)
- What kind of project is this? (code repo, notes workspace, mixed)
- What's the recent git history? What's in progress?

Also scan Google Drive (if MCP available) for context. If a transcript mentions a document, spreadsheet, or file by name, search Drive and read it. Use everything available to understand what the user is working on.

## Step 3: Parse and classify

Extract every distinct idea, task, or note from the transcripts. A single recording often contains 5+ separate thoughts. Don't miss any.

Classify each item:

**DO NOW** — things you can execute without the user:
- Research (competitors, tools, markets, people, topics)
- Data analysis (numbers, comparisons, summaries)
- Code and scripts (prototypes, utilities, automation)
- File organization (restructuring, consolidating, cleaning up)
- Summarization (condensing docs, extracting key points)
- Writing drafts based on clear direction
- Finding and reading relevant Drive files for context
- List generation (options, pros/cons, recommendations)

**SURFACE** — things only the user can do:
- Decisions and strategy calls
- Messages to send, people to contact
- Things requiring their voice or judgment
- Ambiguous items where you're not sure what they want

## Step 4: Execute

**Use subagents for independent tasks.** Run research, analysis, and file tasks in parallel. The goal is throughput.

For each DO NOW item:
1. Do the work
2. Write substantive output to files in the workspace:
   - Research and analysis → `scratch/YYYY-MM-DD-[slug].md`
   - Task lists and action items → append to existing task files if they exist, or create `tasks.md`
   - Ideas for specific projects → append to relevant project files
   - Code/scripts → appropriate location in the project
3. If you need more context from Drive (a referenced document, a spreadsheet with data), pull it via MCP and use it

Create the `scratch/` directory if it doesn't exist.

For SURFACE items: collect them for the summary.

## Step 5: Summary

End with a clear report:

```
## Done
- [item] — [what was done, where output lives]
- [item] — [what was done, where output lives]

## For You
- [item that needs your decision or action]
- [item that needs your input]

## Files Created
- scratch/2026-03-03-competitor-research.md
- scratch/2026-03-03-pricing-analysis.md
```

Link every file you created or modified so the user can find them.

## Step 6: Update state

Update `last_processed` in `.dispatch/settings.json` to the newest transcript filename.

## Rules

- **Preserve the user's words.** When capturing ideas or tasks, use their language, not yours.
- **Do the work, don't describe the work.** "Research X" means go research X and write findings, not "I recommend researching X."
- **Pull context aggressively.** If a transcript mentions a file, person, company, or topic, search for relevant context in Drive and the workspace before acting.
- **Write to files, not just the chat.** Outputs should be in files the user can find later. The chat summary points to the files.
- **Don't create structure the user didn't ask for.** Use existing files and folders. Only create new files for substantial output (research, analysis). Don't create organizational scaffolding.
- **Ask if truly stuck.** If something is ambiguous AND high-stakes, ask. Otherwise, make your best call and note the assumption.
