---
description: Process delegation.md — autonomously handle Claude's task queue
model: opus
allowed-tools: Read, Grep, Glob, Edit, Write, AskUserQuestion, WebFetch, WebSearch
---

## First Run: Where the list lives

Before anything else, find the task list. Check for a `delegation.md` in the mounted workspace, and for a saved choice in `.delegate-config` at the workspace root.

If neither exists, this is a first run. Ask once with AskUserQuestion where the running list should live, then save the answer to `.delegate-config` so you never ask again:

- **Local file (recommended)** — create `delegation.md` in the workspace root. Simplest and fastest. You read and check off items in place, offline.
- **Google Drive doc** — use the Google Drive connector to find or create a doc named "delegation" in the user's Drive. Read the task list from it each run, and write completion notes back to it.
- **Google Drive sheet** — same, but a spreadsheet. Read task rows from it.

Default to the local file if the user just confirms. For the Drive options, the user needs the Google Drive connector enabled in Co-Work; if it's missing, say so and fall back to a local file.

Scratch notes always stay local in the mounted `scratch/` folder, even when the list lives in Drive. Write the work locally and link it from the list entry.

## Workspace Discovery
Scan the mounted workspace for context files:
- the task list (local `delegation.md`, or the Drive doc/sheet set in `.delegate-config`)
- tasks.md (user's tasks)
- roadmap.md (upcoming milestones)
- scratch/ (working notes)
- archive/ (completed items)

Use what exists. Skip what doesn't. Don't create scaffolding.

## Phase 1: Research (complete before acting)

Read the task list (the local `delegation.md`, or the Drive doc/sheet from `.delegate-config` — this is the primary input, Claude's task queue), then `tasks.md`, `roadmap.md`, and linked files to understand current state. Process items from top to bottom. Finish all context-gathering before categorizing. Don't leave "figure out X" as an output — do the figuring.

If the list is empty, say so.

## Phase 2: Categorize and Execute

**Use subagents aggressively.** Independent tasks should run in parallel. Spin up subagents for research, code exploration, data analysis — anything that doesn't depend on another task's output. The goal is throughput: chew through the queue fast.

For each task, separate interleaved concerns. A task mixing research + decision + relationship should become: completed research, clearly framed decision for the user.

**Do autonomously:** Research, code/scripts, file organization, data analysis, setup, prototyping, list generation. Execute, then mark complete in delegation.md using checkbox format (`- [x] task description — what was done, where output lives`). The task-archiver plugin watches delegation.md and auto-archives checked items to `archive/claude-completed.md` with date headers. Avoid creating documentation for the sake of documentation while balancing that with providing context about what changed.

**Expand and connect:** For idea files, cross-reference with what exists — look at implemented content, existing commands, repo structure. Connect scattered ideas. Note what's close to done. Don't produce prose; document what you notice.

**Surface what's actionable:** When something feels ready or nearly complete, ask: "This one seems close — want me to dig in?" Don't assume. Get permission before going deep.

**Working notes:** If a task generates thinking worth keeping, put it in `scratch/YYYY-MM/DD-[slug].md` (current month and day). These are notes and connections, not polished prose.

**Leave for the user:** Decisions, relationship DMs, pricing, strategy, anything voice-dependent. Add context that helps but don't create work.

**Use AskUserQuestion aggressively** — don't defer decisions to the structured output. When you hit a fork (unclear priority, multiple approaches, needs a call), use AskUserQuestion right then. This prevents the output from becoming a wall of deferred questions. Better to interrupt once than to produce an output that has to be re-read three times.

**Link relevant files** — when referencing research, scratch notes, or project files in delegation.md or the output, use plain file paths so they're easy to find.

Group related tasks that build on each other rather than treating each atomically.

## Phase 3: Structured Output

```
## Open Questions (for you)
- [Ambiguous tasks or judgment calls needed before proceeding]

## Completed
- [x] [task] — [one-line what was done]

## Ready to Dig In (asking permission)
- [ ] [idea/task] — [why it seems close, what I'd do next]

## Blocked / Needs You
- [ ] [task] — [why, with context added]

## Connections Noticed
- [Ideas that relate across files]
- [Things already partially implemented]
- [Patterns worth consolidating]
- [Repeated mentions across voice notes/tasks = importance signal]

## Flagged
- [Tasks sitting 2+ weeks]
- [Recurring patterns worth automating]
```

## Guardrails

Never send anything on behalf of the user. Never commit without review. Never delete files. Preserve original task wording when archiving.

Push back on anything incoherent. If something doesn't make sense, say so.

## Quality Bar

For every item you surface: would a good assistant mention this, or is this a direction your most valuable employee would just take?

## Success Criteria

You glance at the output and know exactly what needs your attention without re-reading everything.
