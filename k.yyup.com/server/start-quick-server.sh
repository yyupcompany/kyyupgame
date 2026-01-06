#!/bin/bash

# API修复验证 - 快速服务器启动脚本

echo "🚀 启动API修复验证服务器..."

# 检查Node.js版本
node_version=$(node --version 2>/dev/null || echo "未安装")
echo "📦 Node.js版本: $node_version"

# 检查npm版本
npm_version=$(npm --version 2>/dev/null || echo "未安装")
echo "📦 npm版本: $npm_version"

# 检查TypeScript
if command -v npx &> /dev/null; then
    ts_version=$(npx tsc --version 2>/dev/null || echo "未安装")
    echo "📦 TypeScript版本: $ts_version"
fi

echo ""

# 停止现有进程
echo "🛑 停止现有服务器进程..."
pkill -f "ts-node\|node.*server" 2>/dev/null || true
pkill -f "quick-start" 2>/dev/null || true

# 等待进程完全停止
sleep 2

# 检查端口是否被占用
if lsof -i :3000 &> /dev/null; then
    echo "⚠️  端口3000仍被占用，尝试强制释放..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 检查目录
if [ ! -d "src" ]; then
    echo "❌ 错误：请在server目录下执行此脚本"
    exit 1
fi

# 检查必要文件
if [ ! -f "src/quick-start.ts" ]; then
    echo "❌ 错误：找不到quick-start.ts文件"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告：未找到.env文件，将使用默认配置"
fi

echo ""
echo "🎯 启动快速服务器..."
echo "📍 监听端口: 3000"
echo "🌐 访问地址: http://localhost:3000"
echo "📋 健康检查: http://localhost:3000/health"
echo ""

# 启动服务器
export NODE_ENV=development
export PORT=3000

# 使用ts-node启动
npx ts-node src/quick-start.ts

# 如果ts-node失败，尝试编译后启动
if [ $? -ne 0 ]; then
    echo "⚠️  ts-node启动失败，尝试编译后启动..."
    
    # 编译TypeScript
    npx tsc src/quick-start.ts --outDir dist --target es2020 --module commonjs --esModuleInterop
    
    if [ $? -eq 0 ]; then
        echo "✅ 编译成功，启动服务器..."
        node dist/quick-start.js
    else
        echo "❌ 编译失败"
        exit 1
    fi
fi