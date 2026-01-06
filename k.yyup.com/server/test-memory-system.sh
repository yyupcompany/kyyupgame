#!/bin/bash

# 测试AI对话的记忆读写和去重功能
# 配置
BASE_URL="http://localhost:3000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQwLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzM0NzExNjI0LCJleHAiOjE3MzQ3OTgwMjR9.SNHVX_vAC8U88K05O8qECfvNT4pSZ8_Dc4z_OEeBahM"

echo "======================================"
echo "🧪 AI对话记忆系统测试"
echo "======================================"
echo ""

# 测试1: 发送第一条消息，测试用户消息记录
echo "📝 测试1: 发送第一条消息 - 测试用户消息记录"
echo "发送: '你好，我想了解一下幼儿园的课程'"
curl -s -X POST "${BASE_URL}/api/ai/unified/stream-chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，我想了解一下幼儿园的课程",
    "userId": 140,
    "conversationId": "test-memory-001"
  }' > /tmp/response1.txt

echo "✅ 响应已保存"
echo ""
sleep 2

# 测试2: 发送第二条消息，测试记忆读取
echo "📚 测试2: 发送第二条消息 - 测试记忆上下文加载"
echo "发送: '刚才我问了什么？'"
curl -s -X POST "${BASE_URL}/api/ai/unified/stream-chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "刚才我问了什么？",
    "userId": 140,
    "conversationId": "test-memory-001"
  }' > /tmp/response2.txt

echo "✅ 响应已保存"
echo ""
sleep 2

# 测试3: 发送相似消息，测试去重
echo "🔄 测试3: 发送相似消息 - 测试去重功能"
echo "发送第一次: '幼儿园有什么课程？'"
curl -s -X POST "${BASE_URL}/api/ai/unified/stream-chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "幼儿园有什么课程？",
    "userId": 140,
    "conversationId": "test-memory-002"
  }' > /tmp/response3a.txt

echo "✅ 第一次响应已保存"
sleep 1

echo "发送第二次: '幼儿园有什么课程？'（重复）"
curl -s -X POST "${BASE_URL}/api/ai/unified/stream-chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "幼儿园有什么课程？",
    "userId": 140,
    "conversationId": "test-memory-002"
  }' > /tmp/response3b.txt

echo "✅ 第二次响应已保存"
echo ""

echo "======================================"
echo "✅ 测试完成！"
echo "======================================"
echo ""
echo "📊 查看后端日志以验证："
echo "  1. ✅ 用户消息是否被记录到情节记忆"
echo "  2. ✅ 记忆上下文是否被加载"
echo "  3. ✅ 去重功能是否生效"
echo ""
echo "💡 关键日志标识："
echo "  - '📚 [Memory] 开始加载用户记忆上下文...'"
echo "  - '✅ [Memory] 记忆加载完成: X条对话, X个概念'"
echo "  - '✅ [Memory] 用户消息已记录到情节记忆'"
echo ""
