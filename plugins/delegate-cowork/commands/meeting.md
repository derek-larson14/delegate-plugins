---
description: Search and summarize meeting notes
allowed-tools: Read, Glob, Grep
---

User is asking about a meeting: $ARGUMENTS

## Check What's Available

**Granola MCP (preferred):** Try searching meeting notes directly via the Granola connector. If available, search for meetings matching the user's query.

**Google Calendar MCP:** Try pulling meeting details (attendees, time, agenda) via the Calendar connector for additional context.

If neither connector is available, fall back to local file search.

## Local File Search (fallback or supplement)

Search for relevant meetings in these locations:
- `meetings/` folder
- `ops/granola/` folder

Match the user's query against filenames — look for name matches, topic keywords, or date references.

## Search Strategy

1. If Granola connector is available: search notes directly by query terms
2. If Calendar connector is available: look up meeting details for context (who attended, when it happened)
3. List local meeting files (filenames contain date, attendee name, and topic)
4. Read the most relevant file(s) based on the query
5. Answer the user's specific question (next steps, action items, key points, etc.)

## Tips for Matching
- "meeting with Chris" -> look for files/notes containing "Chris"
- "last week's call about fundraising" -> match recent dates + "fundraising" topic
- "what did we discuss with Jane" -> find Jane files, summarize discussion

Always cite which meeting file(s) or Granola note(s) you found the answer in.
