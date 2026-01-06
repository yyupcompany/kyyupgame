#!/bin/bash

# 测试单个工具的脚本
# 用法: ./test_single_tool.sh <工具编号> <工具名称>

if [ $# -lt 2 ]; then
    echo "用法: $0 <工具编号> <工具名称> [测试消息]"
    echo "示例: $0 1 any_query \"请查询学生人数\""
    exit 1
fi

TOOL_NUM=$1
TOOL_NAME=$2
TEST_MESSAGE=${3:-"测试消息: $TOOL_NAME"}

echo "========================================"
echo "🔧 测试单个工具: #$TOOL_NUM $TOOL_NAME"
echo "========================================"

# 设置参数
API_URL="http://localhost:3000/api/ai/unified/stream-chat"
OUTPUT_FILE="tool_test_results/tool_${TOOL_NUM}_${TOOL_NAME}.json"

# 创建输出目录
mkdir -p "tool_test_results"

# 准备JSON数据
cat > /tmp/tool_test.json <<EOF
{
  "message": "$TEST_MESSAGE",
  "userId": "$TOOL_NUM",
  "context": {
    "role": "admin",
    "enableTools": true
  }
}
EOF

echo "📤 发送请求到: $API_URL"
echo "📝 测试消息: $TEST_MESSAGE"
echo "💾 结果文件: $OUTPUT_FILE"
echo ""

# 执行请求
start_time=$(date +%s)
curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -d "@/tmp/tool_test.json" \
    --no-buffer > "$OUTPUT_FILE"
end_time=$(date +%s)

# 显示结果
if [ -f "$OUTPUT_FILE" ]; then
    file_size=$(wc -c < "$OUTPUT_FILE")
    echo "✅ 测试完成"
    echo "⏱️  耗时: $((end_time - start_time)) 秒"
    echo "💾 文件大小: $file_size 字节"
    echo ""
    echo "📄 返回内容预览:"
    head -20 "$OUTPUT_FILE"
    echo ""
    echo "💾 完整内容保存在: $OUTPUT_FILE"
else
    echo "❌ 测试失败，未生成结果文件"
fi

# 清理
rm -f /tmp/tool_test.json
