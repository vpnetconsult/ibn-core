#!/bin/bash

# Claude Code MCP - Quick Security Diagnostic
# Usage: bash quick_diagnostic.sh > security_report.txt

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Claude Code MCP Security - Quick Diagnostic Report        ║"
echo "║  Generated: $(date)                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Configuration Files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CONFIGURATION FILES STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CLAUDE_CONFIG="$HOME/Library/Application Support/Claude"
CLAUDE_CODE_CONFIG="$HOME/.claude"

if [ -d "$CLAUDE_CONFIG" ]; then
    echo "✓ Claude config directory exists"
    echo "  Location: $CLAUDE_CONFIG"
    echo "  Files: $(ls -1 "$CLAUDE_CONFIG" | wc -l) items"
else
    echo "✗ Claude config directory NOT found"
fi

if [ -d "$CLAUDE_CODE_CONFIG" ]; then
    echo "✓ Claude Code config directory exists"
    echo "  Location: $CLAUDE_CODE_CONFIG"
    echo "  Files: $(ls -1 "$CLAUDE_CODE_CONFIG" 2>/dev/null | wc -l) items"
else
    echo "✗ Claude Code config directory NOT found"
fi

echo ""

# 2. MCP Configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. MCP CONFIGURATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$CLAUDE_CODE_CONFIG/config.json" ]; then
    echo "✓ MCP config file found: $CLAUDE_CODE_CONFIG/config.json"
    echo ""
    echo "Configured MCP Servers:"
    echo "─────────────────────"
    cat "$CLAUDE_CODE_CONFIG/config.json" 2>/dev/null | \
        jq -r '.servers | keys[]' 2>/dev/null || echo "  (Unable to parse)"
    echo ""
    echo "Transport Types:"
    echo "─────────────────────"
    cat "$CLAUDE_CODE_CONFIG/config.json" 2>/dev/null | \
        jq -r '.servers[] | "\(.name // "unknown"): \(.transport // "stdio")"' 2>/dev/null || echo "  (Unable to parse)"
else
    echo "✗ MCP config file NOT found"
    echo "  Expected: $CLAUDE_CODE_CONFIG/config.json"
fi

echo ""

# 3. File Permissions (CRITICAL)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. FILE PERMISSIONS AUDIT (CRITICAL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PERMISSION_ISSUES=0

# Check config directory
if [ -d "$CLAUDE_CODE_CONFIG" ]; then
    DIR_PERMS=$(stat -f %OLp "$CLAUDE_CODE_CONFIG" 2>/dev/null || echo "unknown")
    echo "Claude Code config dir: $DIR_PERMS"
    if [[ "$DIR_PERMS" == *"7"* ]] || [[ "$DIR_PERMS" == *"755"* ]] || [[ "$DIR_PERMS" == *"744"* ]]; then
        echo "  ⚠ WARNING: Directory readable by others!"
        PERMISSION_ISSUES=$((PERMISSION_ISSUES+1))
    else
        echo "  ✓ Permissions look good"
    fi
fi

# Check config files
echo ""
echo "JSON config files:"
if [ -d "$CLAUDE_CODE_CONFIG" ]; then
    find "$CLAUDE_CODE_CONFIG" -name "*.json" -type f 2>/dev/null | while read file; do
        PERMS=$(stat -f %OLp "$file" 2>/dev/null || echo "unknown")
        echo "  $(basename "$file"): $PERMS"
        if [[ "$PERMS" != "0600" ]] && [[ "$PERMS" != "-rw-------" ]]; then
            echo "    ⚠ SECURITY ISSUE: Not restricted to owner only!"
            PERMISSION_ISSUES=$((PERMISSION_ISSUES+1))
        fi
    done
fi

echo ""

# 4. Credential Exposure Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. CREDENTIAL EXPOSURE SCAN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CRED_COUNT=$(grep -r "api_key\|apikey\|api-key\|secret\|password\|token" \
    "$CLAUDE_CODE_CONFIG" 2>/dev/null | grep -v "description\|help\|example" | wc -l)

