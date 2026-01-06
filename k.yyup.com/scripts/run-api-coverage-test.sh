#!/bin/bash

# 全面API关键词覆盖测试启动脚本
# 使用方法: ./scripts/run-api-coverage-test.sh

echo "🎯 全面API关键词覆盖测试"
echo "======================================"
echo "📊 目标：达到100%的API分组关键词覆盖率"
echo "🔍 测试范围：8个API分组，64个测试用例"
echo "⏱️  预计耗时：5-8分钟"
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

# 运行全面覆盖测试
echo "🧪 开始API关键词覆盖测试..."
cd "$(dirname "$0")"
node comprehensive-api-coverage-test.cjs

echo ""
echo "📊 API覆盖测试完成！"
echo "💡 查看详细结果:"
echo "   cat scripts/api-coverage-test-results.json | jq ."
echo ""
echo "📈 生成可视化报告:"
echo "   node scripts/generate-coverage-report.cjs"
