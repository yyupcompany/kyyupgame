#!/bin/bash

# 文档模板API测试脚本
# 用于测试所有模板相关的API端点

echo "========================================="
echo "文档模板API测试"
echo "========================================="
echo ""

# 配置
API_BASE="http://localhost:3000/api"
TOKEN=""

# 检查是否提供了token
if [ -z "$1" ]; then
    echo "⚠️  警告：未提供JWT Token"
    echo "用法: bash test-template-api.sh YOUR_JWT_TOKEN"
    echo ""
    echo "继续测试（某些API可能失败）..."
    echo ""
else
    TOKEN="$1"
    echo "✅ 使用提供的Token"
    echo ""
fi

# 测试1: 获取分类列表
echo "📋 测试1: 获取分类列表"
echo "GET $API_BASE/document-templates/categories"
echo ""

if [ -n "$TOKEN" ]; then
    curl -X GET "$API_BASE/document-templates/categories" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -s | jq '.'
else
    curl -X GET "$API_BASE/document-templates/categories" \
      -H "Content-Type: application/json" \
      -s | jq '.'
fi

echo ""
echo "---"
echo ""

# 测试2: 获取模板列表（第一页）
echo "📋 测试2: 获取模板列表（第一页）"
echo "GET $API_BASE/document-templates?page=1&pageSize=5"
echo ""

if [ -n "$TOKEN" ]; then
    curl -X GET "$API_BASE/document-templates?page=1&pageSize=5" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -s | jq '.'
else
    curl -X GET "$API_BASE/document-templates?page=1&pageSize=5" \
      -H "Content-Type: application/json" \
      -s | jq '.'
fi

echo ""
echo "---"
echo ""

# 测试3: 按类别筛选
echo "📋 测试3: 按类别筛选（年度检查类）"
echo "GET $API_BASE/document-templates?category=annual&pageSize=5"
echo ""

if [ -n "$TOKEN" ]; then
    curl -X GET "$API_BASE/document-templates?category=annual&pageSize=5" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -s | jq '.'
else
    curl -X GET "$API_BASE/document-templates?category=annual&pageSize=5" \
      -H "Content-Type: application/json" \
      -s | jq '.'
fi

echo ""
echo "---"
echo ""

# 测试4: 搜索模板
echo "📋 测试4: 搜索模板（关键词：年检）"
echo "GET $API_BASE/document-templates/search?keyword=年检&limit=5"
echo ""

if [ -n "$TOKEN" ]; then
    curl -X GET "$API_BASE/document-templates/search?keyword=年检&limit=5" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -s | jq '.'
else
    curl -X GET "$API_BASE/document-templates/search?keyword=年检&limit=5" \
      -H "Content-Type: application/json" \
      -s | jq '.'
fi

echo ""
echo "---"
echo ""

# 测试5: 智能推荐
echo "📋 测试5: 智能推荐模板"
echo "GET $API_BASE/document-templates/recommend?type=all&limit=3"
echo ""

if [ -n "$TOKEN" ]; then
    curl -X GET "$API_BASE/document-templates/recommend?type=all&limit=3" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -s | jq '.'
else
    curl -X GET "$API_BASE/document-templates/recommend?type=all&limit=3" \
      -H "Content-Type: application/json" \
      -s | jq '.'
fi

echo ""
echo "---"
echo ""

# 测试6: 获取模板详情（假设ID为1）
echo "📋 测试6: 获取模板详情（ID=1）"
echo "GET $API_BASE/document-templates/1"
echo ""

if [ -n "$TOKEN" ]; then
    curl -X GET "$API_BASE/document-templates/1" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -s | jq '.'
else
    curl -X GET "$API_BASE/document-templates/1" \
      -H "Content-Type: application/json" \
      -s | jq '.'
fi

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="
echo ""
echo "提示："
echo "1. 如果看到401错误，请提供有效的JWT Token"
echo "2. 如果看到404错误，请先运行模板导入脚本"
echo "3. 使用 jq 格式化JSON输出（需要安装jq）"
echo ""

