#!/bin/bash

echo "🧪 开始测试：Flash 0.1 vs Flash 0.7 + think"
echo "========================================================================================================"
echo ""

# 测试1: Flash 0.1（无think参数）
echo "📊 测试1: Flash 0.1（temperature=0.1，无think参数）"
echo "========================================================================================================"
echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
START1=$(date +%s%3N)

curl -s -w "\n响应时间: %{time_total}s\n" -X POST https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1c155dc7-0cec-441b-9b00-0fb8ccc16089" \
  -d '{
    "model": "doubao-seed-1-6-flash-250715",
    "messages": [
      {
        "role": "system",
        "content": "你是一个幼儿园管理助手，可以调用工具来帮助用户查询信息。"
      },
      {
        "role": "user",
        "content": "帮我查询一下系统中有多少个学生？"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "query_student_count",
          "description": "查询学生总数",
          "parameters": {
            "type": "object",
            "properties": {}
          }
        }
      }
    ],
    "tool_choice": "auto",
    "temperature": 0.1,
    "max_tokens": 1024
  }' | jq '.'

END1=$(date +%s%3N)
TIME1=$((END1 - START1))
echo "实际耗时: ${TIME1}ms"
echo ""
echo "等待2秒后开始测试2..."
sleep 2
echo ""

# 测试2: Flash 0.7 + think: true
echo "📊 测试2: Flash 0.7 + think: true（temperature=0.7，think=true）"
echo "========================================================================================================"
echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
START2=$(date +%s%3N)

curl -s -w "\n响应时间: %{time_total}s\n" -X POST https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1c155dc7-0cec-441b-9b00-0fb8ccc16089" \
  -d '{
    "model": "doubao-seed-1-6-flash-250715",
    "messages": [
      {
        "role": "system",
        "content": "你是一个幼儿园管理助手，可以调用工具来帮助用户查询信息。"
      },
      {
        "role": "user",
        "content": "帮我查询一下系统中有多少个学生？"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "query_student_count",
          "description": "查询学生总数",
          "parameters": {
            "type": "object",
            "properties": {}
          }
        }
      }
    ],
    "tool_choice": "auto",
    "temperature": 0.7,
    "max_tokens": 2000,
    "think": true
  }' | jq '.'

END2=$(date +%s%3N)
TIME2=$((END2 - START2))
echo "实际耗时: ${TIME2}ms"
echo ""

# 对比总结
echo "========================================================================================================"
echo "📊 对比总结"
echo "========================================================================================================"
echo "Flash 0.1 耗时: ${TIME1}ms"
echo "Flash 0.7+think 耗时: ${TIME2}ms"
DIFF=$((TIME2 - TIME1))
echo "时间差异: ${DIFF}ms"

if [ $TIME2 -gt $TIME1 ]; then
    PERCENT=$(awk "BEGIN {printf \"%.1f\", ($TIME2-$TIME1)*100/$TIME1}")
    echo "Flash 0.7+think 慢了 ${PERCENT}%"
else
    PERCENT=$(awk "BEGIN {printf \"%.1f\", ($TIME1-$TIME2)*100/$TIME2}")
    echo "Flash 0.7+think 快了 ${PERCENT}%"
fi

echo ""
echo "✅ 测试完成！"
echo ""
echo "💡 分析建议："
echo "  - 如果Flash 0.7+think明显更慢(>30%)且返回内容包含思考过程，说明think参数有效"
echo "  - 如果两者时间相近(<10%)且返回内容相似，说明think参数可能无效"

