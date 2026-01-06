#!/bin/bash

echo "🔍 检查后端日志中AI相关的请求..."
echo "================================"

# 测试AI查询并监控日志
echo "📝 发送AI查询请求..."
TOKEN=$(cat login_response.json | jq -r '.data.token')

curl -X POST http://localhost:3000/api/ai-query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "请帮我查询所有学生信息",
    "context": {
      "useTools": true,
      "maxTokens": 2000
    }
  }' > ai_query_result.json

echo "✅ AI查询请求已发送"
echo "📋 查询结果："
cat ai_query_result.json | jq .

echo ""
echo "🔍 检查最近的后端日志（最后20行）..."
echo "================================"

# 查看后端进程的日志输出
ps aux | grep "ts-node src/app.ts" | grep -v grep