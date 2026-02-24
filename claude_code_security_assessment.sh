#!/bin/bash

# Claude Code Security Assessment Script for macOS
# This script audits your Claude Code MCP configuration for security issues
# Run with: bash claude_code_security_assessment.sh

echo "=========================================="
echo "Claude Code Security Assessment - macOS"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define paths for macOS
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
CLAUDE_CODE_CONFIG_DIR="$HOME/.claude"
CLAUDE_MCP_CONFIG="$CLAUDE_CONFIG_DIR/claude_code_config.json"
CLAUDE_SETTINGS="$CLAUDE_CONFIG_DIR/settings.json"

echo -e "${BLUE}[1] CHECKING CLAUDE CODE INSTALLATION${NC}"
echo "========================================"

if command -v claude &> /dev/null; then
    echo -e "${GREEN}✓${NC} Claude CLI found"
    claude --version
else
    echo -e "${RED}✗${NC} Claude CLI not found in PATH"
fi

echo ""
echo -e "${BLUE}[2] CHECKING CONFIGURATION DIRECTORIES${NC}"
echo "========================================"

if [ -d "$CLAUDE_CONFIG_DIR" ]; then
    echo -e "${GREEN}✓${NC} Claude config directory exists: $CLAUDE_CONFIG_DIR"
    echo "  Permissions:"
    ls -ld "$CLAUDE_CONFIG_DIR"
else
    echo -e "${YELLOW}⚠${NC} Claude config directory not found"
fi

if [ -d "$CLAUDE_CODE_CONFIG_DIR" ]; then
    echo -e "${GREEN}✓${NC} Claude Code config directory exists: $CLAUDE_CODE_CONFIG_DIR"
    echo "  Permissions:"
    ls -ld "$CLAUDE_CODE_CONFIG_DIR"
else
    echo -e "${YELLOW}⚠${NC} Claude Code config directory not found"
fi

echo ""
echo -e "${BLUE}[3] CHECKING MCP CONFIGURATION${NC}"
echo "========================================"

# Check common MCP config locations
MCP_CONFIG_LOCATIONS=(
    "$CLAUDE_CONFIG_DIR/mcp.json"
    "$CLAUDE_CODE_CONFIG_DIR/mcp.json"
    "$HOME/.claude/mcp_config.json"
    "$HOME/.claude/config.json"
)

MCP_CONFIG_FOUND=0
for config_loc in "${MCP_CONFIG_LOCATIONS[@]}"; do
    if [ -f "$config_loc" ]; then
        echo -e "${GREEN}✓${NC} Found MCP config: $config_loc"
        MCP_CONFIG_FOUND=1
        echo "  File size: $(du -h "$config_loc" | cut -f1)"
        echo "  Permissions:"
        ls -l "$config_loc"
        echo ""
        echo "  Configuration contents:"
        cat "$config_loc" | head -50
        echo ""
    fi
done

if [ $MCP_CONFIG_FOUND -eq 0 ]; then
    echo -e "${YELLOW}⚠${NC} No MCP configuration files found"
fi

echo ""
echo -e "${BLUE}[4] CHECKING ENVIRONMENT VARIABLES${NC}"
echo "========================================"

echo "Checking for Claude/API-related environment variables:"
env | grep -iE '(CLAUDE|API|TOKEN|KEY|SECRET|MCP)' | grep -v "^_=" || echo "  No suspicious env vars found (filtered view)"

echo ""
echo -e "${BLUE}[5] LISTING MCP SERVERS (if CLI available)${NC}"
echo "========================================"

if command -v claude &> /dev/null; then
    echo "Attempting to list MCP servers..."
    # Try different commands
    if claude mcp list 2>/dev/null; then
        :
    elif claude mcp status 2>/dev/null; then
        :
    else
        echo -e "${YELLOW}⚠${NC} Could not list MCP servers via CLI"
        echo "  Try running: claude mcp list"
    fi
else
    echo -e "${YELLOW}⚠${NC} Claude CLI not available, cannot list MCP servers"
fi

echo ""
echo -e "${BLUE}[6] CHECKING FOR CREDENTIAL STORAGE${NC}"
echo "========================================"

echo "Checking for API keys/tokens in common locations:"

# Check .env files
if [ -f "$HOME/.env" ]; then
    echo -e "${RED}⚠ WARNING${NC}: .env file found in home directory"
    echo "  Location: $HOME/.env"
    echo "  This may contain sensitive credentials"
fi

if [ -f "$CLAUDE_CODE_CONFIG_DIR/.env" ]; then
    echo -e "${RED}⚠ WARNING${NC}: .env file found in Claude Code config"
    echo "  Location: $CLAUDE_CODE_CONFIG_DIR/.env"
