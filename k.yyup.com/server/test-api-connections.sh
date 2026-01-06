#!/bin/bash

echo "🚀 开始测试所有AI模型API连接..."
echo "📊 测试您更新的API Key是否能正常工作"
echo ""

# 1. 测试新的豆包API Key - 最重要的默认模型
echo "=== 测试新的豆包API Key (最重要) ==="
echo "🔍 测试豆包Seed-1.6-Thinking (默认模型)..."

curl -s -X POST "https://ark.cn-beijing.volces.com/api/v3/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1c155dc7-0cec-441b-9b00-0fb8ccc16089" \
  -d '{
    "model": "doubao-seed-1-6-thinking-250715",
    "messages": [{"role": "user", "content": "你好，请简单回复测试"}],
    "max_tokens": 50,
    "temperature": 0.7
  }' | head -c 200

echo ""
echo ""

# 2. 测试数据库查询专用模型 - AI查询功能核心
echo "=== 测试数据库查询专用模型 (AI查询核心) ==="
echo "🔍 测试豆包数据库查询专用..."

curl -s -X POST "https://aiproxy.hzh.sealos.run/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-OMDg69YDtWF30kEiDdsmXccPBoFbDAeAj5nF4IJxZjEIH2cR" \
  -d '{
    "model": "Doubao-1.5-lite-32k",
    "messages": [{"role": "user", "content": "测试SQL生成功能"}],
    "max_tokens": 50,
    "temperature": 0.1
  }' | head -c 200

echo ""
echo ""

# 3. 测试图像生成模型
echo "=== 测试图像生成模型 ==="
echo "🔍 测试豆包文生图模型..."

curl -s -X POST "https://ark.cn-beijing.volces.com/api/v3/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ffb6e528-e998-4ebf-b601-38a8a33c2365" \
  -d '{
    "model": "doubao-seedream-3-0-t2i-250415",
    "prompt": "一只可爱的小猫",
    "size": "1024x1024",
    "quality": "standard",
    "n": 1
  }' | head -c 200

echo ""
echo ""

# 4. 测试意图分析专用模型
echo "=== 测试意图分析专用模型 ==="
echo "🔍 测试豆包意图分析专用..."

curl -s -X POST "https://aiproxy.hzh.sealos.run/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-OMDg69YDtWF30kEiDdsmXccPBoFbDAeAj5nF4IJxZjEIH2cR" \
  -d '{
    "model": "Doubao-lite-32k",
    "messages": [{"role": "user", "content": "分析用户意图测试"}],
    "max_tokens": 30
  }' | head -c 200

echo ""
echo ""

# 5. 测试嵌入模型
echo "=== 测试嵌入模型 ==="
echo "🔍 测试豆包向量嵌入模型..."

curl -s -X POST "https://aiproxy.hzh.sealos.run/v1/embeddings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-OMDg69YDtWF30kEiDdsmXccPBoFbDAeAj5nF4IJxZjEIH2cR" \
  -d '{
    "model": "Doubao-embedding",
    "input": "测试文本嵌入",
    "encoding_format": "float"
  }' | head -c 200

echo ""
echo ""

echo "🎯 API连接测试完成！"
echo ""
echo "📋 测试结果说明："
echo "✅ 如果看到正常的JSON响应 = API Key有效，服务正常"
echo "❌ 如果看到错误信息 = API Key无效或服务异常"
echo ""
echo "🔑 重点关注："
echo "1. 豆包Seed-1.6-Thinking (默认模型) - 新API Key"
echo "2. 豆包数据库查询专用 (AI查询功能核心) - 原API Key"
echo "3. 豆包文生图模型 (图像生成功能) - 新API Key"
