#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"123456"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "🧪 测试工具解说功能（120秒超时）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

timeout 120 curl -N -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "班级总数是多少？",
    "userId": "1",
    "conversationId": "test-'$(date +%s)'",
    "context": {"role": "admin", "enableTools": true}
  }' 2>&1 | while IFS= read -r line; do
    if echo "$line" | grep -q "event:"; then
      EVENT_TYPE=$(echo "$line" | sed 's/event: //')
      echo "📡 [$EVENT_TYPE]"
    fi
    
    if echo "$line" | grep -q "data:" | grep -q "narration"; then
      echo "💬 [解说] $line"
    fi
    
    if echo "$line" | grep -q "event: complete"; then
      echo "✅ 完成，正在检查..."
      sleep 2
      break
    fi
  done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
