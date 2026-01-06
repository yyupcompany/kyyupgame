#!/bin/bash

# 🎯 search_apis 工具完整测试套件
# 包含登录、统计、测试建议

echo "========================================="
echo "🎯 search_apis 工具完整测试套件"
echo "========================================="
echo ""

# 步骤1：登录
echo "📋 步骤1: 快捷登录"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./test-login.sh
if [ $? -ne 0 ]; then
  echo "❌ 登录失败，终止测试"
  exit 1
fi
echo ""

# 步骤2：API 统计
echo "📋 步骤2: API 统计分析"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
/tmp/check-apis.sh
echo ""

# 步骤3：测试建议
echo "📋 步骤3: 测试建议"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 登录已完成，Token 已保存"
echo "✅ 系统共有 1579 个 API 接口"
echo "✅ 新的 search_apis 工具已部署"
echo ""

echo "🎯 推荐测试场景："
echo ""
echo "场景1: 删除操作（测试确认对话框）"
echo "   输入: \"删除ID为1的学生\""
echo "   预期: search_apis → get_api_details → http_request → ⚠️ 确认对话框"
echo ""

echo "场景2: 复杂查询"
echo "   输入: \"查询所有在读的班级，按创建时间倒序\""
echo "   预期: search_apis → get_api_details → http_request(带query参数)"
echo ""

echo "场景3: 模糊匹配"
echo "   输入: \"我想看看活动列表\""
echo "   预期: 智能匹配到活动相关 API"
echo ""

echo "场景4: 创建操作"
echo "   输入: \"创建一个新的班级，名称是小一班\""
echo "   预期: search_apis → get_api_details → http_request(POST)"
echo ""

echo "场景5: 更新操作"
echo "   输入: \"把教师ID为2的状态改成在职\""
echo "   预期: search_apis → get_api_details → http_request(PUT) → ⚠️ 确认对话框"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 监控命令（在另一个终端执行）："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   # 查看 API 搜索日志"
echo "   tail -f /tmp/backend.log | grep -E '(API搜索|search_apis|get_api_details)'"
echo ""
echo "   # 查看所有工具调用"
echo "   tail -f /tmp/backend.log | grep -E '(工具调用|tool)'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 测试入口："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   http://localhost:5173/aiassistant"
echo ""

echo "========================================="
echo "✅ 测试准备完成！开始测试吧！"
echo "========================================="