fi

# Check for credential files
CREDENTIAL_FILES=(
    ".credentials"
    ".secrets"
    "credentials.json"
    "secrets.json"
)

for cred_file in "${CREDENTIAL_FILES[@]}"; do
    if [ -f "$CLAUDE_CONFIG_DIR/$cred_file" ]; then
        echo -e "${YELLOW}⚠${NC} Found credential file: $CLAUDE_CONFIG_DIR/$cred_file"
        echo "  Permissions: $(ls -l "$CLAUDE_CONFIG_DIR/$cred_file" | awk '{print $1, $3, $4}')"
    fi
done

echo ""
echo -e "${BLUE}[7] FILE PERMISSIONS AUDIT${NC}"
echo "========================================"

echo "Checking file permissions (should be readable only by user):"
echo ""

for dir in "$CLAUDE_CONFIG_DIR" "$CLAUDE_CODE_CONFIG_DIR"; do
    if [ -d "$dir" ]; then
        echo "Checking: $dir"
        find "$dir" -type f -exec ls -l {} \; | awk '{print $1, $9}' | head -20
        echo ""
    fi
done

echo -e "${BLUE}[8] CHECKING FOR KEYCHAIN INTEGRATION${NC}"
echo "========================================"

# Check if credentials stored in macOS Keychain
echo "Checking for Claude-related items in macOS Keychain:"
security find-generic-password -s "Claude" -a "*" 2>/dev/null | grep "acct\|svc" || echo "  No Claude items found in Keychain"

echo ""
echo -e "${BLUE}[9] CHECKING FOR RECENT MCP SERVER CONNECTIONS${NC}"
echo "========================================"

# Check logs if available
if [ -f "$HOME/Library/Logs/Claude/claude.log" ]; then
    echo "Recent MCP connections from logs:"
    tail -50 "$HOME/Library/Logs/Claude/claude.log" | grep -iE "(mcp|server|connect)" || echo "  No MCP connections found in recent logs"
else
    echo -e "${YELLOW}⚠${NC} Claude logs not found at: $HOME/Library/Logs/Claude/claude.log"
fi

echo ""
echo -e "${BLUE}[10] NETWORK SECURITY CHECK${NC}"
echo "========================================"

echo "Checking for network connections from Claude Code:"
lsof -i -P -n 2>/dev/null | grep -i claude || echo "  No active Claude network connections detected"

echo ""
echo -e "${BLUE}[11] CUSTOM MCP SERVER STATUS${NC}"
echo "========================================"

# Check if there are local MCP servers configured
echo "Checking for local MCP server processes:"
ps aux | grep -i mcp | grep -v grep || echo "  No active MCP server processes found"

echo ""
echo -e "${BLUE}[12] SECURITY RECOMMENDATIONS${NC}"
echo "========================================"

echo "Based on your setup, review these security items:"
echo ""
echo "1. CREDENTIAL MANAGEMENT"
echo "   [ ] Are API keys stored in Keychain, not config files?"
echo "   [ ] Are environment variables properly scoped?"
echo "   [ ] Do config files have restricted permissions (600)?"
echo ""
echo "2. MCP SERVER CONFIGURATION"
echo "   [ ] List all configured MCP servers"
echo "   [ ] Verify each server's transport method (stdio/HTTP)"
echo "   [ ] Check authentication mechanisms for each server"
echo ""
echo "3. ACCESS CONTROL"
echo "   [ ] Review which data/APIs each MCP server can access"
echo "   [ ] Set appropriate permission boundaries"
echo "   [ ] Implement principle of least privilege"
echo ""
echo "4. AUDIT LOGGING"
echo "   [ ] Enable audit logging for MCP operations"
echo "   [ ] Monitor for unusual access patterns"
echo "   [ ] Check logs for failed authentication attempts"
echo ""
echo "5. NETWORK SECURITY"
echo "   [ ] Use HTTPS only for remote MCP servers"
echo "   [ ] Verify certificate validation"
echo "   [ ] Use SSH tunneling for sensitive connections"
echo ""
echo "6. CODE EXECUTION"
echo "   [ ] Review custom MCP servers for injection vulnerabilities"
echo "   [ ] Implement sandboxing for code execution"
echo "   [ ] Set resource limits (timeout, memory)"
echo ""
echo "7. SECRET ROTATION"
echo "   [ ] Establish rotation policy for API keys"
echo "   [ ] Document token expiry dates"
echo "   [ ] Automate credential updates"
echo ""

echo ""
echo "=========================================="
echo "Assessment Complete"
echo "=========================================="
