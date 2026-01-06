#!/bin/bash

# 快速AI模型性能测试启动脚本
# 使用方法: ./scripts/run-quick-test.sh

echo "⚡ 快速AI模型性能对比测试"
echo "======================================"
echo "📝 简化版本：每种复杂度只测试1个提示词"
echo "⏱️  预计耗时：2-3分钟"
echo ""

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

# 运行快速测试
echo "🧪 开始快速性能测试..."
cd "$(dirname "$0")"
node quick-ai-performance-test.cjs

echo ""
echo "📊 快速测试完成！结果已保存到 quick-ai-performance-results.json"
echo "💡 可以使用以下命令查看详细结果:"
echo "   cat scripts/quick-ai-performance-results.json | jq ."
echo ""
echo "🌐 生成HTML报告:"
echo "   node scripts/generate-performance-report.cjs quick-ai-performance-results.json"
