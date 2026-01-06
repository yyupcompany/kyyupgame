#!/bin/bash

# Redis 停止脚本
# 用途：停止 Redis 服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          🛑 Redis 服务停止脚本${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# 检查 Redis 是否运行
echo -e "${YELLOW}📋 检查 Redis 运行状态...${NC}"
if ! redis-cli ping &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis 未运行${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Redis 正在运行${NC}"

# 显示当前信息
echo -e "\n${BLUE}📊 当前 Redis 信息:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
redis-cli info server | grep -E "redis_version|uptime_in_seconds|connected_clients"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 停止 Redis
echo -e "\n${YELLOW}🔧 正在停止 Redis 服务...${NC}"
redis-cli shutdown save

# 等待 Redis 完全停止
sleep 2

# 验证 Redis 是否已停止
echo -e "${YELLOW}📋 验证 Redis 停止状态...${NC}"
if redis-cli ping &> /dev/null; then
    echo -e "${RED}❌ Redis 停止失败${NC}"
    echo -e "${YELLOW}尝试强制停止...${NC}"
    pkill -9 redis-server || true
    sleep 1
    echo -e "${GREEN}✅ Redis 已强制停止${NC}"
else
    echo -e "${GREEN}✅ Redis 已正常停止${NC}"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Redis 服务已停止！${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