if [ "$CRED_COUNT" -gt 0 ]; then
    echo "⚠ WARNING: Found $CRED_COUNT potential credential exposures"
    echo ""
    echo "Details:"
    grep -r "api_key\|apikey\|api-key" "$CLAUDE_CODE_CONFIG" 2>/dev/null | head -5
else
    echo "✓ No plaintext credentials found in config files"
fi

echo ""

# 5. Environment Variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. ENVIRONMENT VARIABLES CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENV_SECRETS=$(env | grep -iE "api_key|token|secret|password|claude" | wc -l)

if [ "$ENV_SECRETS" -gt 0 ]; then
    echo "⚠ Found $ENV_SECRETS potentially sensitive environment variables"
    echo "  (Not displaying for security reasons)"
else
    echo "✓ No obvious sensitive environment variables detected"
fi

echo ""

# 6. Keychain Integration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. KEYCHAIN INTEGRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

KEYCHAIN_ITEMS=$(security find-generic-password -s "Claude" 2>/dev/null | wc -l)

if [ "$KEYCHAIN_ITEMS" -gt 0 ]; then
    echo "✓ Claude-related items found in Keychain"
    echo "  Count: $((KEYCHAIN_ITEMS / 5)) items (estimated)"
else
    echo "⚠ No Claude items found in Keychain"
    echo "  Consider storing credentials securely in Keychain"
fi

echo ""

# 7. Network Connections
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. NETWORK CONNECTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NETWORK_CONNS=$(lsof -i -P -n 2>/dev/null | grep -i claude | wc -l)

if [ "$NETWORK_CONNS" -gt 0 ]; then
    echo "✓ Active Claude network connections detected: $NETWORK_CONNS"
    echo ""
    lsof -i -P -n 2>/dev/null | grep -i claude
else
    echo "• No active network connections from Claude detected"
fi

echo ""

# 8. MCP Server Processes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. MCP SERVER PROCESSES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MCP_PROCS=$(ps aux | grep -i mcp | grep -v grep | wc -l)

if [ "$MCP_PROCS" -gt 0 ]; then
    echo "✓ Active MCP processes: $MCP_PROCS"
    ps aux | grep -i mcp | grep -v grep | awk '{print $1, $11, $12}'
else
    echo "• No active MCP server processes detected"
fi

echo ""

# 9. Claude CLI Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9. CLAUDE CLI STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v claude &> /dev/null; then
    echo "✓ Claude CLI installed"
    claude --version 2>/dev/null || echo "  (Version check failed)"
    echo ""
    echo "Attempting to list MCP servers via CLI..."
    claude mcp list 2>/dev/null || echo "  (CLI command failed)"
else
    echo "✗ Claude CLI not found in PATH"
    echo "  Run: which claude"
fi

echo ""

# 10. Summary & Recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "10. SECURITY SUMMARY & RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "PRIORITY ACTIONS:"
echo "────────────────"
echo "1. [ ] Run full assessment with telecom_mcp_security_assessment.md"
echo "2. [ ] Review MCP server configurations for credential exposure"
echo "3. [ ] Audit file permissions - ensure config files are 600"
echo "4. [ ] Migrate plaintext credentials to macOS Keychain"
echo "5. [ ] Verify OAuth 2.0 for all API-based MCP servers"
echo "6. [ ] Set up audit logging for MCP operations"
echo "7. [ ] Document credentials rotation schedule"
echo "8. [ ] Test incident response procedures"
echo ""

echo "RESOURCES:"
echo "──────────"
echo "Full assessment: telecom_mcp_security_assessment.md"
echo "Detailed commands: claude_code_mcp_commands.md"
echo "Automated scan: claude_code_security_assessment.sh"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Report generated: $(date)"
echo "Save this report: security_report_$(date +%Y%m%d_%H%M%S).txt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
