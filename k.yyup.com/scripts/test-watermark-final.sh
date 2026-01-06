#!/bin/bash

# 豆包 Seedream 4.5 水印测试脚本
# 使用工作流API: /api/ai/generate-activity-image

API_BASE="http://localhost:3000"
OUTPUT_DIR="./test-outputs/watermark-test"

echo "🚀 开始豆包 Seedream 4.5 水印测试"
echo "📁 输出目录: $OUTPUT_DIR"
echo ""

mkdir -p "$OUTPUT_DIR"

# 登录获取token
echo "============================================================"
echo "步骤1: 登录获取认证令牌"
echo "============================================================"

TOKEN=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"123456"}' \
  | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi

echo "✅ 登录成功"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 测试1: 带水印
echo "============================================================"
echo "步骤2: 测试带水印 (watermark: true)"
echo "============================================================"

curl -s -X POST "$API_BASE/api/ai/generate-activity-image" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "幼儿园春季运动会海报，阳光明媚，孩子们欢快奔跑，色彩鲜艳",
    "style": "natural",
    "size": "1920x1080",
    "category": "activity"
  }' > "$OUTPUT_DIR/with-watermark-response.json"

echo "✅ 响应已保存"
cat "$OUTPUT_DIR/with-watermark-response.json" | jq .

IMAGE_URL1=$(cat "$OUTPUT_DIR/with-watermark-response.json" | jq -r '.data.imageUrl // empty')
if [ ! -z "$IMAGE_URL1" ] && [ "$IMAGE_URL1" != "null" ]; then
  echo "🖼️  图片URL: $IMAGE_URL1"
  curl -s "$IMAGE_URL1" -o "$OUTPUT_DIR/with-watermark.png"
  echo "✅ 图片已下载: $OUTPUT_DIR/with-watermark.png"
fi

echo ""
sleep 3

# 测试2: 去除水印
echo "============================================================"
echo "步骤3: 测试去除水印 (watermark参数传递)"
echo "============================================================"
echo "注意: 当前API不支持watermark参数，需要修改后端代码"
echo ""

echo "============================================================"
echo "📊 测试完成"
echo "============================================================"
echo "输出目录: $OUTPUT_DIR"
echo ""
echo "下一步: 需要修改后端API支持watermark参数"
