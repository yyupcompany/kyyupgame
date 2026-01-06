#!/bin/bash

echo "正在启动Node.js调试模式服务器..."
echo "调试端口: 9229"
echo "服务端口: 3000"
echo ""

cd /home/devbox/project/server

# 检查端口3000是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "警告: 端口3000已被占用，请先停止现有服务器"
    echo "使用 Ctrl+C 停止当前服务器，然后重新运行此脚本"
    exit 1
fi

echo "启动调试模式服务器..."
npm run dev:debug