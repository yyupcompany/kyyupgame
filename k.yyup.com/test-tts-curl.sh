#!/bin/bash

###############################################################################
# 火山引擎TTS测试脚本
# 使用curl测试语音合成功能
###############################################################################

# 配置信息
APP_ID="7563592522"
ACCESS_TOKEN="jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3"
USER_ID="62170702"
CLUSTER="volcano_tts"
ENDPOINT="openspeech.bytedance.com"
PATH="/api/v1/tts"

# 测试文本
TEST_TEXT="欢迎使用幼儿园管理系统，这是一段测试语音。"

# 输出文件
OUTPUT_FILE="test_tts_output.mp3"

# 生成唯一请求ID
REQ_ID=$(uuidgen 2>/dev/null || echo "test-$(date +%s)")

echo "=========================================="
echo "  火山引擎 TTS 语音合成测试"
echo "=========================================="
echo "配置信息:"
echo "  AppID: ${APP_ID}"
echo "  Endpoint: ${ENDPOINT}"
echo "  Path: ${PATH}"
echo ""
echo "测试文本: ${TEST_TEXT}"
echo "请求ID: ${REQ_ID}"
echo "输出文件: ${OUTPUT_FILE}"
echo ""
echo "正在请求..."

# 构建JSON请求体
JSON_PAYLOAD=$(cat <<EOF
{
  "app": {
    "appid": "${APP_ID}",
    "token": "${ACCESS_TOKEN}",
    "cluster": "${CLUSTER}"
  },
  "user": {
    "uid": "${USER_ID}"
  },
  "audio": {
    "voice_type": "zh_female_cancan_mars_bigtts",
    "encoding": "mp3",
    "speed_ratio": 1.0,
    "emotion": "natural"
  },
  "request": {
    "reqid": "${REQ_ID}",
    "text": "${TEST_TEXT}",
    "operation": "query"
  }
}
EOF
)

# 发送请求并保存音频数据
RESPONSE=$(curl -s -X POST \
  "https://${ENDPOINT}${PATH}" \
  -H "Authorization: Bearer; ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${JSON_PAYLOAD}" \
  -w "\n%{http_code}")

# 分离响应体和状态码
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP状态码: ${HTTP_CODE}"
echo ""

# 检查响应
if [ "$HTTP_CODE" = "200" ]; then
  # 解析JSON响应
  CODE=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 'N/A'))" 2>/dev/null)

  if [ "$CODE" = "3000" ]; then
    # 提取base64音频数据
    AUDIO_BASE64=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', ''))" 2>/dev/null)

    if [ -n "$AUDIO_BASE64" ]; then
      # 解码base64并保存为MP3文件
      echo "$AUDIO_BASE64" | base64 -d > "$OUTPUT_FILE"

      FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)

      echo "=========================================="
      echo "  ✅ 语音合成成功！"
      echo "=========================================="
      echo "音频文件: ${OUTPUT_FILE}"
      echo "文件大小: ${FILE_SIZE} bytes"
      echo ""
      echo "播放命令:"
      echo "  ffplay ${OUTPUT_FILE}  # 如果已安装ffmpeg"
      echo "  或直接用播放器打开该文件"
      echo ""
    else
      echo "❌ 错误: 无法提取音频数据"
      echo "响应: $BODY"
      exit 1
    fi
  else
    echo "❌ TTS API返回错误码: ${CODE}"
    echo "响应: $BODY"
    exit 1
  fi
else
  echo "❌ HTTP请求失败"
  echo "响应: $BODY"
  exit 1
fi

# 可选：测试通过本地API调用
echo "=========================================="
echo "  测试本地API调用"
echo "=========================================="
echo ""
echo "正在请求本地API: http://localhost:3000/api/ai/tts/generate"

# 测试本地API（需要先登录获取token，这里假设有token）
# 如果需要测试本地API，请替换YOUR_JWT_TOKEN为有效的token
# LOCAL_TOKEN="YOUR_JWT_TOKEN"
#
# curl -X POST "http://localhost:3000/api/ai/tts/generate" \
#   -H "Authorization: Bearer ${LOCAL_TOKEN}" \
#   -H "Content-Type: application/json" \
#   -d "{\"text\":\"${TEST_TEXT}\",\"voice\":\"nova\",\"speed\":1.0,\"format\":\"mp3\"}" \
#   --output "test_local_tts.mp3"

echo "⚠️  本地API测试已注释（需要有效的JWT token）"
echo "   如需测试，请取消注释并替换LOCAL_TOKEN"
