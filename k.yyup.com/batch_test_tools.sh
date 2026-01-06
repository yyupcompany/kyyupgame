#!/bin/bash

# 幼儿园AI助手工具批量测试脚本
# 园长视角的工具测试

echo "========================================"
echo "🏫 幼儿园AI助手工具批量测试"
echo "📅 测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# 设置测试参数
API_URL="http://localhost:3000/api/ai/unified/stream-chat"
OUTPUT_DIR="tool_test_results"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 测试工具函数
test_tool() {
    local tool_num=$1
    local tool_name=$2
    local test_message=$3

    echo "----------------------------------------"
    echo "🔧 测试工具 #$tool_num: $tool_name"
    echo "----------------------------------------"

    # 准备请求数据（使用临时文件）
    local json_file="/tmp/tool_test_${tool_num}.json"
    cat > "$json_file" <<EOF
{
  "message": "$test_message",
  "userId": "$tool_num",
  "context": {
    "role": "admin",
    "enableTools": true
  }
}
EOF

    # 执行curl命令
    echo "📤 发送请求..."

    curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjM2NDg0NzMsImV4cCI6MTc2MzczNDg3M30.bAbpIAb_54qpU-xlqUspIK72YScU7NObwe2OySkIi0M" \
        -d "@$json_file" \
        --no-buffer > "$OUTPUT_DIR/tool_${tool_num}_${tool_name}.json"

    local result_file="$OUTPUT_DIR/tool_${tool_num}_${tool_name}.json"
    local file_size=$(wc -c < "$result_file")

    echo "💾 结果已保存到: $result_file ($file_size 字节)"
    echo "✅ 测试完成"
    echo ""

    # 清理临时文件
    rm -f "$json_file"
}

echo "🚀 开始批量测试，共36个工具..."
echo ""

# 第一类：数据查询与管理类 (6个工具)
echo "📚 第一类：数据查询与管理类"
test_tool 1 "any_query" "园长您好，我最近想了解一下咱们幼儿园的整体情况"
test_tool 2 "read_data_record" "请帮我查询大班A的学生名单"
test_tool 3 "create_data_record" "请帮我创建一个新的学生记录：姓名豆豆，年龄5岁"
test_tool 4 "update_data_record" "请更新学生豆豆的班级信息"
test_tool 5 "delete_data_record" "请删除退园学生小明的记录"
test_tool 6 "batch_import_data" "请帮我批量导入15个新学生的信息"

echo ""
echo "🎨 第二类：页面操作类"
test_tool 7 "navigate_to_page" "请导航到财务中心页面查看费用情况"
test_tool 8 "capture_screen" "请截图保存当前页面的学生统计信息"
test_tool 9 "type_text" "请在学生评估表中输入评语"
test_tool 10 "select_option" "请在活动报名表中选择"
test_tool 11 "navigate_back" "请返回到上一个页面"
test_tool 12 "fill_form" "请填写入园登记表"
test_tool 13 "submit_form" "请提交新生活动报名表"
test_tool 14 "click_element" "请点击学生列表中'小明'的名字"

echo ""
echo "✅ 第三类：任务管理类"
test_tool 15 "analyze_task_complexity" "请分析春季亲子运动会活动的复杂程度"
test_tool 16 "create_todo_list" "请为春季运动会创建待办清单"
test_tool 17 "update_todo_task" "请更新待办清单"
test_tool 18 "get_todo_list" "请查看待办清单"
test_tool 19 "delete_todo_task" "请删除待办任务"

echo ""
echo "🎭 第四类：UI展示类"
test_tool 20 "render_component" "请创建互动式图表展示数据"
test_tool 21 "generate_html_preview" "请生成互动式教学游戏网页"

echo ""
echo "👨‍🏫 第五类：专家咨询类"
test_tool 22 "consult_recruitment_planner" "请提供招生策划建议"
test_tool 23 "call_expert" "请调用儿童心理学专家"
test_tool 24 "get_expert_list" "请列出所有专家领域"
test_tool 25 "list_available_tools" "请列出所有工具"

echo ""
echo "🔄 第六类：工作流类"
test_tool 26 "generate_complete_activity_plan" "请制定母亲节主题活动方案"
test_tool 27 "execute_activity_workflow" "请按照活动方案执行工作流"

echo ""
echo "🌐 第七类：网络搜索类"
test_tool 28 "web_search" "请搜索2025年学前教育政策"

echo ""
echo "📄 第八类：文档生成类"
test_tool 29 "generate_excel_report" "请生成学生成长报告Excel报表"
test_tool 30 "generate_word_document" "请生成家长会通知Word文档"
test_tool 31 "generate_pdf_report" "请生成教学质量评估PDF报告"
test_tool 32 "generate_ppt_presentation" "请制作教学工作总结PPT"

echo ""
echo "🛠️ 第九类：其他工具类"
test_tool 33 "get_organization_status" "请提供幼儿园当前运营状况"
test_tool 34 "get_accessible_pages" "请列出系统中所有功能页面"
test_tool 35 "get_page_structure" "请分析学生管理页面结构"
test_tool 36 "validate_page_state" "请检查页面状态"

echo ""
echo "========================================"
echo "✅ 批量测试完成！"
echo "📊 结果保存在: $OUTPUT_DIR/"
echo "========================================"
