#!/bin/bash

# 继续测试剩余的工具
# 使用bash脚本，更快更简单

API_URL="http://localhost:3000/api/ai/unified/stream-chat"

# 获取Token
echo "🔐 登录获取Token..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi

echo "✅ 登录成功"
echo ""

# 测试函数
test_tool() {
  local tool_desc="$1"
  local message="$2"
  local timeout="${3:-120}"
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "测试: $tool_desc"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  local start_time=$(date +%s%3N)
  local response=$(timeout $timeout curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"message\": \"$message\",
      \"userId\": \"121\",
      \"conversationId\": \"test-$(date +%s)\",
      \"context\": {
        \"role\": \"admin\",
        \"enableTools\": true
      }
    }" 2>&1)
  
  local end_time=$(date +%s%3N)
  local duration=$((end_time - start_time))
  
  # 检查是否包含tool_call_complete
  if echo "$response" | grep -q "tool_call_complete"; then
    echo "✅ 成功 - ${duration}ms"
    # 提取工具名称
    local tool_name=$(echo "$response" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   调用工具: $tool_name"
  elif echo "$response" | grep -q "error"; then
    echo "❌ 失败 - ${duration}ms"
    local error_msg=$(echo "$response" | grep -o '"error":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   错误: $error_msg"
  else
    echo "⚠️  未知结果 - ${duration}ms"
  fi
  
  echo ""
  sleep 2 # 避免请求过快
}

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  📊 继续测试剩余工具                          ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# 工作流工具测试
echo ""
echo "🔄 工作流工具测试"
echo ""

test_tool "analyze_task_complexity" "分析这个任务的复杂度：创建一个活动方案"
test_tool "create_todo_list" "为春节活动创建一个任务清单"
test_tool "generate_complete_activity_plan" "生成元宵节活动的完整方案"

# UI显示工具测试
echo ""
echo "🎨 UI显示工具测试"
echo ""

test_tool "render_component" "用表格展示教师信息"
test_tool "generate_html_preview" "生成一个简单的欢迎页面HTML"

# 文档生成工具测试
echo ""
echo "📄 文档生成工具测试"
echo ""

test_tool "generate_excel_report" "生成学生名单Excel报表" 150
test_tool "generate_word_document" "生成活动总结Word文档" 150  
test_tool "generate_pdf_report" "生成月度分析PDF报告" 150
test_tool "generate_ppt_presentation" "生成活动介绍PPT演示文稿" 150

# 重新测试之前失败的工具
echo ""
echo "🔧 重新测试之前失败的工具（已修复超时）"
echo ""

test_tool "type_text（重测）" "在输入框中输入hello world" 150
test_tool "select_option（重测）" "在下拉框中选择第一个选项" 150

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  🎉 测试完成！                                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

echo "查看完整日志："
echo "  cat test-remaining-tools.log"
echo ""

