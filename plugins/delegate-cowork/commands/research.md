---
description: Deep research on any topic - searches the web, reads sources, synthesizes findings
allowed-tools: WebSearch, WebFetch, Read, Grep, Glob
---

I need deep research on a topic. Run this like a research analyst — go wide, then go deep.

**Step 1: Initial Search Sweep**
Run 3-5 WebSearch queries from different angles on the topic. Vary your search terms — don't just rephrase the same query. Think about what a smart researcher would search for: the obvious terms, the technical terms, the contrarian terms, adjacent topics that intersect.

**Step 2: Source Triage**
From search results, identify the 8-12 most promising sources. Prioritize:
- Primary sources over aggregators
- Recent content over old (unless the topic is historical)
- Depth over breadth — a long-form analysis beats a listicle
- Diverse perspectives — don't just read sources that agree with each other

**Step 3: Parallel Deep Reads**
Spin up subagents (general-purpose, model: haiku) to fetch and analyze sources in parallel. Each agent gets 2-3 URLs and should extract:
- Key claims and evidence
- Data points, statistics, numbers
- Notable quotes
- Counterarguments or limitations mentioned
- Links to other promising sources worth following

**Step 4: Follow the Threads**
If subagents surface important secondary sources or if initial reads raise new questions, do a second round. Search for specific claims that need verification. Follow citation chains.

**Step 5: Synthesis**
Write up findings as a research brief:

### Overview
2-3 sentence summary of the landscape.

### Key Findings
Numbered list of the most important things learned, with evidence.

### Points of Disagreement
Where do sources conflict? What's contested?

### Gaps
What couldn't you find? What questions remain unanswered?

### Sources
Full list of URLs consulted, with one-line descriptions.

---

Be direct. Don't pad findings. If the research turns up that the topic is simpler than expected, say so. If it's more complex, map the complexity without trying to resolve it prematurely.
