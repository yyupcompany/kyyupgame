#!/bin/bash

# search_apis 工具简单测试脚本
# 通过查看后端日志来验证工具是否正常工作

echo "========================================="
echo "🔍 search_apis 工具测试（查看后端日志）"
echo "========================================="
echo ""

# 测试用例
declare -a TEST_CASES=(
  "删除:学生:DELETE"
  "查询:班级:GET"
  "创建:活动:POST"
  "更新:教师:PUT"
  "学生:列表:GET"
)

echo "📝 测试用例:"
for i in "${!TEST_CASES[@]}"; do
  echo "   $((i+1)). ${TEST_CASES[$i]}"
done
echo ""

echo "💡 建议："
echo "   1. 打开 MCP 浏览器测试页面: http://localhost:5173/aiassistant"
echo "   2. 输入以下测试命令："
echo ""

for test_case in "${TEST_CASES[@]}"; do
  IFS=':' read -r kw1 kw2 method <<< "$test_case"
  echo "      \"${kw1}${kw2}\" (预期使用 ${method} 方法)"
done

echo ""
echo "   3. 观察 AI 是否："
echo "      a) 调用 search_apis 工具"
echo "      b) 找到正确的 API"
echo "      c) 调用 get_api_details 查看详情"
echo "      d) 最后调用 http_request"
echo ""

echo "🔍 同时可以查看后端日志："
echo "   tail -f /tmp/backend.log | grep -E '(API搜索|search_apis)'"
echo ""

# 创建一个简单的 API 统计脚本
cat > /tmp/check-apis.sh << 'CHECKEOF'
#!/bin/bash
echo "========================================="
echo "📊 当前系统 API 统计"
echo "========================================="
echo ""

curl -s http://localhost:3000/api-docs.json | \
  jq -r '.paths | keys[] as $path | .[$path] | keys[] as $method | 
    select($method != "parameters") | 
    "\($method | ascii_upcase) \($path)"' | \
  sort | \
  awk '{
    method[$1]++; 
    total++
  } 
  END {
    print "📈 API 方法分布:"
    for (m in method) {
      printf "   %-8s: %3d 个\n", m, method[m]
    }
    print ""
    printf "💯 总共: %d 个API\n", total
  }'
CHECKEOF

chmod +x /tmp/check-apis.sh
echo "✅ 创建了 API 统计脚本: /tmp/check-apis.sh"
echo ""

# 执行统计
/tmp/check-apis.sh
echo ""

echo "========================================="
echo "📋 测试准备完成！"
echo "========================================="
echo ""
echo "🚀 开始测试步骤："
echo "   1. 确保后端正在运行"
echo "   2. 打开浏览器访问: http://localhost:5173/aiassistant"
echo "   3. 使用上面的测试命令进行测试"
echo "   4. 观察工具调用流程"
echo ""

