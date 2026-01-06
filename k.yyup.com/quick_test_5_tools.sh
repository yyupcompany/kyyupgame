#!/bin/bash

# 快速测试5个常用工具
# 不需要修改，直接运行

echo "========================================"
echo "🚀 快速测试5个最常用工具"
echo "========================================"
echo ""

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjM2NDg0NzMsImV4cCI6MTc2MzczNDg3M30.bAbpIAb_54qpU-xlqUspIK72YScU7NObwe2OySkIi0M"

# 测试工具函数
test_tool() {
    local num=$1
    local name=$2
    local message=$3

    echo "----------------------------------------"
    echo "🧪 测试 #$num: $name"
    echo "----------------------------------------"

    start=$(date +%s)

    curl -s -X POST http://localhost:3000/api/ai/unified/stream-chat \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{
            \"message\": \"$message\",
            \"userId\": \"$num\",
            \"context\": {
                \"role\": \"admin\",
                \"enableTools\": true
            }
        }" \
        --no-buffer > tool_test_results/tool_${num}_${name}.json

    end=$(date +%s)
    duration=$((end - start))

    if [ -f "tool_test_results/tool_${num}_${name}.json" ]; then
        size=$(wc -c < tool_test_results/tool_${num}_${name}.json)
        echo "✅ 测试成功 (${duration}s, ${size} bytes)"
    else
        echo "❌ 测试失败"
    fi
    echo ""
}

# 创建目录
mkdir -p tool_test_results

# 测试5个最常用工具
echo "📚 测试数据查询类..."
test_tool 1 any_query "请查询幼儿园学生总数"
test_tool 29 generate_excel_report "生成月度学生出勤Excel报表"

echo "✅ 测试任务管理类..."
test_tool 16 create_todo_list "创建新学期准备工作清单"

echo "🎯 测试活动策划类..."
test_tool 26 generate_complete_activity_plan "制定母亲节活动完整方案"

echo "🌐 测试搜索类..."
test_tool 28 web_search "搜索2025年幼儿园安全管理新规定"

echo "========================================"
echo "✅ 5个工具测试完成！"
echo "📁 结果保存在: tool_test_results/"
echo "📊 查看结果: ls -lh tool_test_results/"
echo "========================================"
