#!/bin/bash

# 豆包 Seedream 4.5 水印测试脚本
# 使用curl直接测试API

set -e

API_BASE="http://localhost:3000"
OUTPUT_DIR="./test-outputs/watermark-test"

echo "🚀 开始豆包 Seedream 4.5 水印测试"
echo "📁 输出目录: $OUTPUT_DIR"
echo ""

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 步骤1: 登录获取token
echo "============================================================"
echo "步骤1: 登录获取认证令牌"
echo "============================================================"

TOKEN=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"123456"}' \
  | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取token"
  exit 1
fi

echo "✅ 登录成功"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 步骤2: 测试1 - 保留水印 (watermark: true)
echo "============================================================"
echo "步骤2: 测试保留水印 (watermark: true)"
echo "============================================================"

echo "📤 发送请求..."
RESPONSE1=$(curl -s -X POST "$API_BASE/api/auto-image/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "幼儿园春季运动会海报，阳光明媚，孩子们欢快奔跑，色彩鲜艳",
    "category": "poster",
    "style": "natural",
    "size": "1920x1080",
    "quality": "hd",
    "watermark": true
  }')

echo "$RESPONSE1" | jq . > "$OUTPUT_DIR/with-watermark-response.json"
echo "✅ 响应已保存"

# 检查是否成功
SUCCESS1=$(echo "$RESPONSE1" | jq -r '.success')
if [ "$SUCCESS1" = "true" ]; then
  IMAGE_URL1=$(echo "$RESPONSE1" | jq -r '.data.imageUrl')
  echo "🖼️  图片URL: $IMAGE_URL1"
  
  # 下载图片
  if [ "$IMAGE_URL1" != "null" ] && [ ! -z "$IMAGE_URL1" ]; then
    echo "📥 下载图片..."
    curl -s "$IMAGE_URL1" -o "$OUTPUT_DIR/with-watermark.png"
    SIZE1=$(ls -lh "$OUTPUT_DIR/with-watermark.png" | awk '{print $5}')
    echo "✅ 图片已下载: $OUTPUT_DIR/with-watermark.png ($SIZE1)"
  fi
else
  ERROR1=$(echo "$RESPONSE1" | jq -r '.message // .error')
  echo "❌ 生成失败: $ERROR1"
fi

echo ""
sleep 2

# 步骤3: 测试2 - 去除水印 (watermark: false)
echo "============================================================"
echo "步骤3: 测试去除水印 (watermark: false)"  
echo "============================================================"

echo "📤 发送请求..."
RESPONSE2=$(curl -s -X POST "$API_BASE/api/auto-image/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "幼儿园春季运动会海报，阳光明媚，孩子们欢快奔跑，色彩鲜艳",
    "category": "poster",
    "style": "natural",
    "size": "1920x1080",
    "quality": "hd",
    "watermark": false
  }')

echo "$RESPONSE2" | jq . > "$OUTPUT_DIR/without-watermark-response.json"
echo "✅ 响应已保存"

# 检查是否成功
SUCCESS2=$(echo "$RESPONSE2" | jq -r '.success')
if [ "$SUCCESS2" = "true" ]; then
  IMAGE_URL2=$(echo "$RESPONSE2" | jq -r '.data.imageUrl')
  echo "🖼️  图片URL: $IMAGE_URL2"
  
  # 下载图片
  if [ "$IMAGE_URL2" != "null" ] && [ ! -z "$IMAGE_URL2" ]; then
    echo "📥 下载图片..."
    curl -s "$IMAGE_URL2" -o "$OUTPUT_DIR/without-watermark.png"
    SIZE2=$(ls -lh "$OUTPUT_DIR/without-watermark.png" | awk '{print $5}')
    echo "✅ 图片已下载: $OUTPUT_DIR/without-watermark.png ($SIZE2)"
  fi
else
  ERROR2=$(echo "$RESPONSE2" | jq -r '.message // .error')
  echo "❌ 生成失败: $ERROR2"
fi

echo ""

# 步骤4: 输出测试总结
echo "============================================================"
echo "📊 测试总结"
echo "============================================================"

echo ""
echo "测试1: 保留水印 (watermark: true)"
echo "  状态: $([ "$SUCCESS1" = "true" ] && echo "✅ 成功" || echo "❌ 失败")"
if [ "$SUCCESS1" = "true" ] && [ -f "$OUTPUT_DIR/with-watermark.png" ]; then
  echo "  文件: $OUTPUT_DIR/with-watermark.png"
  echo "  大小: $(ls -lh "$OUTPUT_DIR/with-watermark.png" | awk '{print $5}')"
fi

echo ""
echo "测试2: 去除水印 (watermark: false)"
echo "  状态: $([ "$SUCCESS2" = "true" ] && echo "✅ 成功" || echo "❌ 失败")"
if [ "$SUCCESS2" = "true" ] && [ -f "$OUTPUT_DIR/without-watermark.png" ]; then
  echo "  文件: $OUTPUT_DIR/without-watermark.png"
  echo "  大小: $(ls -lh "$OUTPUT_DIR/without-watermark.png" | awk '{print $5}')"
fi

echo ""
echo "============================================================"
echo "📝 检查说明"
echo "============================================================"
echo "1. 请查看输出目录中的两张图片"
echo "2. 对比图片，检查是否有'AI生成'或水印标记的差异"
echo "3. 查看 *-response.json 文件了解详细的API响应"
echo ""
echo "📁 输出目录: $OUTPUT_DIR"
echo "============================================================"
