#!/bin/bash

# AI助手curl测试脚本
# 模拟前端调用后端AI助手接口

echo "🧪 AI助手curl端到端测试"
echo "=========================="

# 配置
API_URL="http://localhost:3000/api/ai/unified/stream-chat"
TOKEN="MOCK_JWT_TOKEN_FOR_TEST"

# 请求数据
REQUEST_DATA=$(cat <<EOF
{
  "message": "查询幼儿园所有人员数量",
  "userId": "1",
  "conversationId": "test-conversation-001",
  "context": {
    "role": "admin",
    "enableTools": true,
    "currentPage": "/aiassistant",
    "currentRound": 1
  }
}
EOF
)

echo ""
echo "📤 发送请求到: $API_URL"
echo "📝 请求数据:"
echo "$REQUEST_DATA" | jq '.'

echo ""
echo "🔄 开始处理... (使用curl接收SSE流)"

# 发送请求并处理SSE响应
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$REQUEST_DATA" \
  --no-buffer \
  --silent \
  --max-time 60 | while IFS= read -r line; do

    if [[ $line == event:* ]]; then
        EVENT_TYPE="${line#event: }"
        echo ""
        echo "📢 [事件] $EVENT_TYPE"
    elif [[ $line == data:* ]]; then
        DATA="${line#data: }"

        if [[ "$DATA" == "[DONE]" ]]; then
            echo ""
            echo "✅ 流式响应结束"
            break
        fi

        # 尝试解析JSON数据
        if echo "$DATA" | jq . >/dev/null 2>&1; then
            echo "📄 数据: $(echo "$DATA" | jq -c '.')"

            # 根据不同事件类型显示特定信息
            EVENT_TYPE_CURRENT=$(echo "$DATA" | jq -r '.type // .event // ""' 2>/dev/null || echo "")

            case "$EVENT_TYPE" in
                "thinking_start"|"thinking_update"|"thinking_complete")
                    echo "🤔 [思考] AI正在思考..."
                    ;;
                "tool_narration")
                    TOOL_NAME=$(echo "$DATA" | jq -r '.toolName // "unknown"' 2>/dev/null)
                    echo "🔧 [工具] $TOOL_NAME - 意图说明"
                    ;;
                "tool_call_start")
                    TOOL_NAME=$(echo "$DATA" | jq -r '.name // "unknown"' 2>/dev/null)
                    echo "🚀 [工具] 开始执行: $TOOL_NAME"
                    ;;
                "tool_call_complete")
                    TOOL_NAME=$(echo "$DATA" | jq -r '.name // "unknown"' 2>/dev/null)
                    echo "✅ [工具] 执行完成: $TOOL_NAME"
                    ;;
                "complete")
                    echo "🎉 [完成] AI处理完成"
                    ;;
                "error")
                    echo "❌ [错误] 处理失败"
                    ;;
            esac
        else
            echo "📄 数据: $DATA"
        fi
    fi
done

echo ""
echo "=========================="
echo "✅ 测试完成"