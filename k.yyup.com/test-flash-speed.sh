#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"123456"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "🧪 测试Flash模型速度（vs Think模型）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START_TIME=$(date +%s)

timeout 60 curl -N -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "班级总数是多少？",
    "userId": "1",
    "conversationId": "test-'$(date +%s)'",
    "context": {"role": "admin", "enableTools": true}
  }' 2>&1 | while IFS= read -r line; do
    
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if echo "$line" | grep -q "event: tool_reason"; then
      read -r data_line
      REASON=$(echo "$data_line" | grep -o '"reason":"[^"]*"' | cut -d'"' -f4)
      echo "[$ELAPSED秒] 💭 调用前：$REASON"
    fi
    
    if echo "$line" | grep -q "event: tool_call_start"; then
      read -r data_line
      TOOL=$(echo "$data_line" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
      echo "[$ELAPSED秒] 🔧 工具执行：$TOOL"
    fi
    
    if echo "$line" | grep -q "event: tool_narration"; then
      read -r data_line
      NARRATION=$(echo "$data_line" | grep -o '"narration":"[^"]*"' | cut -d'"' -f4)
      END_TIME=$(date +%s)
      TOTAL=$((END_TIME - START_TIME))
      echo "[$TOTAL秒] 💬 调用后：$NARRATION"
      echo ""
      echo "⚡ Flash模型响应时间：$TOTAL秒"
    fi
    
    if echo "$line" | grep -q "event: complete"; then
      echo "✅ 完成"
      break
    fi
  done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
