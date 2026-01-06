#!/bin/bash

# Flash阶段工具集并发测试脚本
# 测试10个不同类型的提示词，评估响应速度

echo "🚀 开始Flash阶段工具集并发测试..."
echo "测试时间: $(date)"
echo "=================================="

# 测试用例数组
declare -a test_cases=(
    "查询学生数据"
    "获取教师信息"
    "显示班级列表"
    "搜索活动数据"
    "查看家长信息"
    "获取用户列表"
    "显示招生数据"
    "查询课程信息"
    "获取通知列表"
    "查看系统配置"
)

# 创建结果目录
mkdir -p flash_test_results
cd flash_test_results

# 并发执行测试
echo "🔥 启动10个并发请求..."
start_time=$(date +%s.%N)

for i in "${!test_cases[@]}"; do
    test_case="${test_cases[$i]}"
    conversation_id="flash-concurrent-test-$(printf "%02d" $((i+1)))"
    
    echo "启动测试 $((i+1)): $test_case"
    
    # 并发执行curl请求
    (
        request_start=$(date +%s.%N)
        
        curl -X POST http://localhost:3000/api/ai/unified/stream-chat \
          -H "Content-Type: application/json" \
          -H "Accept: text/event-stream" \
          -d "{
            \"message\": \"$test_case\",
            \"userId\": \"121\",
            \"conversationId\": \"$conversation_id\",
            \"context\": {
              \"role\": \"admin\"
            }
          }" \
          --no-buffer \
          --max-time 30 \
          --silent \
          --output "test_$(printf "%02d" $((i+1)))_response.txt" \
          --write-out "test_$(printf "%02d" $((i+1)))_timing.txt: %{time_total}s\n"
        
        request_end=$(date +%s.%N)
        request_duration=$(echo "$request_end - $request_start" | bc -l)
        
        echo "test_$(printf "%02d" $((i+1)))_duration: ${request_duration}s" >> timing_summary.txt
        echo "✅ 测试 $((i+1)) 完成: $test_case (${request_duration}s)"
        
    ) &
done

# 等待所有后台任务完成
wait

end_time=$(date +%s.%N)
total_duration=$(echo "$end_time - $start_time" | bc -l)

echo "=================================="
echo "🎯 并发测试完成！"
echo "总耗时: ${total_duration}s"
echo "=================================="

# 分析结果
echo "📊 响应时间分析:"
echo "--------------------------------"

if [ -f timing_summary.txt ]; then
    sort -n timing_summary.txt
    
    # 计算平均响应时间
    avg_time=$(awk -F': ' '{sum += $2; count++} END {if(count > 0) print sum/count; else print 0}' timing_summary.txt)
    echo "--------------------------------"
    echo "平均响应时间: ${avg_time}s"
fi

# 检查成功率
success_count=0
total_count=10

for i in {1..10}; do
    response_file="test_$(printf "%02d" $i)_response.txt"
    if [ -f "$response_file" ] && [ -s "$response_file" ]; then
        if grep -q "event: complete" "$response_file"; then
            ((success_count++))
            echo "✅ 测试 $i: 成功"
        else
            echo "❌ 测试 $i: 失败 (未完成)"
        fi
    else
        echo "❌ 测试 $i: 失败 (无响应)"
    fi
done

success_rate=$(echo "scale=2; $success_count * 100 / $total_count" | bc -l)
echo "--------------------------------"
echo "成功率: $success_count/$total_count (${success_rate}%)"

# 分析工具使用情况
echo "--------------------------------"
echo "🔧 工具使用分析:"
for i in {1..10}; do
    response_file="test_$(printf "%02d" $i)_response.txt"
    if [ -f "$response_file" ]; then
        tool_used=$(grep -o '"name":"[^"]*"' "$response_file" | head -1 | cut -d'"' -f4)
        if [ -n "$tool_used" ]; then
            echo "测试 $i: 使用工具 $tool_used"
        else
            echo "测试 $i: 未检测到工具使用"
        fi
    fi
done

echo "=================================="
echo "🎉 Flash阶段并发测试报告完成！"
echo "结果文件保存在: $(pwd)"
