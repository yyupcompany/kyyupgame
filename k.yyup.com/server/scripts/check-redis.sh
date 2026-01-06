#!/bin/bash

# Redis 检测和启动脚本 (Linux/Mac 版本)
# 检查 Redis 是否运行，如果没有运行则自动启动

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}📋 检查 Redis 服务状态...${NC}"

# 检查 Redis 是否运行
if redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✅ Redis 服务已运行${NC}"
    echo -e "${GREEN}   连接地址: redis://127.0.0.1:6379${NC}"
    echo ""
    exit 0
fi

echo -e "${YELLOW}⚠️  Redis 服务未运行${NC}"
echo -e "${CYAN}🚀 正在启动 Redis 服务...${NC}"

# 尝试启动 Redis
if command -v redis-server &> /dev/null; then
    redis-server --daemonize yes --port 6379 --logfile /tmp/redis.log &> /dev/null
    
    # 等待 Redis 启动
    sleep 2
    
    # 再次检查 Redis 是否运行
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis 服务启动成功！${NC}"
        echo -e "${GREEN}   连接地址: redis://127.0.0.1:6379${NC}"
        echo ""
        exit 0
    else
        echo -e "${RED}❌ Redis 启动失败${NC}"
        echo ""
        echo -e "${YELLOW}💡 请手动启动 Redis:${NC}"
        echo -e "${YELLOW}   1. 确保 Redis 已安装${NC}"
        echo -e "${YELLOW}   2. 运行: redis-server${NC}"
        echo -e "${YELLOW}   3. 或运行: ./start-redis.sh${NC}"
        echo ""
        exit 1
    fi
else
    echo -e "${RED}❌ Redis 未安装${NC}"
    echo ""
    echo -e "${YELLOW}💡 请安装 Redis:${NC}"
    echo -e "${YELLOW}   Ubuntu/Debian: sudo apt-get install redis-server${NC}"
    echo -e "${YELLOW}   macOS: brew install redis${NC}"
    echo -e "${YELLOW}   或运行: ./start-redis.sh${NC}"
    echo ""
    exit 1
fi

