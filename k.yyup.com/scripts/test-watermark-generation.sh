#!/bin/bash

# 豆包图片生成水印测试脚本
# 测试有水印和无水印两种模式

API_BASE="http://localhost:3000/api"
LOGIN_ENDPOINT="$API_BASE/auth/login"
IMAGE_ENDPOINT="$API_BASE/auto-image/generate"

echo "🧪 开始测试豆包图片生成水印功能"
echo "=================================="

# 步骤1: 登录获取token
echo ""
echo "📝 步骤1: 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST "$LOGIN_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "principal",
    "password": "123456"
  }')

echo "登录响应: $LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取token"
  exit 1
fi

echo "✅ 登录成功，Token: ${TOKEN:0:20}..."

# 步骤2: 生成无水印图片 (watermark: false 表示去除水印)
echo ""
echo "📝 步骤2: 测试生成无水印图片..."
echo "   参数: watermark=false (去除AI水印)"
NO_WATERMARK_RESPONSE=$(curl -s -X POST "$IMAGE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "一个温馨的幼儿园教室，孩子们在快乐地画画，卡通风格",
    "category": "education",
    "style": "cartoon",
    "size": "1920x1920",
    "quality": "hd",
    "watermark": false
  }')

echo "无水印响应:"
echo "$NO_WATERMARK_RESPONSE" | jq '.' 2>/dev/null || echo "$NO_WATERMARK_RESPONSE"

NO_WATERMARK_URL=$(echo "$NO_WATERMARK_RESPONSE" | grep -o '"imageUrl":"[^"]*"' | cut -d'"' -f4)

if [ -n "$NO_WATERMARK_URL" ]; then
  echo "✅ 无水印图片生成成功"
  echo "   URL: $NO_WATERMARK_URL"
else
  echo "❌ 无水印图片生成失败"
fi

# 等待5秒避免API限流
echo ""
echo "⏳ 等待5秒..."
sleep 5

# 步骤3: 生成有水印图片 (watermark: true 表示保留水印)
echo ""
echo "📝 步骤3: 测试生成有水印图片..."
echo "   参数: watermark=true (保留AI水印)"
WITH_WATERMARK_RESPONSE=$(curl -s -X POST "$IMAGE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "一个温馨的幼儿园教室，孩子们在快乐地画画，卡通风格",
    "category": "education",
    "style": "cartoon",
    "size": "1920x1920",
    "quality": "hd",
    "watermark": true
  }')

echo "有水印响应:"
echo "$WITH_WATERMARK_RESPONSE" | jq '.' 2>/dev/null || echo "$WITH_WATERMARK_RESPONSE"

WITH_WATERMARK_URL=$(echo "$WITH_WATERMARK_RESPONSE" | grep -o '"imageUrl":"[^"]*"' | cut -d'"' -f4)

if [ -n "$WITH_WATERMARK_URL" ]; then
  echo "✅ 有水印图片生成成功"
  echo "   URL: $WITH_WATERMARK_URL"
else
  echo "❌ 有水印图片生成失败"
fi

# 步骤4: 输出测试总结
echo ""
echo "=================================="
echo "📊 测试结果总结"
echo "=================================="
echo ""
echo "🖼️  无水印图片 (watermark=false):"
if [ -n "$NO_WATERMARK_URL" ]; then
  echo "   ✅ 生成成功"
  echo "   📍 URL: $NO_WATERMARK_URL"
else
  echo "   ❌ 生成失败"
fi

echo ""
echo "🖼️  有水印图片 (watermark=true):"
if [ -n "$WITH_WATERMARK_URL" ]; then
  echo "   ✅ 生成成功"
  echo "   📍 URL: $WITH_WATERMARK_URL"
else
  echo "   ❌ 生成失败"
fi

echo ""
echo "💡 提示: 请手动下载两张图片对比,检查是否有AI生成水印标记"
echo ""
echo "🏁 测试完成"
