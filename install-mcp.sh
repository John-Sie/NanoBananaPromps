#!/usr/bin/env bash
#
# install-mcp.sh — 一键安装本项目用到的 5 个 MCP servers
#   perplexity / playwright / firecrawl / glif / chrome-devtools
#
# 用法:
#   ./install-mcp.sh            # 安装到当前项目 (local 范围)
#   ./install-mcp.sh -s user    # 安装到用户全局 (所有项目可用)
#
# 需要的环境变量 (没设置则跳过对应需要 Key 的 MCP):
#   PERPLEXITY_API_KEY  FIRECRAWL_API_KEY  GLIF_API_TOKEN
#
set -euo pipefail

# ---- 解析 -s 范围参数 (默认 local) ------------------------------------------
SCOPE="local"
if [[ "${1:-}" == "-s" && -n "${2:-}" ]]; then
  SCOPE="$2"
fi
SCOPE_ARGS=(-s "$SCOPE")

# ---- 自动读取同目录下的 .mcp.env (存放 API Key, 已被 git 忽略) ----------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/.mcp.env" ]]; then
  echo "🔑 读取 $SCRIPT_DIR/.mcp.env"
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.mcp.env"
  set +a
fi

# ---- 前置检查 ----------------------------------------------------------------
if ! command -v claude >/dev/null 2>&1; then
  echo "❌ 找不到 claude CLI，请先安装 Claude Code。" >&2
  exit 1
fi
if ! command -v npx >/dev/null 2>&1; then
  echo "❌ 找不到 npx，请先安装 Node.js。" >&2
  exit 1
fi

echo "📦 安装范围: $SCOPE"
echo

# 已存在则先移除，保证可重复执行 (幂等)
re_add() {
  local name="$1"; shift
  claude mcp remove "$name" "${SCOPE_ARGS[@]}" >/dev/null 2>&1 || true
  claude mcp add "$name" "${SCOPE_ARGS[@]}" "$@"
}

# ---- 1. Playwright (无需 Key) ------------------------------------------------
echo "→ 安装 playwright"
re_add playwright -- npx -y @playwright/mcp@latest

# ---- 2. Chrome DevTools (无需 Key) -------------------------------------------
echo "→ 安装 chrome-devtools"
re_add chrome-devtools -- npx -y chrome-devtools-mcp@latest

# ---- 3. Perplexity (需 PERPLEXITY_API_KEY) -----------------------------------
if [[ -n "${PERPLEXITY_API_KEY:-}" ]]; then
  echo "→ 安装 perplexity"
  re_add perplexity -e "PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY" -- npx -y server-perplexity-ask
else
  echo "⏭  跳过 perplexity (未设置 PERPLEXITY_API_KEY)"
fi

# ---- 4. Firecrawl (需 FIRECRAWL_API_KEY) -------------------------------------
if [[ -n "${FIRECRAWL_API_KEY:-}" ]]; then
  echo "→ 安装 firecrawl"
  re_add firecrawl -e "FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY" -- npx -y firecrawl-mcp
else
  echo "⏭  跳过 firecrawl (未设置 FIRECRAWL_API_KEY)"
fi

# ---- 5. Glif (需 GLIF_API_TOKEN) ---------------------------------------------
if [[ -n "${GLIF_API_TOKEN:-}" ]]; then
  echo "→ 安装 glif"
  re_add glif -e "GLIF_API_TOKEN=$GLIF_API_TOKEN" -- npx -y @glifxyz/glif-mcp-server
else
  echo "⏭  跳过 glif (未设置 GLIF_API_TOKEN)"
fi

echo
echo "✅ 完成！当前已配置的 MCP servers:"
claude mcp list
