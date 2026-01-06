#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"123456"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "🧪 测试双解说功能（调用前+调用后）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

timeout 60 curl -N -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "班级总数是多少？",
    "userId": "1",
    "conversationId": "test-'$(date +%s)'",
    "context": {"role": "admin", "enableTools": true}
  }' 2>&1 | while IFS= read -r line; do
    if echo "$line" | grep -q "event: tool_reason"; then
      read -r data_line
      echo "💭 [调用前] $data_line"
    fi
    
    if echo "$line" | grep -q "event: tool_call_start"; then
      read -r data_line
      TOOL_NAME=$(echo "$data_line" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
      echo "🔧 [工具执行] $TOOL_NAME"
    fi
    
    if echo "$line" | grep -q "event: tool_narration"; then
      read -r data_line
      echo "💬 [调用后] $data_line"
    fi
    
    if echo "$line" | grep -q "event: complete"; then
      echo "✅ 完成"
      break
    fi
  done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 测试完成"
