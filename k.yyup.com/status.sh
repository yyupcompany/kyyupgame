#!/bin/bash

# 幼儿园管理系统服务状态检查脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/home/devbox/project/k.yyup.com"
LOG_DIR="$PROJECT_ROOT/logs"

echo -e "${BLUE}📊 幼儿园管理系统服务状态${NC}"
echo "=================================="

# 检查后端服务
echo -e "${YELLOW}🔧 后端服务状态:${NC}"
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 运行中 (PID: $BACKEND_PID)${NC}"
        
        # 检查端口
        if lsof -i:3000 > /dev/null 2>&1; then
            echo -e "   ${GREEN}✅ 端口 3000 已监听${NC}"
        else
            echo -e "   ${RED}❌ 端口 3000 未监听${NC}"
        fi
        
        # 检查API健康状态
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            echo -e "   ${GREEN}✅ API 健康检查通过${NC}"
        else
            echo -e "   ${YELLOW}⚠️  API 健康检查失败${NC}"
        fi
    else
        echo -e "   ${RED}❌ 进程不存在 (PID: $BACKEND_PID)${NC}"
    fi
else
    echo -e "   ${RED}❌ 未运行 (无PID文件)${NC}"
fi

echo ""

# 检查前端服务
echo -e "${YELLOW}🎨 前端服务状态:${NC}"
if [ -f "$LOG_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ 运行中 (PID: $FRONTEND_PID)${NC}"
        
        # 检查端口
        if lsof -i:5173 > /dev/null 2>&1; then
            echo -e "   ${GREEN}✅ 端口 5173 已监听${NC}"
        else
            echo -e "   ${RED}❌ 端口 5173 未监听${NC}"
        fi
        
        # 检查前端页面
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo -e "   ${GREEN}✅ 前端页面可访问${NC}"
        else
            echo -e "   ${YELLOW}⚠️  前端页面不可访问${NC}"
        fi
    else
        echo -e "   ${RED}❌ 进程不存在 (PID: $FRONTEND_PID)${NC}"
    fi
else
    echo -e "   ${RED}❌ 未运行 (无PID文件)${NC}"
fi

echo ""

# 显示访问地址
echo -e "${BLUE}🌐 访问地址:${NC}"
echo -e "   前端应用: ${GREEN}http://localhost:5173${NC}"
echo -e "   前端应用: ${GREEN}http://k.yyup.cc${NC}"
echo -e "   后端API:  ${GREEN}http://localhost:3000${NC}"
echo -e "   API文档:  ${GREEN}http://localhost:3000/api-docs${NC}"

echo ""

# 显示日志文件
echo -e "${BLUE}📝 日志文件:${NC}"
if [ -f "$LOG_DIR/backend.log" ]; then
    BACKEND_LOG_SIZE=$(du -h "$LOG_DIR/backend.log" | cut -f1)
    echo -e "   后端日志: ${GREEN}$LOG_DIR/backend.log${NC} (${BACKEND_LOG_SIZE})"
else
    echo -e "   后端日志: ${RED}不存在${NC}"
fi

if [ -f "$LOG_DIR/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(du -h "$LOG_DIR/frontend.log" | cut -f1)
    echo -e "   前端日志: ${GREEN}$LOG_DIR/frontend.log${NC} (${FRONTEND_LOG_SIZE})"
else
    echo -e "   前端日志: ${RED}不存在${NC}"
fi

echo ""

# 显示管理命令
echo -e "${BLUE}💡 管理命令:${NC}"
echo -e "   启动服务: ${YELLOW}./start-background.sh${NC}"
echo -e "   停止服务: ${YELLOW}./stop-background.sh${NC}"
echo -e "   查看后端日志: ${YELLOW}tail -f $LOG_DIR/backend.log${NC}"
echo -e "   查看前端日志: ${YELLOW}tail -f $LOG_DIR/frontend.log${NC}"
echo -e "   实时监控: ${YELLOW}watch -n 2 ./status.sh${NC}"

echo ""

# 显示系统资源使用情况
echo -e "${BLUE}💻 系统资源:${NC}"
echo -e "   内存使用: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')"
echo -e "   磁盘使用: $(df -h / | awk 'NR==2{print $5}')"
echo -e "   负载平均: $(uptime | awk -F'load average:' '{ print $2 }')"

echo ""
