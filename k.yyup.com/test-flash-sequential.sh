#!/bin/bash

# Flash阶段工具集顺序测试脚本
# 测试10个不同类型的提示词，评估响应速度

echo "🚀 开始Flash阶段工具集顺序测试..."
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
mkdir -p flash_sequential_results
cd flash_sequential_results

echo "🔥 开始顺序测试..."
total_start_time=$(date +%s.%N)

# 存储结果
> test_results.txt
> timing_results.txt

for i in "${!test_cases[@]}"; do
    test_case="${test_cases[$i]}"
    conversation_id="flash-sequential-test-$(printf "%02d" $((i+1)))"
    
    echo "=================================="
    echo "🧪 测试 $((i+1))/10: $test_case"
    echo "会话ID: $conversation_id"
    
    # 记录开始时间
    request_start=$(date +%s.%N)
    
    # 执行请求
    echo "📡 发送请求..."
    response=$(curl -X POST http://localhost:3000/api/ai/unified/stream-chat \
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
      --max-time 60 \
      --silent \
      --show-error)
    
    # 记录结束时间
    request_end=$(date +%s.%N)
    request_duration=$(echo "$request_end - $request_start" | bc -l)
    
    # 分析响应
    if [ -n "$response" ]; then
        # 检查是否成功完成
        if echo "$response" | grep -q "event: complete"; then
            status="✅ 成功"
            
            # 提取使用的工具
            tool_used=$(echo "$response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
            if [ -z "$tool_used" ]; then
                tool_used="未检测到"
            fi
            
            # 计算数据大小
            response_size=$(echo "$response" | wc -c)
            
        else
            status="❌ 失败 (未完成)"
            tool_used="N/A"
            response_size=0
        fi
    else
        status="❌ 失败 (无响应)"
        tool_used="N/A"
        response_size=0
    fi
    
    # 输出结果
    echo "⏱️  响应时间: ${request_duration}s"
    echo "🔧 使用工具: $tool_used"
    echo "📊 响应大小: $response_size bytes"
    echo "📋 状态: $status"
    
    # 保存到文件
    echo "测试$((i+1)): $test_case | ${request_duration}s | $tool_used | $status" >> test_results.txt
    echo "${request_duration}" >> timing_results.txt
    
    # 短暂休息避免服务器过载
    sleep 2
done

total_end_time=$(date +%s.%N)
total_duration=$(echo "$total_end_time - $total_start_time" | bc -l)

echo "=================================="
echo "🎯 顺序测试完成！"
echo "总耗时: ${total_duration}s"
echo "=================================="

# 统计分析
echo "📊 测试结果统计:"
echo "--------------------------------"

success_count=$(grep -c "✅ 成功" test_results.txt)
total_count=10
success_rate=$(echo "scale=2; $success_count * 100 / $total_count" | bc -l)

echo "成功率: $success_count/$total_count (${success_rate}%)"

if [ -f timing_results.txt ] && [ -s timing_results.txt ]; then
    # 计算统计数据
    avg_time=$(awk '{sum += $1; count++} END {if(count > 0) printf "%.3f", sum/count; else print "0"}' timing_results.txt)
    min_time=$(sort -n timing_results.txt | head -1)
    max_time=$(sort -n timing_results.txt | tail -1)
    
    echo "平均响应时间: ${avg_time}s"
    echo "最快响应时间: ${min_time}s"
    echo "最慢响应时间: ${max_time}s"
fi

echo "--------------------------------"
echo "🔧 工具使用统计:"
grep -o "使用工具: [^|]*" test_results.txt | sort | uniq -c | sort -nr

echo "=================================="
echo "📁 详细结果保存在: $(pwd)"
echo "🎉 Flash阶段顺序测试报告完成！"
