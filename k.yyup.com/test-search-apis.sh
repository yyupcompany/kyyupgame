#!/bin/bash

# search_apis 工具测试脚本
# 测试新的智能 API 搜索功能

echo "========================================="
echo "🔍 search_apis 工具测试脚本"
echo "========================================="
echo ""

# 检查 token 是否存在
if [ ! -f /tmp/test_token.txt ]; then
  echo "❌ 未找到 token 文件，请先运行 test-login.sh"
  exit 1
fi

TOKEN=$(cat /tmp/test_token.txt)
echo "✅ 已加载 Token"
echo ""

# 测试用例数组
declare -a TEST_CASES=(
  "删除|学生:DELETE"
  "查询|班级:GET"
  "创建|活动:POST"
  "更新|教师:PUT"
  "学生|列表:GET"
  "班级|信息:GET"
  "活动|报名:POST"
  "家长|关系:GET"
  "招生|统计:GET"
  "签到|记录:GET"
)

# 测试函数
test_search_apis() {
  local keywords=$1
  local method=$2
  local test_name=$3
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 测试用例: $test_name"
  echo "🔑 关键词: $keywords"
  echo "🌐 方法: $method"
  echo ""

  # 构造请求体
  local REQUEST_BODY
  if [ "$method" = "null" ]; then
    REQUEST_BODY="{
      \"toolName\": \"search_apis\",
      \"parameters\": {
        \"keywords\": [\"$keywords\"],
        \"limit\": 5
      }
    }"
  else
    REQUEST_BODY="{
      \"toolName\": \"search_apis\",
      \"parameters\": {
        \"keywords\": [\"$keywords\"],
        \"method\": \"$method\",
        \"limit\": 5
      }
    }"
  fi

  # 调用 AI 工具执行接口
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/ai/unified/execute-tool \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$REQUEST_BODY")

  # 检查是否成功
  local STATUS=$(echo $RESPONSE | jq -r '.success // false')
  
  if [ "$STATUS" = "true" ]; then
    echo "✅ 搜索成功！"
    echo ""
    echo "📊 搜索结果："
    
    # 提取并显示结果
    local TOTAL=$(echo $RESPONSE | jq -r '.data.result.totalFound // 0')
    local RETURNED=$(echo $RESPONSE | jq -r '.data.result.returned // 0')
    
    echo "   找到: $TOTAL 个API，返回: $RETURNED 个"
    echo ""
    
    # 显示前3个结果
    echo "   🏆 Top 3 结果："
    echo $RESPONSE | jq -r '.data.result.results[0:3][] | "   \(.relevanceScore)分 - \(.method) \(.path) - \(.summary)"'
    echo ""
    
    # 显示下一步提示
    local NEXT_STEP=$(echo $RESPONSE | jq -r '.data.result.nextStep // ""')
    if [ ! -z "$NEXT_STEP" ]; then
      echo "   💡 下一步: $NEXT_STEP" | head -c 100
      echo "..."
    fi
  else
    echo "❌ 搜索失败！"
    echo "错误信息："
    echo $RESPONSE | jq .
  fi
  
  echo ""
  echo ""
}

# 执行所有测试用例
echo "开始执行测试用例..."
echo ""

for test_case in "${TEST_CASES[@]}"; do
  # 解析测试用例
  IFS=':' read -r keywords_part method <<< "$test_case"
  IFS='|' read -r kw1 kw2 <<< "$keywords_part"
  
  # 组合关键词
  if [ ! -z "$kw2" ]; then
    keywords="$kw1\", \"$kw2"
  else
    keywords="$kw1"
  fi
  
  test_name="测试: $kw1 + $kw2 (${method:-任意方法})"
  
  test_search_apis "$kw1\", \"$kw2" "$method" "$test_name"
  
  # 避免请求过快
  sleep 1
done

echo "========================================="
echo "✅ 所有测试完成！"
echo "========================================="
