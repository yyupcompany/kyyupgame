#!/bin/bash

# 测试AIBridge与SIP UDP集成

echo "🧪 测试AIBridge与SIP UDP集成"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 服务器配置
API_URL="http://localhost:3000"
TOKEN=""

# 1. 登录获取Token
echo "📝 1. 登录获取Token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ 登录失败${NC}"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 登录成功${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. 检查AIBridge服务状态
echo "🔍 2. 检查AIBridge服务状态..."
echo "   (通过查询AI模型配置)"

AI_MODELS=$(curl -s -X GET "${API_URL}/api/ai-models" \
  -H "Authorization: Bearer $TOKEN")

DOUBAO_COUNT=$(echo $AI_MODELS | grep -o "doubao" | wc -l)

if [ $DOUBAO_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ 找到 $DOUBAO_COUNT 个豆包模型配置${NC}"
else
  echo -e "${YELLOW}⚠️  未找到豆包模型配置${NC}"
fi
echo ""

# 3. 检查SIP配置
echo "🔍 3. 检查SIP配置..."
SIP_STATUS=$(curl -s -X GET "${API_URL}/api/call-center/sip/status" \
  -H "Authorization: Bearer $TOKEN")

echo "SIP状态: $SIP_STATUS"
echo ""

# 4. 测试UDP呼叫（集成AIBridge）
echo "📞 4. 测试UDP呼叫（集成AIBridge）..."
CALL_RESPONSE=$(curl -s -X POST "${API_URL}/api/call-center/call/udp/make" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phoneNumber": "18611141133",
    "customerId": 1,
    "systemPrompt": "你是一位专业的幼儿园招生顾问，负责通过电话与家长沟通。"
  }')

echo "呼叫响应:"
echo "$CALL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CALL_RESPONSE"
echo ""

# 提取callId
CALL_ID=$(echo $CALL_RESPONSE | grep -o '"callId":"[^"]*' | cut -d'"' -f4)

if [ -z "$CALL_ID" ]; then
  echo -e "${RED}❌ 呼叫失败，未获取到callId${NC}"
else
  echo -e "${GREEN}✅ 呼叫已发起${NC}"
  echo "Call ID: $CALL_ID"
  echo ""
  
  # 5. 等待并查询呼叫状态
  echo "⏳ 5. 等待5秒后查询呼叫状态..."
  sleep 5
  
  CALL_STATUS=$(curl -s -X GET "${API_URL}/api/call-center/call/udp/${CALL_ID}/status" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "呼叫状态:"
  echo "$CALL_STATUS" | python3 -m json.tool 2>/dev/null || echo "$CALL_STATUS"
  echo ""
  
  # 6. 挂断呼叫
  echo "📞 6. 挂断呼叫..."
  HANGUP_RESPONSE=$(curl -s -X POST "${API_URL}/api/call-center/call/udp/hangup" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"callId\": \"$CALL_ID\"
    }")
  
  echo "挂断响应:"
  echo "$HANGUP_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HANGUP_RESPONSE"
  echo ""
fi

# 7. 总结
echo "======================================"
echo "📊 测试总结"
echo "======================================"
echo ""
echo "✅ 已测试的功能:"
echo "   1. 用户登录认证"
echo "   2. AIBridge服务检查（AI模型配置）"
echo "   3. SIP配置状态"
echo "   4. UDP呼叫发起（集成AIBridge）"
echo "   5. 呼叫状态查询"
echo "   6. 呼叫挂断"
echo ""
echo "🔧 AIBridge集成流程:"
echo "   SIP UDP → 客户接听 → 音频流 → AIBridge"
echo "   AIBridge: ASR → LLM → TTS → 音频回传"
echo ""
echo "📝 注意事项:"
echo "   1. 需要Kamailio服务器正常运行"
echo "   2. 需要配置真实的豆包API Key"
echo "   3. 音频流处理需要实际通话测试"
echo ""
echo "======================================"

