#!/bin/bash

# 演示测试脚本 - 不需要修改token
# 这个脚本会提示用户输入token并测试连接

echo "========================================"
echo "🎬 演示测试 - 快速验证工具功能"
echo "========================================"
echo ""

# 提示用户输入token
echo "请输入JWT Token (从浏览器获取):"
echo "提示: 访问 http://localhost:5173 登录后，在控制台运行:"
echo "      localStorage.getItem('token') || localStorage.getItem('kindergarten_token')"
echo ""
read -p "Token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ 未输入Token，退出测试"
    exit 1
fi

echo ""
echo "✅ 已获取Token，开始测试..."
echo ""

# 测试API连接
echo "📡 测试API连接..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST http://localhost:3000/api/ai/unified/stream-chat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "message": "你好，这是一个测试消息",
        "userId": "1",
        "context": {
            "role": "admin",
            "enableTools": true
        }
    }' \
    --no-buffer)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API连接成功！"
    echo ""
    echo "📊 响应预览:"
    echo "$BODY" | head -20
    echo ""
    echo "✅ 演示测试完成！"
    echo ""
    echo "💡 现在可以运行完整测试:"
    echo "   ./batch_test_tools.sh"
else
    echo "❌ API连接失败 (HTTP: $HTTP_CODE)"
    echo "响应内容:"
    echo "$BODY"
    echo ""
    echo "请检查:"
    echo "1. Token是否正确"
    echo "2. 后端服务是否在运行"
fi
