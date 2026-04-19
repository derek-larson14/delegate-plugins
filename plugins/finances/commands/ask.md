---
description: Financial ask — pull data from Era Finance, analyze spending, surface insights
allowed-tools: Bash, Read, Write, Glob, Grep, AskUserQuestion
---

# Finance Ask

Pull the user's financial data and surface what matters.

## Step 1 — Classify the environment

Before doing anything, figure out which path you're on. Try this single probe:

```bash
[ -f "$HOME/.era-finance/tokens.json" ] && echo "CLI_READY" || ([ -d "$HOME/.era-finance" ] && echo "CLI_PARTIAL" || echo "CLI_UNSET")
```

Interpret the result:

- **Bash runs and outputs `CLI_READY`** → CLI path, go to Step 2
- **Bash runs and outputs `CLI_UNSET` or `CLI_PARTIAL`** → CLI environment but not set up; run `${CLAUDE_PLUGIN_ROOT}/scripts/era-setup.sh` (opens browser for Era OAuth), then Step 2. Expired tokens self-heal — `era-fetch.sh` auto-launches re-auth.
- **Bash is not available** → Co-Work. Check if Era MCP tools are exposed (look for any tool starting with `knowledge__`, `transactions__`, or `accounts__`)
  - **Era tools present** → MCP path, go to Step 2
  - **Era tools missing** → walk the user through adding the Era connector:
    1. Co-Work settings (gear icon) → Connectors or MCP Servers
    2. Add connector with URL: `context.era.app`
    3. Sign in to Era and authorize
    4. Re-run `/finances:ask`

    **Flag before they add it:** Co-Work connectors are user-level, not per-conversation. Once Era is enabled, those tools are available in every Co-Work conversation, not just `/finances:ask`. That's fine if they want to ask ad-hoc finance questions anywhere — it's a footgun if they want tight scoping. If they want tight scoping, recommend the Claude Code path instead.

The user does not need an Era Finance account preexisting — signup happens inside the OAuth / connector flow.

## Step 2 — Pull data

**CLI path:**

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh snapshot
```

For specific queries:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call <tool_name> '{"arg":"value"}'
```

**IMPORTANT — do not post-process the script output.** Call `era-fetch.sh` on its own and read the result directly. Do NOT pipe through `python3`, `jq`, `node`, or any other parser to reformat, pretty-print, or extract fields. The script already unwraps the MCP JSON-RPC envelope internally and returns clean JSON (or clean text for prose content) — adding a post-processor will choke on multiline content, unicode escapes, or embedded quotes and surface a misleading JSON-decode error instead of useful data. If you need a specific field, read the full output into context and pull the field yourself.

**MCP path:** Call Era tools directly. For a default snapshot:
1. `knowledge__get_financial_context_and_overview` — full picture
2. `transactions__list_transactions` with `page_size: 25` — recent activity
3. `transactions__list_recurring_charges` — subscriptions

## Available Era tools

| What you need | CLI | MCP tool |
|---|---|---|
| Account balances | `${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call accounts__list_financial_accounts` | `accounts__list_financial_accounts` |
| Search transactions | `${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call transactions__search_transactions '{"query":"..."}'` | `transactions__search_transactions` |
| Spending breakdown | `${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call insights__analyze_spending '{"period":"current_month"}'` | `insights__analyze_spending` |
| Compare periods | `${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call insights__compare_spending_periods '{...}'` | `insights__compare_spending_periods` |
| Cash flow | `${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call insights__get_cash_flow` | `insights__get_cash_flow` |
| Forecast | `${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call insights__forecast_spending` | `insights__forecast_spending` |
| Recurring charges | `${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call transactions__list_recurring_charges` | `transactions__list_recurring_charges` |
| Categories | `${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call transactions__list_spending_categories` | `transactions__list_spending_categories` |

## Step 3 — Load context

Check for a context file:

```
finances/context.md
ops/finances/context.md
```

If it exists, use it (goals, accounts Era can't see, upcoming expenses). If it doesn't, don't block — just note at the end that `/finances:import` can set one up.

## Step 4 — Surface what matters

If the user ran `/finances:ask` without a specific ask, give a useful snapshot:

1. **Account balances** — where things stand
2. **Recent notable transactions** — anything large, unusual, new recurring charges
3. **Patterns** — spending trending up/down, categories standing out vs last month
4. **Flags** — anything that needs attention given their goals or context

If the user asks something specific ("what subscriptions am I paying?", "how much on food?", "what's my burn rate?"), pull the relevant tool and answer directly.

## Response style

- Conversational, not a spreadsheet dump. Lead with what matters.
- Flag things that need attention without being alarmist.
- If something looks miscategorized, say so.
- Don't dump full transaction lists unless asked — summarize and highlight.
- If accounts look incomplete (low count, missing income), mention it.
