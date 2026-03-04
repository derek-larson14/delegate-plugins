---
description: Multi-perspective feedback on writing (parallel execution)
allowed-tools: Read, Grep, Glob
---

I'm working on a piece of writing and want feedback from multiple perspectives.

**Important context for editors:** The piece you're reviewing may be a brain dump, rough draft, or dictated transcript — or it may be a polished final draft. Focus your feedback on ideas, structure, argumentation, and energy. Do NOT flag typos, grammar issues, rough transitions, or incomplete sentences that are artifacts of early-stage writing. Treat this as reviewing someone's thinking, and the essence of it, not how polished it is.

## Workspace Discovery
Scan the mounted workspace for context files. Look for writing craft resources and strategic frameworks in:
- `ops/reference/editors/`
- `ops/reference/advice/`
- `ops/reference/`
- `reference/`

Use whatever reference directories exist. Skip what doesn't.

For each context file found, spin up a general-purpose subagent that reads:
1. The context file
2. The target file

USE OPUS FOR ALL SUBAGENTS

Each agent should create specific recommendations for improving the piece based on their context lens. Quote actual lines when possible. Don't feel the need to give a ton of status updates.

Launch all agents in parallel.

After all agents return:
1. Pull out the most interesting ideas across the different agents, especially things that feel like they capture the writer's energy
2. Synthesize patterns across all feedback. Where do multiple perspectives converge? Where do they conflict?
3. What are the highest-leverage changes?
