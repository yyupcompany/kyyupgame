#!/bin/bash

# AI模型性能测试启动脚本
# 使用方法: ./scripts/run-ai-performance-test.sh

echo "🚀 AI模型性能对比测试"
echo "======================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查服务器是否运行
echo "🔍 检查服务器状态..."
if ! curl -s http://127.0.0.1:3000/health > /dev/null; then
    echo "❌ 服务器未运行，请先启动服务器:"
    echo "   cd server && npm run dev"
    exit 1
fi

echo "✅ 服务器运行正常"

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install axios
fi

# 运行测试
echo "🧪 开始性能测试..."
cd "$(dirname "$0")"
node ai-model-performance-test.cjs

echo ""
echo "📊 测试完成！结果已保存到 ai-model-performance-results.json"
echo "💡 可以使用以下命令查看详细结果:"
echo "   cat scripts/ai-model-performance-results.json | jq ."
