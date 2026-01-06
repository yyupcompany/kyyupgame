#!/bin/bash

# 前端页面与测试用例开发完成度检查脚本
# 使用方法: ./scripts/check-completeness.sh

echo "🔍 开始检查前端页面与测试用例开发完成度..."
echo ""

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查必要的依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 确保glob包存在
if ! npm list glob &> /dev/null; then
    echo "📦 安装glob依赖..."
    npm install glob --save-dev
fi

# 创建结果目录
mkdir -p test-results

# 运行检查脚本
echo "🚀 执行完成度检查..."
node scripts/check-development-completeness.js

# 检查执行结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 检查完成！"
    echo "📄 查看JSON报告: test-results/development-completeness-report.json"
    echo "🌐 查看HTML报告: test-results/development-completeness-report.html"
    
    # 如果有浏览器，尝试打开HTML报告
    if command -v xdg-open &> /dev/null; then
        echo "🌐 正在打开HTML报告..."
        xdg-open test-results/development-completeness-report.html
    elif command -v open &> /dev/null; then
        echo "🌐 正在打开HTML报告..."
        open test-results/development-completeness-report.html
    fi
else
    echo "❌ 检查过程中出现错误"
    exit 1
fi
