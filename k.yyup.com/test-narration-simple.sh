#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 测试工具解说功能（简化版）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 登录获取token
echo "📝 步骤1：登录..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"123456"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi
echo "✅ 登录成功"
echo ""

# 2. 发送AI查询，监听SSE流
echo "📝 步骤2：发送AI查询并监听解说..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

curl -N -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "班级总数是多少？",
    "userId": "1",
    "conversationId": "test-'$(date +%s)'",
    "context": {
      "role": "admin",
      "enableTools": true
    }
  }' 2>&1 | while IFS= read -r line; do
    # 提取tool_narration事件
    if echo "$line" | grep -q "tool_narration"; then
      echo "🎉 [解说事件] $line"
    fi
    
    # 提取工具解说内容
    if echo "$line" | grep -q "narration"; then
      echo "💬 [解说内容] $line"
    fi
    
    # 提取thinking
    if echo "$line" | grep -q "thinking"; then
      echo "💭 [思考] $line" | head -c 200
    fi
    
    # 完成事件
    if echo "$line" | grep -q "complete"; then
      echo "✅ [完成] $line"
      break
    fi
  done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 测试完成"
