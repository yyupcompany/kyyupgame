#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"123456"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🧪 Flash模型优化效果测试                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 测试1：简单查询（应该使用Flash）
echo "📝 测试1：简单查询（\"班级总数是多少？\"）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

START=$(date +%s)

timeout 60 curl -s -N -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "班级总数是多少？",
    "userId": "1",
    "conversationId": "test-simple-'$(date +%s)'",
    "context": {"role": "admin", "enableTools": true}
  }' 2>&1 | while IFS= read -r line; do
    
    if echo "$line" | grep -q "event: tool_reason"; then
      read -r data_line
      echo "   💭 调用前说明已发送"
    fi
    
    if echo "$line" | grep -q "event: tool_narration"; then
      read -r data_line
      NARRATION=$(echo "$data_line" | grep -o '"narration":"[^"]*"' | cut -d'"' -f4)
      END=$(date +%s)
      ELAPSED=$((END - START))
      echo "   💬 调用后解说：$NARRATION"
      echo "   ⏱️  总耗时：${ELAPSED}秒"
      break
    fi
    
    if echo "$line" | grep -q "event: complete"; then
      break
    fi
  done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "查看后端模型选择日志..."
echo ""

tail -100 /tmp/backend.log | grep -E "复杂度判断|模型选择" | tail -5

echo ""
echo "╚════════════════════════════════════════════════════════════════╝"
