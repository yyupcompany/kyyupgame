#!/bin/bash

# 幼儿园AI助手工具批量测试脚本
# 园长视角的工具测试

echo "========================================"
echo "🏫 幼儿园AI助手工具批量测试"
echo "📅 测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# 设置测试参数
API_URL="http://localhost:3000/api/ai/unified-stream/stream-chat"
JWT_TOKEN="${JWT_TOKEN:-YOUR_JWT_TOKEN_HERE}"
OUTPUT_DIR="tool_test_results"
LOG_FILE="tool_test_log.txt"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 测试工具函数
test_tool() {
    local tool_num=$1
    local tool_name=$2
    local test_message=$3
    
    echo "----------------------------------------"
    echo "🔧 测试工具 #$tool_num: $tool_name"
    echo "----------------------------------------"
    
    # 准备请求数据
    local request_data=$(cat <<EOF
{
  "message": "$test_message",
  "userId": "$tool_num",
  "context": {
    "role": "admin",
    "enableTools": true
  }
}
