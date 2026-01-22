#!/bin/bash

echo "Testing Volcengine TTS API..."

# 发送TTS请求
RESPONSE=$(curl -s -X POST 'https://openspeech.bytedance.com/api/v1/tts' \
  -H 'Authorization: Bearer; jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "app": {
      "appid": "7563592522",
      "token": "jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3",
      "cluster": "volcano_tts"
    },
    "user": {
      "uid": "62170702"
    },
    "audio": {
      "voice_type": "zh_female_cancan_mars_bigtts",
      "encoding": "mp3",
      "speed_ratio": 1.0,
      "emotion": "natural"
    },
    "request": {
      "reqid": "test-curl-001",
      "text": "欢迎使用幼儿园管理系统",
      "operation": "query"
    }
  }')

echo "Response:"
echo "$RESPONSE" | head -c 200
echo ""
echo ""

# 解析JSON
CODE=$(echo "$RESPONSE" | grep -o '"code":[0-9]*' | cut -d':' -f2)

if [ "$CODE" = "3000" ]; then
  echo "Status: SUCCESS (code=3000)"

  # 提取base64数据
  DATA=$(echo "$RESPONSE" | python3 -c 'import sys, json; d=json.load(sys.stdin); print(d.get("data", ""))' 2>/dev/null)

  if [ -n "$DATA" ]; then
    echo "$DATA" | base64 -d > test_tts_output.mp3
    echo "Audio saved to: test_tts_output.mp3"
    ls -la test_tts_output.mp3
    echo ""
    echo "Play with: ffplay test_tts_output.mp3"
  else
    echo "Failed to extract audio data"
  fi
else
  echo "Status: FAILED (code=$CODE)"
fi
