#!/bin/bash

# 测试AI API的curl脚本
# 用于测试直接调用豆包Think 1.6 API的速度

# 使用硬编码的API配置（从后端日志中获取）
ENDPOINT="https://ark.cn-beijing.volces.com/api/v3/chat/completions"

# 需要从数据库或环境变量中获取真实的API key
# 这里使用占位符，实际运行时需要替换
echo "⚠️  请设置环境变量 DOUBAO_API_KEY"
echo "   例如: export DOUBAO_API_KEY='your-api-key-here'"
echo ""

if [ -z "$DOUBAO_API_KEY" ]; then
  echo "❌ 错误: 未设置 DOUBAO_API_KEY 环境变量"
  echo "   请先运行: export DOUBAO_API_KEY='your-api-key-here'"
  exit 1
fi

API_KEY="$DOUBAO_API_KEY"

echo "✅ API配置已设置"
echo "📍 Endpoint: $ENDPOINT"
echo "🔑 API Key: ${API_KEY:0:20}..."
echo ""

# 准备请求数据
REQUEST_DATA='{
  "model": "doubao-seed-1-6-thinking-250615",
  "messages": [
    {
      "role": "system",
      "content": "你是一位专业的幼儿园课程设计师，擅长创建互动式、趣味性强的幼儿教育课程。\n\n课程领域：健康领域 - 关注幼儿身体健康、运动能力和卫生习惯\n年龄段：3-6岁\n\n你需要生成一个完整的、可交互的 HTML/CSS/JavaScript 课程。\n\n要求：\n1. 代码必须是完整的、可直接运行的\n2. 界面要色彩鲜艳、吸引幼儿注意力\n3. 交互要简单直观、适合幼儿操作\n4. 包含教学目标和学习要点\n5. 代码要有详细注释\n\n返回格式必须是 JSON，包含以下字段：\n{\n  \"htmlCode\": \"完整的 HTML 代码\",\n  \"cssCode\": \"完整的 CSS 代码\",\n  \"jsCode\": \"完整的 JavaScript 代码\",\n  \"description\": \"课程描述和教学建议\",\n  \"thinking\": \"设计思路和考虑因素\"\n}"
    },
    {
      "role": "user",
      "content": "请根据以下要求生成一个幼儿园课程：\n\n提示词：生成一个健康刷牙的小知识互动游戏\n\n课程领域：health\n\n请确保返回的是有效的 JSON 格式。"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 16384,
  "top_p": 0.9,
  "stream": true
}'

echo "🚀 开始测试AI API调用..."
echo "⏱️  开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

START_TIME=$(date +%s)

# 使用curl调用API，显示流式输出
curl -N -X POST "$ENDPOINT" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Accept-Charset: utf-8" \
  -d "$REQUEST_DATA" \
  2>&1 | while IFS= read -r line; do
    # 显示每一行输出
    echo "$line"
    
    # 检查是否包含thinking字段
    if echo "$line" | grep -q '"thinking"'; then
      echo ""
      echo "🧠 检测到thinking字段!"
      echo ""
    fi
    
    # 检查是否包含content字段
    if echo "$line" | grep -q '"content"'; then
      # 提取content内容（简化版）
      CONTENT=$(echo "$line" | grep -o '"content":"[^"]*"' | head -1)
      if [ ! -z "$CONTENT" ]; then
        echo "📝 Content: $CONTENT"
      fi
    fi
  done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "✅ 测试完成"
echo "⏱️  结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "⏱️  总耗时: ${DURATION}秒"

