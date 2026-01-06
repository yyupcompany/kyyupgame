#!/bin/bash

# 幼儿园管理系统后台启动脚本
# 使用 nohup 让服务在后台运行，即使关闭终端也不会停止

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/home/devbox/project/k.yyup.com"
LOG_DIR="$PROJECT_ROOT/logs"

# 创建日志目录
mkdir -p "$LOG_DIR"

echo -e "${BLUE}🚀 启动幼儿园管理系统后台服务...${NC}"

# 检查并停止现有进程
echo -e "${YELLOW}📋 检查现有进程...${NC}"

# 停止现有的后端进程
BACKEND_PID=$(ps aux | grep "ts-node src/app.ts" | grep -v grep | awk '{print $2}' | head -1)
if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${YELLOW}🛑 停止现有后端进程 (PID: $BACKEND_PID)...${NC}"
    kill -9 $BACKEND_PID 2>/dev/null || true
fi

# 停止现有的前端进程
FRONTEND_PID=$(ps aux | grep "vite.*--port 5173" | grep -v grep | awk '{print $2}' | head -1)
if [ ! -z "$FRONTEND_PID" ]; then
    echo -e "${YELLOW}🛑 停止现有前端进程 (PID: $FRONTEND_PID)...${NC}"
    kill -9 $FRONTEND_PID 2>/dev/null || true
fi

# 清理端口
echo -e "${YELLOW}🔧 清理端口占用...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

sleep 2

# 启动后端服务
echo -e "${GREEN}🔧 启动后端服务 (端口: 3000)...${NC}"
cd "$PROJECT_ROOT/server"

# 使用 nohup 启动后端，输出重定向到日志文件
nohup npm run dev > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$LOG_DIR/backend.pid"
echo -e "${GREEN}✅ 后端服务已启动 (PID: $BACKEND_PID)${NC}"

# 等待后端启动
echo -e "${YELLOW}⏳ 等待后端服务启动...${NC}"
sleep 10

# 检查后端是否启动成功
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务启动成功！${NC}"
else
    echo -e "${YELLOW}⚠️  后端服务可能还在启动中，请稍后检查...${NC}"
fi

# 启动前端服务
echo -e "${GREEN}🎨 启动前端服务 (端口: 5173)...${NC}"
cd "$PROJECT_ROOT/client"

# 使用 nohup 启动前端，输出重定向到日志文件
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$LOG_DIR/frontend.pid"
echo -e "${GREEN}✅ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"

# 等待前端启动
echo -e "${YELLOW}⏳ 等待前端服务启动...${NC}"
sleep 8

# 检查前端是否启动成功
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端服务启动成功！${NC}"
else
    echo -e "${YELLOW}⚠️  前端服务可能还在启动中，请稍后检查...${NC}"
fi

echo ""
echo -e "${BLUE}🎉 服务启动完成！${NC}"
echo -e "${GREEN}📱 前端地址: http://localhost:5173${NC}"
echo -e "${GREEN}📱 前端地址: http://k.yyup.cc${NC}"
echo -e "${GREEN}🔧 后端API: http://localhost:3000${NC}"
echo -e "${GREEN}📚 API文档: http://localhost:3000/api-docs${NC}"
echo ""
echo -e "${YELLOW}📋 进程信息:${NC}"
echo -e "   后端PID: $BACKEND_PID"
echo -e "   前端PID: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}📝 日志文件:${NC}"
echo -e "   后端日志: $LOG_DIR/backend.log"
echo -e "   前端日志: $LOG_DIR/frontend.log"
echo ""
echo -e "${BLUE}💡 管理命令:${NC}"
echo -e "   查看状态: ./status.sh"
echo -e "   停止服务: ./stop-background.sh"
echo -e "   查看日志: tail -f $LOG_DIR/backend.log"
echo -e "   查看日志: tail -f $LOG_DIR/frontend.log"
echo ""
echo -e "${GREEN}✨ 服务已在后台运行，即使关闭终端也不会停止！${NC}"
