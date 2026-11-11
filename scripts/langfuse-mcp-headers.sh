#!/usr/bin/env bash
# Prints the Authorization header for the Langfuse MCP server (used by .mcp.json headersHelper).
# Reads LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY from the environment, falling back to .env.local.
set -euo pipefail

ENV_FILE="$(dirname "$0")/../.env.local"

read_var() {
  local name="$1"
  if [ -n "${!name:-}" ]; then
    printf '%s' "${!name}"
  elif [ -f "$ENV_FILE" ]; then
    grep -E "^${name}=" "$ENV_FILE" | tail -n1 | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/; s/^'\''(.*)'\''$/\1/'
  fi
}

pk="$(read_var LANGFUSE_PUBLIC_KEY)"
sk="$(read_var LANGFUSE_SECRET_KEY)"

if [ -z "$pk" ] || [ -z "$sk" ]; then
  echo "LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY not set (env or .env.local)" >&2
  exit 1
fi

token="$(printf '%s:%s' "$pk" "$sk" | base64 | tr -d '\n')"
printf '{"Authorization": "Basic %s"}\n' "$token"
