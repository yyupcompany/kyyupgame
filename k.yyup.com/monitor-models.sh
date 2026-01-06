#!/bin/bash

# 清空旧日志
> /tmp/model-monitor.log

# 后台监控日志
tail -f /tmp/backend.log | grep -E "模型选择|复杂度判断|model.*doubao|Flash|Think" >> /tmp/model-monitor.log &
MONITOR_PID=$!

# 获取token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"123456"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "🧪 实时监控AI模型选择"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 发送测试请求
curl -N -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "班级总数是多少？",
    "userId": "1",
    "conversationId": "test-'$(date +%s)'",
    "context": {"role": "admin", "enableTools": true}
  }' > /dev/null 2>&1 &

# 等待15秒
sleep 15

# 停止监控
kill $MONITOR_PID 2>/dev/null

# 显示结果
echo "📊 模型选择日志："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat /tmp/model-monitor.log
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
