---
description: Pull Mercury banking data — accounts, balances, transactions — via the Mercury REST API
allowed-tools: Bash, Read, Write, Glob, Grep, AskUserQuestion
---

# Finance Mercury

Pull Mercury banking data directly via Mercury's REST API using a read-only token. Works for personal and business Mercury accounts.

## Step 1 — Check for a token

Mercury tokens live in an env var. The Bash tool runs non-interactive shells, so `~/.zshrc` is NOT auto-sourced — source it explicitly in the probe, and in every subsequent curl call:

```bash
source ~/.zshrc 2>/dev/null
[ -n "$MERCURY_API_TOKEN" ] && echo "HAS_TOKEN" || echo "NO_TOKEN"
[ -n "$MERCURY_API_TOKEN_PERSONAL" ] && echo "HAS_PERSONAL"
[ -n "$MERCURY_API_TOKEN_BUSINESS" ] && echo "HAS_BUSINESS"
```

If the probe reports NO_TOKEN, before concluding it's unset, grep the user's shell config files for a fallback:

```bash
grep -l MERCURY ~/.zshrc ~/.zshenv ~/.zprofile ~/.bashrc ~/.bash_profile 2>/dev/null
```

If found there but not loaded, the issue is sourcing — not missing setup. Only walk the user through setup if the token is truly absent from all shell configs. Note: Mercury only supports static API tokens — there's no OAuth flow.

### 1. Generate the token in Mercury

1. Log into app.mercury.com → **Settings → API Tokens** (requires admin/owner)
2. Create a **Read Only** token — recommended unless the user explicitly needs to move money. Read-only tokens cannot initiate transfers, so a leak is recoverable by revocation alone.
3. **Whitelist your IP** in the token settings — this is the strongest protection Mercury offers. Grab it with `curl -s ifconfig.me`. If the user's IP changes often (travel, mobile tethering), they can skip this, but recommend it for home/office machines.
4. Copy the token immediately — it's shown once.

Do not ask the user to paste the token into chat. They set it themselves via one of the options below.

### 2. Store the token

**Option A — Simple (shell profile):**

Run this in terminal, replacing the placeholder:
```bash
echo 'export MERCURY_API_TOKEN="secret-token:PASTE_YOURS_HERE"' >> ~/.zshrc && source ~/.zshrc
```
Prefix the command with a space to keep it out of shell history (if `HIST_IGNORE_SPACE` is on, which is zsh default).

If the user has both personal and business tokens, use `MERCURY_API_TOKEN_PERSONAL` and `MERCURY_API_TOKEN_BUSINESS` instead.

**Option B — macOS Keychain (recommended on Mac):**

Stores the token encrypted at rest instead of as plaintext in `~/.zshrc`. Claude still picks it up because `~/.zshrc` exports it into the shell environment at startup.

```bash
# Store once (prompts for token, no echo)
security add-generic-password -a "$USER" -s MERCURY_API_TOKEN -w
```

Then add to `~/.zshrc`:
```bash
export MERCURY_API_TOKEN="$(security find-generic-password -a "$USER" -s MERCURY_API_TOKEN -w 2>/dev/null)"
```

Reload: `source ~/.zshrc`. First use may prompt once to unlock the keychain entry — click "Always Allow" to silence it. Tradeoff: any process running as your user can still read the exported env var; Keychain protects at-rest and across users, which is appropriate for a read-only token.

**Option C — 1Password CLI (strongest):**

If the user already uses `op`, biometric unlock per session:
```bash
export MERCURY_API_TOKEN="$(op read op://Private/Mercury/token)"
```

### 3. Verify

```bash
echo "${MERCURY_API_TOKEN:0:15}..."
```

Re-run `/finance:mercury`.

## Step 2 — Pull data

Base URL: `https://api.mercury.com/api/v1`

Auth: Basic auth with token as username, empty password.

```bash
source ~/.zshrc 2>/dev/null; curl -s --user "$MERCURY_API_TOKEN:" "https://api.mercury.com/api/v1/accounts"
```

Prepend `source ~/.zshrc 2>/dev/null;` to every curl call — each Bash tool invocation is a fresh non-interactive shell.

### Common queries

| What you need | Endpoint |
|---|---|
| All accounts + balances | `GET /accounts` |
| Single account | `GET /account/{id}` |
| Recent transactions (all accounts) | `GET /transactions?start=YYYY-MM-DD&end=YYYY-MM-DD&limit=500` |
| Account transactions | `GET /account/{id}/transactions?start=...&end=...` |
| Search transactions | `GET /transactions?search=TEXT` |
| Filter by status | `GET /transactions?status=pending\|sent\|failed\|reversed` |
| Statements | `GET /account/{id}/statements` |
| Org info (personal vs business) | `GET /organization` |
| Custom categories | `GET /categories` |
| Recipients | `GET /recipients` |

Pagination is cursor-based via `start_after` / `end_before`, max 1000 per page.

### If both personal and business tokens are set

Run each query against both tokens and label output by `organization.kind` ("personal" / "business"). Do not merge balances silently — show them separately.

## Step 3 — Load context

Check for a context file:

```
finances/context.md
ops/finance/context.md
```

If it exists, use it for goals, what accounts are for, card rewards structure, tax context. If not, don't block — note at the end that `/finance:ask` can set one up.

## Step 4 — Surface what matters

If the user just ran `/finance:mercury` with no specific question:

1. **Balances** — current + available across all accounts
2. **Recent activity** — last 7-14 days of notable transactions (large, unusual, new merchants)
3. **Recurring charges** — group by merchant/amount to spot subscriptions
4. **Flags** — pending transactions, failed/reversed, large outflows, low balances relative to context

If the user asked something specific ("how much to AWS this quarter?", "what did the Portugal trip cost?", "burn rate last 3 months?"), pull the relevant endpoint with date/search filters and answer directly.

## Response style

- Conversational, not a JSON dump. Lead with what matters.
- Separate personal and business clearly if both are present.
- Round to whole dollars unless precision matters.
- Flag anything that needs attention (pending large charges, failed payments, unusual spend) without being alarmist.
- If something looks miscategorized or unfamiliar, ask rather than assume.
- Never echo the token, never write it to a file, never log it.

## Notes

- Tokens auto-delete if inactive — running this command keeps them alive.
- Read-only tokens cannot move money. If the user wants write access, direct them to Mercury's docs; do not attempt it here.
- For account types Mercury doesn't cover (non-Mercury banks), point at `/finance:ask` (Era) or `/finance:import` (CSV).
