#!/bin/bash

# 为 dashboard 添加 todo 种子数据的脚本

API_URL="http://localhost:3000/api"
USERNAME="admin"
PASSWORD="admin123"

echo "🚀 开始为 dashboard 添加 todo 种子数据..."

# 1. 登录获取 token
echo "📝 正在登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi

echo "✅ 登录成功"

# 2. 添加待办事项
TODOS=(
  '{"title":"审核新入园申请","description":"审核本周收到的新入园申请材料，需要检查证件完整性","priority":2,"dueDate":"2025-11-19T00:00:00Z"}'
  '{"title":"制定暑期计划","description":"制定暑期托管班的详细安排和课程表","priority":3,"dueDate":"2025-11-22T00:00:00Z"}'
  '{"title":"采购教学用品","description":"为新学期采购必要的教学用品和玩具","priority":3,"dueDate":"2025-11-24T00:00:00Z"}'
  '{"title":"准备家长会议","description":"准备下周的家长会议资料和演讲稿","priority":2,"dueDate":"2025-11-20T00:00:00Z"}'
  '{"title":"更新班级环境布置","description":"更新主题墙内容，展示幼儿作品","priority":4,"dueDate":"2025-11-27T00:00:00Z"}'
)

echo "📋 正在添加待办事项..."
COUNT=0

for TODO in "${TODOS[@]}"; do
  RESPONSE=$(curl -s -X POST "$API_URL/dashboard/todos" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$TODO")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    TITLE=$(echo "$TODO" | grep -o '"title":"[^"]*' | cut -d'"' -f4)
    echo "  ✅ 添加成功: $TITLE"
    ((COUNT++))
  else
    echo "  ❌ 添加失败: $TODO"
  fi
done

echo ""
echo "🎉 完成！共添加 $COUNT 条待办事项"

