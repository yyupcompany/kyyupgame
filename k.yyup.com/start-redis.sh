#!/bin/bash

# Redis 启动脚本
# 用途：启动 Redis 服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志目录
LOG_DIR="/tmp"
REDIS_LOG="$LOG_DIR/redis.log"
REDIS_PID_FILE="$LOG_DIR/redis.pid"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          🚀 Redis 服务启动脚本${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# 检查 Redis 是否已安装
echo -e "${YELLOW}📋 检查 Redis 安装状态...${NC}"
if ! command -v redis-server &> /dev/null; then
    echo -e "${RED}❌ Redis 未安装${NC}"
    echo -e "${YELLOW}请先安装 Redis:${NC}"
    echo -e "  Ubuntu/Debian: ${BLUE}sudo apt-get install redis-server${NC}"
    echo -e "  macOS: ${BLUE}brew install redis${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Redis 已安装${NC}"

# 检查 Redis 是否已运行
echo -e "${YELLOW}📋 检查 Redis 运行状态...${NC}"
if redis-cli ping &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis 已在运行${NC}"
    redis-cli info server | grep -E "redis_version|tcp_port|uptime_in_seconds"
    echo -e "${GREEN}✅ Redis 服务已启动，无需重复启动${NC}"
    exit 0
fi

# 启动 Redis
echo -e "${YELLOW}🔧 启动 Redis 服务...${NC}"
redis-server --daemonize yes \
    --logfile "$REDIS_LOG" \
    --port 6379 \
    --bind 127.0.0.1 \
    --databases 16 \
    --maxmemory 512mb \
    --maxmemory-policy allkeys-lru \
    --save 900 1 \
    --save 300 10 \
    --save 60 10000 \
    --appendonly yes \
    --appendfsync everysec

# 等待 Redis 启动
sleep 2

# 验证 Redis 是否启动成功
echo -e "${YELLOW}📋 验证 Redis 连接...${NC}"
if redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✅ Redis 连接成功${NC}"
    
    # 显示 Redis 信息
    echo -e "\n${BLUE}📊 Redis 服务信息:${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    redis-cli info server | grep -E "redis_version|redis_mode|tcp_port|uptime_in_seconds|process_id"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo -e "\n${BLUE}💾 内存使用情况:${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    redis-cli info memory | grep -E "used_memory_human|used_memory_peak_human|maxmemory_human"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo -e "\n${BLUE}📝 日志文件:${NC} $REDIS_LOG"
    echo -e "${BLUE}🔌 连接地址:${NC} redis://127.0.0.1:6379"
    echo -e "\n${GREEN}🎉 Redis 服务启动完成！${NC}"
else
    echo -e "${RED}❌ Redis 启动失败${NC}"
    echo -e "${YELLOW}请检查日志文件: $REDIS_LOG${NC}"
    cat "$REDIS_LOG"
    exit 1
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}常用命令:${NC}"
echo -e "  ${YELLOW}redis-cli${NC}              - 进入 Redis 命令行"
echo -e "  ${YELLOW}redis-cli ping${NC}         - 测试连接"
echo -e "  ${YELLOW}redis-cli info${NC}         - 查看服务信息"
echo -e "  ${YELLOW}redis-cli shutdown${NC}     - 关闭 Redis 服务"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

