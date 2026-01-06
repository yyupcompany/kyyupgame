#!/bin/bash

# 快捷登录测试脚本
# 获取 JWT Token

echo "🔐 正在快捷登录..."

# 调用正常的登录 API（admin/123456）
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }')

# 提取 token
TOKEN=$(echo $RESPONSE | jq -r '.data.token // .token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ 登录失败！"
  echo "响应内容："
  echo $RESPONSE | jq .
  exit 1
fi

echo "✅ 登录成功！"
echo "📋 Token: ${TOKEN:0:50}..."
echo ""

# 保存 token 到临时文件
echo $TOKEN > /tmp/test_token.txt
echo "💾 Token 已保存到: /tmp/test_token.txt"
