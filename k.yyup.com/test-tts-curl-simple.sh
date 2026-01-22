#!/bin/bash

# 火山引擎TTS测试脚本

# 发送TTS请求
RESPONSE=$(curl -s -X POST 'https://openspeech.bytedance.com/api/v1/tts' \
  -H 'Authorization: Bearer; jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3' \
  -H 'Content-Type: application/json' \
  -d '{
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
      "reqid": "test-12345",
      "text": "欢迎使用幼儿园管理系统",
      "operation": "query"
    }
  }')

echo "TTS API 响应:"
echo "$RESPONSE"
echo ""

# 检查响应是否包含音频数据（code=3000表示成功）
if echo "$RESPONSE" | grep -q '"code":3000'; then
  echo "✅ TTS调用成功！"

  # 提取base64音频数据并保存
  AUDIO_DATA=$(echo "$RESPONSE" | grep -o '"data":"[^"]*"' | cut -d'"' -f4)

  if [ -n "$AUDIO_DATA" ]; then
    echo "$AUDIO_DATA" | base64 -d > test_tts_output.mp3
    echo "音频已保存到: test_tts_output.mp3"
    ls -la test_tts_output.mp3
  fi
else
  echo "❌ TTS调用失败"
fi
