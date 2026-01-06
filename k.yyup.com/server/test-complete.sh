#!/bin/bash

echo "🔐 测试登录并获取token..."

# 登录并获取token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "📝 登录响应:"
echo "$LOGIN_RESPONSE" | jq '.'

# 提取token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取token"
  exit 1
fi

echo "✅ 登录成功！Token: ${TOKEN:0:50}..."

echo ""
echo "🤖 测试AI聊天功能..."

# 测试AI聊天
CHAT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/ai/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"你好，请介绍一下你自己","model":"gpt-3.5-turbo"}')

echo "💬 AI聊天响应:"
echo "$CHAT_RESPONSE" | jq '.'

echo ""
echo "🎯 测试完成！"
