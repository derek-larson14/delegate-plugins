#!/bin/bash
# One-time Era Finance OAuth setup
# Opens browser, catches callback, stores tokens locally
# Deps: curl, openssl, nc (all ship with macOS; Linux needs ncat or openbsd-netcat)

open_url() {
    if command -v open >/dev/null 2>&1; then open "$1"
    elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$1"
    else echo "Open this URL manually: $1"
    fi
}
set -e

TOKEN_DIR="$HOME/.era-finance"
TOKEN_FILE="$TOKEN_DIR/tokens.json"
CLIENT_FILE="$TOKEN_DIR/client.json"
CALLBACK_PORT=8765

# Extract a string value from JSON (handles simple flat objects)
json_get() {
    grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed 's/.*:[[:space:]]*"\(.*\)"/\1/'
}

echo "=== Era Finance Setup ==="
echo ""

# Check if already set up
if [ -f "$TOKEN_FILE" ] && [ "$1" != "--force" ]; then
    echo "Era Finance is already configured."
    echo "Token file: $TOKEN_FILE"
    echo ""
    echo "Testing connection..."
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    if "$SCRIPT_DIR/era-fetch.sh" list-tools 2>/dev/null | grep -q .; then
        echo "Connection works."
        exit 0
    else
        echo "Token may be expired. Re-running setup..."
        echo ""
    fi
fi

mkdir -p "$TOKEN_DIR"

# Step 1: Dynamic client registration
echo "Registering client with Era..."
CLIENT_RESP=$(curl -s -X POST https://forge.era.app/oauth/register \
    -H "Content-Type: application/json" \
    -d '{
        "client_name": "delegate-finance",
        "redirect_uris": ["http://127.0.0.1:'"$CALLBACK_PORT"'/callback"],
        "grant_types": ["authorization_code", "refresh_token"],
        "response_types": ["code"],
        "token_endpoint_auth_method": "none"
    }')

CLIENT_ID=$(echo "$CLIENT_RESP" | json_get client_id)

if [ -z "$CLIENT_ID" ]; then
    echo "Error: Failed to register client with Era."
    echo "Response: $CLIENT_RESP"
    exit 1
fi

echo "$CLIENT_RESP" > "$CLIENT_FILE"
chmod 600 "$CLIENT_FILE"
echo "Client registered: $CLIENT_ID"

# Step 2: Generate PKCE challenge
CODE_VERIFIER=$(openssl rand -base64 96 | tr -d '=+/\n' | head -c 128)
CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" | openssl sha256 -binary | base64 | tr '+/' '-_' | tr -d '=')
STATE=$(openssl rand -hex 16)

# Step 3: Open browser
echo ""
echo "Opening browser for Era login..."
echo "Sign in and authorize, then come back here."
echo ""

AUTH_URL="https://forge.era.app/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=http://127.0.0.1:${CALLBACK_PORT}/callback&scope=mcp:tools-basic+mcp:resources-read+mcp:discovery+offline_access&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256&state=${STATE}"

# Step 4: Start listener BEFORE opening browser to avoid race condition
HTTP_RESPONSE="HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nConnection: close\r\n\r\n<html><body><h2>Done! You can close this tab.</h2></body></html>"
CALLBACK_FILE=$(mktemp)
printf "$HTTP_RESPONSE" | nc -l "$CALLBACK_PORT" > "$CALLBACK_FILE" &
NC_PID=$!
sleep 0.5  # let nc bind the port

open_url "$AUTH_URL"
echo "Waiting for authorization callback..."
wait $NC_PID 2>/dev/null
CALLBACK=$(cat "$CALLBACK_FILE")
rm -f "$CALLBACK_FILE"
AUTH_CODE=$(echo "$CALLBACK" | grep -o 'code=[^& ]*' | head -1 | cut -d= -f2)

if [ -z "$AUTH_CODE" ]; then
    echo "Error: Did not receive authorization code."
    echo "Raw callback: $CALLBACK"
    exit 1
fi

echo "Authorization received."

# Step 5: Exchange code for tokens
echo "Exchanging for tokens..."
TOKEN_RESP=$(curl -s -X POST https://forge.era.app/oauth/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=authorization_code&code=${AUTH_CODE}&redirect_uri=http://127.0.0.1:${CALLBACK_PORT}/callback&client_id=${CLIENT_ID}&code_verifier=${CODE_VERIFIER}")

ACCESS_TOKEN=$(echo "$TOKEN_RESP" | json_get access_token)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Error: Failed to get tokens."
    echo "Response: $TOKEN_RESP"
    exit 1
fi

echo "$TOKEN_RESP" > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"

# Create finance folder with context template if it doesn't exist
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FINANCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/finance"
if [ ! -d "$FINANCE_DIR" ]; then
    mkdir -p "$FINANCE_DIR"
    cat > "$FINANCE_DIR/context.md" << 'TMPL'
# Financial Context

## Accounts
<!-- List your accounts here so Claude knows what you're working with -->

## Goals
<!-- What are you trying to achieve financially? -->

## Notes
<!-- Anything Claude should know — irregular income, upcoming big expenses, etc -->
TMPL
    echo "Created $FINANCE_DIR/context.md — fill in your financial context."
fi

echo ""
echo "Success! Era Finance connected."
echo "Tokens stored at: $TOKEN_FILE"
echo ""
echo "Test with: era-fetch.sh list-tools"
