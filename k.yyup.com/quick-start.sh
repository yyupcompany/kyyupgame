#!/bin/bash

# 快速启动脚本
# 同时启动前端和后端，并自动清理端口

echo "🚀 幼儿园管理系统 - 快速启动脚本"
echo "================================="

# 创建日志目录
mkdir -p logs

echo "🧹 清理所有可能冲突的端口..."

# 清理前端端口
echo "清理前端端口 (5173, 6000)..."
bash client/scripts/kill-ports.sh

# 清理后端端口  
echo "清理后端端口 (3000, 3001, 3003)..."
bash server/scripts/kill-ports.sh

echo ""
echo "🔄 启动服务..."

# 启动后端 (在后台)
echo "启动后端服务 (端口 3000)..."
cd server && npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端进程 PID: $BACKEND_PID"

# 等待后端启动
echo "等待后端启动..."
sleep 3

# 启动前端 (在后台)
echo "启动前端服务 (端口 5173)..."
cd ../client && npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端进程 PID: $FRONTEND_PID"

# 返回项目根目录
cd ..

echo ""
echo "✅ 启动完成!"
echo "================================="
echo "🌐 前端: http://localhost:5173"
echo "🔧 后端: http://localhost:3000"
echo "🌍 外网前端: https://k.yyup.cc"
echo "🌍 外网后端: https://ezavkrybovpo.sealoshzh.site:3000"
echo ""
echo "📋 进程信息:"
echo "前端 PID: $FRONTEND_PID"
echo "后端 PID: $BACKEND_PID"
echo ""
echo "📝 日志文件:"
echo "前端日志: logs/frontend.log"
echo "后端日志: logs/backend.log"
echo ""
echo "⛔ 停止服务:"
echo "kill $FRONTEND_PID $BACKEND_PID"
echo "或运行: bash stop-services.sh"
echo ""
echo "📱 实时查看日志:"
echo "前端: tail -f logs/frontend.log"
echo "后端: tail -f logs/backend.log"

# 保存PID以便后续停止
echo $FRONTEND_PID > logs/frontend.pid
echo $BACKEND_PID > logs/backend.pid

echo ""
echo "🎯 服务已在后台运行！"