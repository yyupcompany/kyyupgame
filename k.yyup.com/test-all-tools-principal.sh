#!/bin/bash

# 🎯 园长视角全工具测试脚本
# 从园长的日常管理需求出发，测试所有可用工具

BASE_URL="http://localhost:3000/api/ai/unified/stream-chat"
USER_ID="121"
ROLE="admin"
RESULTS_FILE="tool_test_results.json"
ERRORS_FILE="tool_test_errors.json"

# 初始化结果文件
echo "[]" > $RESULTS_FILE
echo "[]" > $ERRORS_FILE

# 测试计数器
TOTAL_TESTS=0
SUCCESS_TESTS=0
FAILED_TESTS=0

# 测试函数
test_tool() {
    local test_name="$1"
    local message="$2"
    local conversation_id="test-$(date +%s)-$RANDOM"
    
    echo "🧪 测试: $test_name"
    echo "📝 消息: $message"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # 发送请求
    response=$(curl -s -X POST "$BASE_URL" \
        -H "Content-Type: application/json" \
        -H "Accept: text/event-stream" \
        -d "{
            \"message\": \"$message\",
            \"userId\": \"$USER_ID\",
            \"conversationId\": \"$conversation_id\",
            \"context\": {
                \"role\": \"$ROLE\"
            }
        }" \
        --max-time 60)
    
    # 检查响应
    if echo "$response" | grep -q "event: tool_call_complete\|event: final_answer"; then
        echo "✅ 成功: $test_name"
        SUCCESS_TESTS=$((SUCCESS_TESTS + 1))
        
        # 记录成功结果
        jq --arg name "$test_name" --arg message "$message" --arg response "$response" \
           '. += [{"test": $name, "message": $message, "status": "success", "response": $response}]' \
           $RESULTS_FILE > tmp.json && mv tmp.json $RESULTS_FILE
    else
        echo "❌ 失败: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        
        # 记录失败结果
        jq --arg name "$test_name" --arg message "$message" --arg response "$response" \
           '. += [{"test": $name, "message": $message, "status": "error", "response": $response}]' \
           $ERRORS_FILE > tmp.json && mv tmp.json $ERRORS_FILE
    fi
    
    echo "---"
    sleep 2  # 避免请求过快
}

echo "🎯 开始园长视角全工具测试"
echo "📅 测试时间: $(date)"
echo "👤 测试角色: 园长 (admin)"
echo "=================================="

# 1. 上下文注入工具测试
echo "📊 测试类别: 上下文注入工具"
test_tool "获取机构现状" "作为园长，我想了解幼儿园当前的整体运营状况，包括学生数量、教师配置、招生情况等"
test_tool "工具发现" "列出所有可用的管理工具，我想了解系统能帮我做什么"

# 2. 数据库CRUD工具测试
echo "📊 测试类别: 数据库CRUD工具"
test_tool "查看学生列表" "查询所有在读学生的基本信息"
test_tool "查看教师信息" "查询所有在职教师的详细资料"
test_tool "查看班级情况" "查询各个班级的基本信息和人数配置"
test_tool "创建学生记录" "新增一名学生：姓名张小明，性别男，出生日期2019-03-15"
test_tool "更新教师信息" "更新教师ID为231的联系电话为13800138001"
test_tool "删除无效记录" "删除学生ID为999的记录（如果存在）"

# 3. 页面操作工具测试
echo "📊 测试类别: 页面操作工具"
test_tool "获取可访问页面" "获取我作为园长可以访问的所有管理页面"
test_tool "导航到仪表板" "跳转到管理仪表板页面"
test_tool "导航到学生管理" "进入学生管理页面"
test_tool "导航到活动中心" "打开活动中心页面"

# 4. 任务管理工具测试
echo "📊 测试类别: 任务管理工具"
test_tool "分析任务复杂度" "分析任务：组织一场大型亲子运动会，需要哪些准备工作"
test_tool "创建待办清单" "为下周的家长会创建准备工作清单"
test_tool "更新任务状态" "将任务ID为task001的状态更新为已完成"

# 5. UI展示工具测试
echo "📊 测试类别: UI展示工具"
test_tool "渲染数据表格" "将学生信息以表格形式展示"
test_tool "生成统计图表" "生成各班级人数的柱状图"
test_tool "创建统计卡片" "显示学生总数的统计卡片"

# 6. 专家咨询工具测试
echo "📊 测试类别: 专家咨询工具"
test_tool "教育专家咨询" "咨询教育专家：如何提高3-4岁幼儿的专注力"
test_tool "招生专家咨询" "咨询招生专家：如何制定有效的招生策略"
test_tool "管理专家咨询" "咨询管理专家：如何优化幼儿园的日常运营流程"
test_tool "活动专家咨询" "咨询活动专家：设计适合大班幼儿的科学实验活动"

# 7. 智能查询工具测试
echo "📊 测试类别: 智能查询工具"
test_tool "复杂数据查询" "查询最近一个月新入学的学生，按班级分组统计"
test_tool "跨表关联查询" "查询各班级的教师配置和学生人数对比"
test_tool "统计分析查询" "分析各年龄段学生的分布情况和趋势"

# 8. 网络搜索工具测试
echo "📊 测试类别: 网络搜索工具"
test_tool "搜索教育资讯" "搜索最新的幼儿教育政策和法规"
test_tool "搜索活动创意" "搜索适合幼儿园的春季户外活动创意"

# 9. 工作流工具测试
echo "📊 测试类别: 工作流工具"
test_tool "生成活动方案" "为母亲节活动生成完整的活动策划方案"
test_tool "执行活动流程" "执行春游活动的完整工作流程"

# 10. 文档生成工具测试
echo "📊 测试类别: 文档生成工具"
test_tool "生成PDF报告" "生成本月学生出勤情况的PDF报告"
test_tool "生成Excel报表" "生成教师工作量统计的Excel表格"
test_tool "生成Word文档" "生成家长会通知的Word文档"
test_tool "生成PPT演示" "生成幼儿园年度工作总结的PPT"

# 11. 其他工具测试
echo "📊 测试类别: 其他工具"
test_tool "屏幕截图" "截取当前页面的屏幕截图"
test_tool "批量数据导入" "批量导入新学期的学生名单"
test_tool "数据验证" "验证学生信息的完整性和准确性"

echo "=================================="
echo "🎯 测试完成统计"
echo "总测试数: $TOTAL_TESTS"
echo "成功数: $SUCCESS_TESTS"
echo "失败数: $FAILED_TESTS"
echo "成功率: $(( SUCCESS_TESTS * 100 / TOTAL_TESTS ))%"
echo ""
echo "📄 详细结果已保存到:"
echo "  - 成功结果: $RESULTS_FILE"
echo "  - 失败结果: $ERRORS_FILE"
