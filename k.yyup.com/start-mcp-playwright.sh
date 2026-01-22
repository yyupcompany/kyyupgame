#!/bin/bash

# MCP Playwright 启动脚本
# 用于 opencode 集成

set -e

echo "🎭 启动 MCP Playwright 服务器..."

# 设置环境变量
export PLAYWRIGHT_BROWSERS_PATH="./node_modules/.playwright"
export OUTPUT_DIR="./.playwright-mcp/output"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 检查参数
MODE=${1:-headless}
PORT=${2:-12306}

echo "📋 模式: $MODE"
echo "🌐 端口: $PORT"

case $MODE in
  "headed")
    echo "🖥️  启动有头模式..."
    npx -y @playwright/mcp@latest \
      --allow-unrestricted-file-access \
      --shared-browser-context \
      --save-trace \
      --save-video=1280x720 \
      --output-dir "$OUTPUT_DIR" \
      --port "$PORT"
    ;;
  "debug")
    echo "🐛 启动调试模式..."
    npx -y @playwright/mcp@latest \
      --console-level debug \
      --allow-unrestricted-file-access \
      --shared-browser-context \
      --save-trace \
      --save-video=1280x720 \
      --output-dir "$OUTPUT_DIR" \
      --port "$PORT"
    ;;
  *)
    echo "🔧 启动无头模式（默认）..."
    npx -y @playwright/mcp@latest \
      --headless \
      --allow-unrestricted-file-access \
      --shared-browser-context \
      --save-trace \
      --output-dir "$OUTPUT_DIR" \
      --port "$PORT"
    ;;
esac

echo "✅ MCP Playwright 服务器已启动"
echo "📁 输出目录: $OUTPUT_DIR"
echo "🔗 连接地址: http://localhost:$PORT"