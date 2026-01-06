#!/bin/bash

# 呼叫中心API测试脚本
# 测试UDP呼叫功能

echo "🧪 呼叫中心API测试"
echo "================================"
echo ""

# API基础URL
API_URL="http://localhost:3000/api/call-center"

# 测试用的JWT Token（需要先登录获取）
# 这里使用一个示例token，实际使用时需要替换
TOKEN="your-jwt-token-here"

echo "📝 提示: 请先登录获取JWT Token"
echo "   可以使用: POST http://localhost:3000/api/auth/login"
echo ""
read -p "请输入JWT Token (或按Enter跳过): " USER_TOKEN

if [ ! -z "$USER_TOKEN" ]; then
  TOKEN="$USER_TOKEN"
fi

echo ""
echo "================================"
echo ""

# 测试1: 发起UDP呼叫
echo "📞 测试1: 发起UDP呼叫"
echo "-----------------------------------"

CALL_RESPONSE=$(curl -s -X POST "$API_URL/call/udp/make" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phoneNumber": "18611141133",
    "customerId": 1,
    "systemPrompt": "你是一位专业的幼儿园招生顾问"
  }')

echo "响应: $CALL_RESPONSE"
echo ""

# 提取callId
CALL_ID=$(echo $CALL_RESPONSE | grep -o '"callId":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$CALL_ID" ]; then
  echo "✅ 呼叫发起成功！"
  echo "   Call ID: $CALL_ID"
  echo ""
  
  # 等待5秒
  echo "⏳ 等待5秒..."
  sleep 5
  echo ""
  
  # 测试2: 获取通话状态
  echo "📊 测试2: 获取通话状态"
  echo "-----------------------------------"
  
  STATUS_RESPONSE=$(curl -s -X GET "$API_URL/call/udp/$CALL_ID/status" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "响应: $STATUS_RESPONSE"
  echo ""
  
  # 测试3: 获取活跃通话列表
  echo "📋 测试3: 获取活跃通话列表"
  echo "-----------------------------------"
  
  ACTIVE_RESPONSE=$(curl -s -X GET "$API_URL/calls/udp/active" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "响应: $ACTIVE_RESPONSE"
  echo ""
  
  # 等待10秒
  echo "⏳ 等待10秒后挂断..."
  sleep 10
  echo ""
  
  # 测试4: 挂断通话
  echo "📞 测试4: 挂断通话"
  echo "-----------------------------------"
  
  HANGUP_RESPONSE=$(curl -s -X POST "$API_URL/call/udp/hangup" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"callId\": \"$CALL_ID\"}")
  
  echo "响应: $HANGUP_RESPONSE"
  echo ""
  
  echo "✅ 测试完成！"
else
  echo "❌ 呼叫发起失败"
  echo "   可能原因:"
  echo "   1. JWT Token无效或未提供"
  echo "   2. 后端服务未启动"
  echo "   3. SIP服务器配置错误"
fi

echo ""
echo "================================"
echo "测试结束"

