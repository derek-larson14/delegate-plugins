#!/bin/bash
# Fetch data from Era Finance via MCP-over-HTTP
# Deps: curl, osascript (both ship with macOS)
#
# Usage:
#   ./era-fetch.sh list-tools              — show available Era tools
#   ./era-fetch.sh call <tool> [json_args] — call a specific tool
#   ./era-fetch.sh snapshot                — pull balances + recent transactions
set -e

TOKEN_DIR="$HOME/.era-finance"
TOKEN_FILE="$TOKEN_DIR/tokens.json"
CLIENT_FILE="$TOKEN_DIR/client.json"
ERA_URL="https://context.era.app"

# Extract a string value from flat JSON using grep/sed
json_get() {
    grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed 's/.*:[[:space:]]*"\(.*\)"/\1/'
}

# Parse JSON with JavaScript for Automation (ships with macOS, no deps)
json_parse() {
    osascript -l JavaScript -e "
        var input = '';
        while (true) {
            try { var line = $.NSString.alloc.initWithDataEncoding(
                $.NSFileHandle.fileHandleWithStandardInput.availableData,
                $.NSUTF8StringEncoding).js;
                if (!line || line.length === 0) break;
                input += line;
            } catch(e) { break; }
        }
        var data = JSON.parse(input);
        $1
    " 2>/dev/null
}

# Extract MCP result text content (strips JSON-RPC wrapping)
extract_content() {
    json_parse "
        var content = (data.result || {}).content || [];
        var out = [];
        for (var i = 0; i < content.length; i++) {
            if (content[i].text) out.push(content[i].text);
        }
        out.join('\n');
    "
}

# Extract tool names from tools/list response
extract_tool_names() {
    json_parse "
        var tools = (data.result || {}).tools || [];
        var out = [];
        for (var i = 0; i < tools.length; i++) {
            out.push('  ' + tools[i].name);
        }
        out.join('\n');
    "
}

# --- Token management ---

load_tokens() {
    if [ ! -f "$TOKEN_FILE" ]; then
        echo "Error: Not set up. Run era-setup.sh first." >&2
        exit 1
    fi
    ACCESS_TOKEN=$(cat "$TOKEN_FILE" | json_get access_token)
    REFRESH_TOKEN=$(cat "$TOKEN_FILE" | json_get refresh_token)
}

refresh_tokens() {
    if [ -z "$REFRESH_TOKEN" ]; then
        echo "Error: No refresh token. Run era-setup.sh again." >&2
        exit 1
    fi
    CLIENT_ID=$(cat "$CLIENT_FILE" | json_get client_id)

    TOKEN_RESP=$(curl -s -X POST https://forge.era.app/oauth/token \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}&client_id=${CLIENT_ID}")

    NEW_ACCESS=$(echo "$TOKEN_RESP" | json_get access_token)

    if [ -z "$NEW_ACCESS" ]; then
        echo "Error: Token refresh failed. Run era-setup.sh again." >&2
        exit 1
    fi

    echo "$TOKEN_RESP" > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"
    ACCESS_TOKEN="$NEW_ACCESS"
    REFRESH_TOKEN=$(echo "$TOKEN_RESP" | json_get refresh_token)
}

# --- MCP calls ---

mcp_call() {
    local method="$1"
    local params="$2"
    local id="${3:-1}"

    RESP=$(curl -s -w "\n%{http_code}" -X POST "$ERA_URL" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json, text/event-stream" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -d "{\"jsonrpc\":\"2.0\",\"id\":${id},\"method\":\"${method}\",\"params\":${params}}")

    HTTP_CODE=$(echo "$RESP" | tail -1)
    BODY=$(echo "$RESP" | sed '$d')

    # 401 = token expired, try refresh
    if [ "$HTTP_CODE" = "401" ] || [ -z "$BODY" ]; then
        refresh_tokens
        RESP=$(curl -s -w "\n%{http_code}" -X POST "$ERA_URL" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json, text/event-stream" \
            -H "Authorization: Bearer ${ACCESS_TOKEN}" \
            -d "{\"jsonrpc\":\"2.0\",\"id\":${id},\"method\":\"${method}\",\"params\":${params}}")
        HTTP_CODE=$(echo "$RESP" | tail -1)
        BODY=$(echo "$RESP" | sed '$d')
    fi

    echo "$BODY"
}

mcp_init() {
    mcp_call "initialize" '{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"delegate-finance","version":"0.1.0"}}' 0 >/dev/null 2>&1
}

# --- Commands ---

load_tokens

case "${1:-snapshot}" in
    list-tools)
        mcp_init
        TOOLS=$(mcp_call "tools/list" '{}' 2)
        echo "Available Era tools:"
        echo ""
        echo "$TOOLS" | extract_tool_names
        ;;

    call)
        TOOL_NAME="${2:?Usage: era-fetch.sh call <tool_name> [json_args]}"
        TOOL_ARGS="${3:-{}}"
        mcp_init
        mcp_call "tools/call" "{\"name\":\"${TOOL_NAME}\",\"arguments\":${TOOL_ARGS}}" 3 | extract_content
        ;;

    snapshot)
        mcp_init

        # Get financial overview (accounts, balances, spending, net worth)
        OVERVIEW=$(mcp_call "tools/call" '{"name":"knowledge__get_financial_context_and_overview","arguments":{}}' 10 | extract_content)
        if [ -n "$OVERVIEW" ]; then
            echo "$OVERVIEW"
            echo ""
        fi

        # Get recent transactions
        TXNS=$(mcp_call "tools/call" '{"name":"transactions__list_transactions","arguments":{"page_size":25}}' 11 | extract_content)
        if [ -n "$TXNS" ]; then
            echo "$TXNS"
        fi
        ;;

    raw)
        METHOD="${2:?Usage: era-fetch.sh raw <method> <params_json>}"
        PARAMS="${3:-{}}"
        mcp_init
        mcp_call "$METHOD" "$PARAMS" 99
        ;;

    *)
        echo "Usage: era-fetch.sh [command]"
        echo ""
        echo "Commands:"
        echo "  list-tools              Show available Era tools"
        echo "  call <tool> [json_args] Call a specific tool"
        echo "  snapshot                Pull balances + recent transactions (default)"
        echo "  raw <method> <params>   Raw MCP JSON-RPC call"
        ;;
esac
