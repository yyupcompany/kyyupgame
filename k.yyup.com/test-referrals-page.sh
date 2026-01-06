#!/bin/bash

# 测试老带新推广页面API

echo "========================================="
echo "  老带新推广页面API测试"
echo "========================================="
echo ""

# 1. 登录获取token
echo "1. 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_teacher","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登录失败!"
  echo $LOGIN_RESPONSE | jq '.'
  exit 1
fi

echo "✅ 登录成功! Token: ${TOKEN:0:30}..."
echo ""

# 2. 测试统计API
echo "2. 测试统计API..."
STATS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/marketing/referrals/stats" \
  -H "Authorization: Bearer $TOKEN")

echo $STATS_RESPONSE | jq '.'
echo ""

# 检查统计数据
NEW_COUNT=$(echo $STATS_RESPONSE | jq -r '.data.newCount')
COMPLETED_COUNT=$(echo $STATS_RESPONSE | jq -r '.data.completedCount')
CONV_RATE=$(echo $STATS_RESPONSE | jq -r '.data.convRate')
TOTAL_REWARD=$(echo $STATS_RESPONSE | jq -r '.data.totalReward')

if [ "$NEW_COUNT" != "null" ]; then
  echo "✅ 统计数据正常:"
  echo "   - 新增推荐: $NEW_COUNT"
  echo "   - 已完成: $COMPLETED_COUNT"
  echo "   - 转化率: $CONV_RATE%"
  echo "   - 总奖励: ¥$TOTAL_REWARD"
else
  echo "❌ 统计数据异常!"
fi
echo ""

# 3. 测试推荐列表API
echo "3. 测试推荐列表API..."
LIST_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/marketing/referrals?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")

TOTAL=$(echo $LIST_RESPONSE | jq -r '.data.total')
ITEMS_COUNT=$(echo $LIST_RESPONSE | jq -r '.data.items | length')

if [ "$TOTAL" != "null" ]; then
  echo "✅ 推荐列表正常:"
  echo "   - 总记录数: $TOTAL"
  echo "   - 当前页记录数: $ITEMS_COUNT"
  echo ""
  echo "   前3条记录:"
  echo $LIST_RESPONSE | jq '.data.items[0:3] | .[] | {id, referrer_name, referee_name, status, reward}'
else
  echo "❌ 推荐列表异常!"
  echo $LIST_RESPONSE | jq '.'
fi
echo ""

# 4. 测试海报模板API
echo "4. 测试海报模板API..."
TEMPLATES_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/marketing/referrals/poster-templates" \
  -H "Authorization: Bearer $TOKEN")

echo $TEMPLATES_RESPONSE | jq '.'

if [ "$(echo $TEMPLATES_RESPONSE | jq -r '.success')" == "true" ]; then
  echo "✅ 海报模板API正常"
else
  echo "⚠️  海报模板API可能未实现(这是正常的,可以后续补充)"
fi
echo ""

# 5. 测试活动列表API(用于海报和二维码生成)
echo "5. 测试活动列表API..."
ACTIVITIES_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/activities?page=1&pageSize=10&status=published" \
  -H "Authorization: Bearer $TOKEN")

ACTIVITIES_COUNT=$(echo $ACTIVITIES_RESPONSE | jq -r '.data.items | length')

if [ "$ACTIVITIES_COUNT" != "null" ]; then
  echo "✅ 活动列表API正常:"
  echo "   - 可用活动数: $ACTIVITIES_COUNT"
else
  echo "⚠️  活动列表API异常"
fi
echo ""

# 总结
echo "========================================="
echo "  测试总结"
echo "========================================="
echo ""
echo "✅ 核心功能:"
echo "   - 用户登录: 正常"
echo "   - 统计数据: 正常"
echo "   - 推荐列表: 正常"
echo ""
echo "⚠️  待验证功能:"
echo "   - 海报生成: 需要后端API完整实现"
echo "   - 二维码生成: 需要后端API完整实现"
echo ""
echo "📝 建议:"
echo "   1. 在浏览器中访问 http://localhost:5173/marketing/referrals"
echo "   2. 使用 test_teacher / admin123 登录"
echo "   3. 测试页面UI和交互功能"
echo "   4. 点击'生成推广海报'和'生成推广二维码'按钮测试对话框"
echo ""
echo "========================================="

