#!/bin/bash

# 教师菜单修复 - 完整测试脚本

echo "🔍 教师菜单修复 - 完整测试"
echo "================================"
echo ""

# 1. 测试后端连接
echo "1️⃣ 测试后端连接..."
HEALTH=$(curl -s http://localhost:3000/api-docs/ | head -1)
if [ -z "$HEALTH" ]; then
  echo "❌ 后端未启动"
  exit 1
fi
echo "✅ 后端已启动"
echo ""

# 2. 教师登录
echo "2️⃣ 教师账号登录..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher_demo",
    "password": "password123"
  }')

echo "登录响应: $LOGIN_RESPONSE"
echo ""

# 提取token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "⚠️ 登录失败，尝试其他账号..."
  # 尝试其他账号
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "teacher",
      "password": "password123"
    }')
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo "❌ 无法获取token"
  exit 1
fi

echo "✅ 教师登录成功"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 3. 获取菜单权限
echo "3️⃣ 获取菜单权限..."
MENU_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth-permissions/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "菜单响应: $MENU_RESPONSE" | head -c 500
echo ""
echo ""

# 4. 分析菜单
echo "4️⃣ 分析菜单..."
MENU_COUNT=$(echo $MENU_RESPONSE | grep -o '"code"' | wc -l)
echo "✅ 菜单项数量: $MENU_COUNT"

# 检查是否包含TEACHER_权限
TEACHER_COUNT=$(echo $MENU_RESPONSE | grep -o 'TEACHER_' | wc -l)
echo "✅ TEACHER_权限数: $TEACHER_COUNT"

# 检查是否包含PARENT_权限
PARENT_COUNT=$(echo $MENU_RESPONSE | grep -o 'PARENT_' | wc -l)
echo "✅ PARENT_权限数: $PARENT_COUNT (应该为0)"

echo ""

# 5. 验证结果
echo "5️⃣ 验证结果..."
if [ $MENU_COUNT -gt 20 ]; then
  echo "✅ 菜单权限充足 (> 20个)"
  echo "✅ 修复成功！"
else
  echo "❌ 菜单权限不足 (< 20个)"
  echo "❌ 修复失败"
fi

if [ $PARENT_COUNT -eq 0 ]; then
  echo "✅ 正确排除了PARENT_权限"
else
  echo "⚠️ 仍然包含PARENT_权限"
fi

echo ""
echo "================================"
echo "✅ 测试完成"

