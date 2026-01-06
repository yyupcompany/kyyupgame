#!/bin/bash

echo "🧪 测试UDP呼叫功能"
echo "================================"
echo ""

# 1. 先登录获取token
echo "📝 步骤1: 登录获取Token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "登录响应: $LOGIN_RESPONSE"
echo ""

# 提取token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取Token"
  echo "请检查用户名和密码是否正确"
  exit 1
fi

echo "✅ 登录成功！"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. 测试SIP状态
echo "📝 步骤2: 获取SIP状态..."
SIP_STATUS=$(curl -s -X GET http://localhost:3000/api/call-center/sip/status \
  -H "Authorization: Bearer $TOKEN")

echo "SIP状态: $SIP_STATUS"
echo ""

# 3. 发起UDP呼叫
echo "📝 步骤3: 发起UDP呼叫..."
CALL_RESPONSE=$(curl -s -X POST http://localhost:3000/api/call-center/call/udp/make \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phoneNumber": "18611141133",
    "customerId": 1,
    "systemPrompt": "你是一位专业的幼儿园招生顾问"
  }')

echo "呼叫响应: $CALL_RESPONSE"
echo ""

# 提取callId
CALL_ID=$(echo $CALL_RESPONSE | grep -o '"callId":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$CALL_ID" ]; then
  echo "✅ 呼叫发起成功！"
  echo "Call ID: $CALL_ID"
  echo ""
  
  # 4. 等待5秒
  echo "⏳ 等待5秒观察SIP响应..."
  sleep 5
  echo ""
  
  # 5. 获取通话状态
  echo "📝 步骤4: 获取通话状态..."
  STATUS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/call-center/call/udp/$CALL_ID/status" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "通话状态: $STATUS_RESPONSE"
  echo ""
  
  # 6. 获取活跃通话列表
  echo "📝 步骤5: 获取活跃通话列表..."
  ACTIVE_RESPONSE=$(curl -s -X GET http://localhost:3000/api/call-center/calls/udp/active \
    -H "Authorization: Bearer $TOKEN")
  
  echo "活跃通话: $ACTIVE_RESPONSE"
  echo ""
  
  # 7. 等待10秒后挂断
  echo "⏳ 等待10秒后挂断..."
  sleep 10
  echo ""
  
  # 8. 挂断通话
  echo "📝 步骤6: 挂断通话..."
  HANGUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/call-center/call/udp/hangup \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"callId\": \"$CALL_ID\"}")
  
  echo "挂断响应: $HANGUP_RESPONSE"
  echo ""
  
  echo "✅ 测试完成！"
else
  echo "❌ 呼叫发起失败"
  echo "响应: $CALL_RESPONSE"
fi

echo ""
echo "================================"
echo "测试结束"

