#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "📊 任务中心页面错误检测报告"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 获取认证Token
echo "🔐 获取认证Token..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 无法获取认证Token"
  exit 1
fi

echo "✅ 认证Token获取成功"
echo ""

# 测试任务统计API
echo "📡 测试任务统计API (/api/tasks/stats)..."
STATS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/tasks/stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "响应状态码: $(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:3000/api/tasks/stats -H "Authorization: Bearer $TOKEN")"
echo "响应内容:"
echo "$STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATS_RESPONSE"
echo ""

# 测试任务列表API
echo "📡 测试任务列表API (/api/tasks)..."
LIST_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/tasks?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "响应状态码: $(curl -s -o /dev/null -w "%{http_code}" -X GET "http://localhost:3000/api/tasks?page=1&limit=10" -H "Authorization: Bearer $TOKEN")"
echo "响应内容:"
echo "$LIST_RESPONSE" | jq '.' 2>/dev/null || echo "$LIST_RESPONSE"
echo ""

# 测试任务详情API（如果存在任务）
echo "📡 测试任务详情API (/api/tasks/1)..."
DETAIL_RESPONSE=$(curl -s -X GET http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "响应状态码: $(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:3000/api/tasks/1 -H "Authorization: Bearer $TOKEN")"
echo "响应内容:"
echo "$DETAIL_RESPONSE" | jq '.' 2>/dev/null || echo "$DETAIL_RESPONSE"
echo ""

# 检查路由注册
echo "🔍 检查任务路由是否正确注册..."
echo "后端路由配置:"
grep -r "router.use.*tasks" /home/zhgue/kyyupgame/k.yyup.com/server/src/routes/ 2>/dev/null | grep -v "test" | head -10
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ API测试完成"
echo "═══════════════════════════════════════════════════════════"
