---
description: Import CSVs and manage financial context — configure what flows into /finance:ask
allowed-tools: Bash, Read, Write, Glob, Grep, AskUserQuestion
---

# Finance Import

Bring outside financial data into the workspace and manage the context file that shapes how `/finance:ask` reasons about it.

Most bank and credit card data should flow through Era (via `/finance:ask`). This command handles the stuff Era can't see: CSV exports, manual accounts, goals, and notes.

## Step 1 — Figure out what they want

Use AskUserQuestion or read their prompt to pick one:

1. **Import a CSV** — they have a bank/card/Venmo/PayPal export to bring in
2. **Add a bank account to Era** — they want a new account connected
3. **Update context** — goals, manual accounts, notes
4. **Show what's connected** — what Era sees + what CSVs we've imported

## Path 1 — Import a CSV

1. Ask where the file is (or check `finance/imports/` if they dropped one there)
2. Read it, identify columns (date, description, amount, category — these vary by bank)
3. Save the original under `finance/imports/` and a normalized version under `finance/transactions/YYYY-MM-source.csv` (e.g. `2026-04-venmo.csv`)
4. Append to `finance/context.md` under `## Data Sources` so `/finance:ask` knows it exists
5. Summarize what was imported: source, date range, transaction count, total, top categories

Create folders as needed:

```
finance/
  imports/         # raw originals
  transactions/    # normalized by month + source
  context.md       # goals, accounts, notes, data sources
```

Good use cases: Venmo, PayPal, Zelle, any account that isn't on Plaid, one-off statements the user wants analyzed.

## Path 2 — Add a bank account

Era's connector handles Plaid-linked banks. The cleanest flow is to do this inside Era directly rather than via MCP:

1. Tell the user: "To add a new bank, open Era and use their Add Account flow — it handles Plaid auth and the connection will show up here next time you run `/finance:ask`."
2. Offer to open it for them:

```bash
# macOS
open https://app.era.app
# Linux
xdg-open https://app.era.app
```

If they insist on trying through the MCP/CLI, you can attempt `connections__connect_bank_account` with `assistant_name: "Claude"` — but it may not work reliably, so default to sending them to Era.

## Path 3 — Update context

Read `finance/context.md` (or `ops/finance/context.md`), then walk through:

- **Accounts Era can't see** — cash, crypto, Venmo balance, retirement not on Plaid
- **Goals** — emergency fund target, debt payoff, savings rate, specific purchases
- **Notes** — irregular income, shared expenses, upcoming big costs

Write updates back to the file. Keep it short and scannable — this gets loaded into every `/finance:ask`.

## Path 4 — Show what's connected

**CLI:**
```bash
${CLAUDE_PLUGIN_ROOT}/scripts/era-fetch.sh call accounts__list_financial_accounts
```

**MCP:** call `accounts__list_financial_accounts`.

Then list any CSVs under `finance/transactions/`. Flag gaps: "Era sees Chase checking + Chase card. If you have savings, investment, Venmo, or PayPal not listed, we can import those via CSV or you can add them through Era."

## After any import

Append a line under `## Data Sources` in `finance/context.md`:

```markdown
## Data Sources
- Era Finance: [list connected accounts]
- Local CSVs: [source + date range]
- Last import: YYYY-MM-DD
```

## Response style

- Guide, don't lecture. This is setup, not planning.
- If something fails (CSV parsing especially — bank exports are messy), explain plainly.
- After a successful import, offer to run `/finance:ask` to show the new data in action.
