#!/bin/bash

# 停止服务脚本

echo "🛑 停止幼儿园管理系统服务..."
echo "================================="

# 从PID文件读取进程ID并停止
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    else
        echo "前端服务已停止"
    fi
    rm -f logs/frontend.pid
fi

if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    else
        echo "后端服务已停止"
    fi
    rm -f logs/backend.pid
fi

# 强制清理端口（以防万一）
echo "🧹 强制清理所有端口..."
bash client/scripts/kill-ports.sh
bash server/scripts/kill-ports.sh

echo ""
echo "✅ 所有服务已停止！"