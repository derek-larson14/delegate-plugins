---
description: Weekly review as chief of staff
allowed-tools: Read, Grep, Glob, Edit, Write, AskUserQuestion
---

# Weekly Review

## Workspace Discovery
Scan the mounted workspace for context files:
- delegation.md (Claude's task queue)
- tasks.md (user's tasks)
- roadmap.md (upcoming milestones)
- scratch/ (working notes)
- archive/ (completed items)

Use what exists. Skip what doesn't. Don't create scaffolding.

## Phase 1: Mechanical Review

Use subagents in parallel to gather:

**GitHub connector (if available):** Pull recent commits, PRs, and activity from relevant repos for the past 7 days. If the GitHub connector isn't available, skip this and note it.

**Google Calendar connector (if available):** Pull this week's meetings and next week's calendar. If not available, skip.

**Gmail connector (if available):** Pull important threads from the past week. If not available, skip.

**Always do:**
- Read tasks.md, roadmap.md, delegation.md
- Check archive/ for completed items this week
- Check last week's review (if exists in ops/logs/weekly/) — predictions vs reality
- Upcoming hard deadlines

## Phase 2: Emotional Reality Check

### Direct Questions
- What's causing the most unease right now?
- What am I afraid of doing?
- What am I unwilling to feel?
- What brought the most joy/energy this week?

## Phase 3: Constraint Analysis

### The Core Question
**"What could be cut here?"**

### Constraint Check
- Money: What's the real number? When does it hit?
- Time: What's actually locked in vs. self-imposed?
- Energy: Where am I bleeding out vs. gaining strength?
- Reputation: Real risk vs. imagined risk?

## Phase 4: Finding Unlocks

### Collaboration Opportunities
- Who could I be reaching out to for help?
- What can be delegated/automated/eliminated?

### Reframe Prompts
- What if the opposite were true?
- What would [trusted advisor] tell me to do?
- What's the 80/20 here?

## Phase 5: Energy-Aware Priorities

### Next Week's Priorities
When coming up with this list think about:
- What MUST happen (external commitment)
- What unlocks everything else
- What maintains momentum
- What preserves energy/sanity

### Energy Management
- Protected recharge time:
- Power hours for deep work:
- Batching strategy:
- Hard stops:

## Evolution Tracking

### Review Journey
**Started thinking:**
**Ended with:**
**Key unlock:**
**Pattern to remember:**

---

## REVIEW STRUCTURE
This should feel like a conversation between you and your chief of staff managing the weekly debrief meeting. The AI should propose questions, help you see things clearly, and work together on what comes next and how to think about the upcoming week.

Think about the above questions - go over what is important together.

The AI's role: help see the whole map, bring out the true story of the week, and surface how you're feeling (which may have happened outside of these files)

## Questions When Evaluating the Prior Week's Review
- Did the unlocks work?
- What new constraint emerged?
- What pattern repeated or ended?

## Review Outputs

After completing the review, update:
1. **roadmap.md** (or planning file) - Move completed milestones, update targets, shift what needs adjustment
2. **Create weekly review log** - Document this review for future reference (create a logs folder like `ops/logs/weekly/YYYY-WW.md` and include what needs to get done by next week)
