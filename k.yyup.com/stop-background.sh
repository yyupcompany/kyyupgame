#!/bin/bash

# 幼儿园管理系统后台服务停止脚本

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

echo -e "${BLUE}🛑 停止幼儿园管理系统后台服务...${NC}"

# 停止后端服务
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 停止后端服务 (PID: $BACKEND_PID)...${NC}"
        kill -TERM $BACKEND_PID 2>/dev/null || true
        sleep 3
        # 如果进程还在运行，强制杀死
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  后端服务进程不存在${NC}"
    fi
    rm -f "$LOG_DIR/backend.pid"
else
    echo -e "${YELLOW}⚠️  未找到后端PID文件${NC}"
fi

# 停止前端服务
if [ -f "$LOG_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 停止前端服务 (PID: $FRONTEND_PID)...${NC}"
        kill -TERM $FRONTEND_PID 2>/dev/null || true
        sleep 3
        # 如果进程还在运行，强制杀死
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ 前端服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  前端服务进程不存在${NC}"
    fi
    rm -f "$LOG_DIR/frontend.pid"
else
    echo -e "${YELLOW}⚠️  未找到前端PID文件${NC}"
fi

# 清理可能残留的进程
echo -e "${YELLOW}🔧 清理残留进程...${NC}"

# 清理后端相关进程
pkill -f "ts-node src/app.ts" 2>/dev/null || true
pkill -f "node.*server.*dev" 2>/dev/null || true

# 清理前端相关进程
pkill -f "vite.*--port 5173" 2>/dev/null || true
pkill -f "node.*client.*dev" 2>/dev/null || true

# 清理端口占用
echo -e "${YELLOW}🔧 清理端口占用...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

sleep 2

echo ""
echo -e "${GREEN}✅ 所有服务已停止！${NC}"
echo ""
echo -e "${BLUE}💡 如需重新启动服务，请运行:${NC}"
echo -e "   ./start-background.sh"
echo ""
