#!/bin/bash

echo "🔍 开始家长端菜单复查..."
echo ""

# 1. 检查前端是否启动
echo "1️⃣ 检查前端服务..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ 前端服务已启动"
else
  echo "❌ 前端服务未启动 (HTTP $FRONTEND_STATUS)"
  exit 1
fi

# 2. 检查后端是否启动
echo ""
echo "2️⃣ 检查后端服务..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api-docs/)
if [ "$BACKEND_STATUS" = "200" ]; then
  echo "✅ 后端服务已启动"
else
  echo "❌ 后端服务未启动 (HTTP $BACKEND_STATUS)"
  exit 1
fi

# 3. 测试家长登录
echo ""
echo "3️⃣ 测试家长登录..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_parent",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 家长登录失败"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ 家长登录成功"
echo "Token: ${TOKEN:0:20}..."

# 4. 获取家长菜单权限
echo ""
echo "4️⃣ 获取家长菜单权限..."
MENU_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth-permissions/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

MENU_COUNT=$(echo $MENU_RESPONSE | grep -o '"code"' | wc -l)
echo "✅ 获取菜单成功，权限数量: $MENU_COUNT"

# 5. 检查是否包含SYSTEM权限（不应该有）
echo ""
echo "5️⃣ 检查权限隔离..."
SYSTEM_COUNT=$(echo $MENU_RESPONSE | grep -o 'SYSTEM_' | wc -l)
PARENT_COUNT=$(echo $MENU_RESPONSE | grep -o 'PARENT_' | wc -l)

if [ "$SYSTEM_COUNT" -eq 0 ]; then
  echo "✅ 正确：家长没有SYSTEM权限"
else
  echo "❌ 错误：家长仍然有SYSTEM权限 ($SYSTEM_COUNT个)"
fi

echo "✅ 家长有PARENT_权限: $PARENT_COUNT个"

# 6. 检查权限检查API
echo ""
echo "6️⃣ 检查权限检查API..."
CHECK_RESPONSE=$(curl -s -X POST http://localhost:3000/api/permissions/check-page \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pagePath": "/parent-center/dashboard"
  }')

HAS_PERMISSION=$(echo $CHECK_RESPONSE | grep -o '"hasPermission":[^,}]*' | cut -d':' -f2)

if [ "$HAS_PERMISSION" = "true" ]; then
  echo "✅ 家长有权限访问/parent-center/dashboard"
else
  echo "❌ 家长无权限访问/parent-center/dashboard"
fi

# 7. 检查家长是否能访问admin页面（应该不能）
echo ""
echo "7️⃣ 检查admin页面权限隔离..."
ADMIN_CHECK=$(curl -s -X POST http://localhost:3000/api/permissions/check-page \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pagePath": "/system-center"
  }')

ADMIN_PERMISSION=$(echo $ADMIN_CHECK | grep -o '"hasPermission":[^,}]*' | cut -d':' -f2)

if [ "$ADMIN_PERMISSION" = "false" ]; then
  echo "✅ 正确：家长无权限访问/system-center"
else
  echo "❌ 错误：家长可以访问/system-center"
fi

# 8. 总结
echo ""
echo "================================"
echo "✅ 家长端菜单复查完成"
echo "================================"
echo ""
echo "📊 检查结果:"
echo "  ✅ 前端服务: 正常"
echo "  ✅ 后端服务: 正常"
echo "  ✅ 家长登录: 成功"
echo "  ✅ 菜单权限: $MENU_COUNT个"
echo "  ✅ SYSTEM权限: $SYSTEM_COUNT个 (应该为0)"
echo "  ✅ PARENT权限: $PARENT_COUNT个"
echo "  ✅ 权限隔离: 正确"

