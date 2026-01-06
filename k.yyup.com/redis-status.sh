#!/bin/bash

# Redis 状态检查脚本
# 用途：检查 Redis 服务状态和性能指标

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          📊 Redis 服务状态检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# 检查 Redis 是否运行
echo -e "\n${YELLOW}🔍 检查 Redis 连接...${NC}"
if ! redis-cli ping &> /dev/null; then
    echo -e "${RED}❌ Redis 未运行或无法连接${NC}"
    echo -e "${YELLOW}请先启动 Redis: ${CYAN}./start-redis.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Redis 连接成功${NC}"

# 服务器信息
echo -e "\n${BLUE}📋 服务器信息:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
redis-cli info server | grep -E "redis_version|redis_mode|os|arch_bits|tcp_port|uptime_in_seconds|process_id"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 内存信息
echo -e "\n${BLUE}💾 内存使用情况:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
redis-cli info memory | grep -E "used_memory_human|used_memory_peak_human|used_memory_rss_human|maxmemory_human|mem_fragmentation_ratio"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 客户端信息
echo -e "\n${BLUE}👥 客户端信息:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
redis-cli info clients | grep -E "connected_clients|blocked_clients|client_recent_max_input_buffer|client_recent_max_output_buffer"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 统计信息
echo -e "\n${BLUE}📈 统计信息:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
redis-cli info stats | grep -E "total_connections_received|total_commands_processed|instantaneous_ops_per_sec|rejected_connections|expired_keys|evicted_keys"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 持久化信息
echo -e "\n${BLUE}💾 持久化信息:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
redis-cli info persistence | grep -E "loading|rdb_changes_since_last_save|rdb_bgsave_in_progress|rdb_last_save_time|rdb_last_bgsave_status|aof_enabled|aof_rewrite_in_progress"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 数据库信息
echo -e "\n${BLUE}🗄️  数据库信息:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
redis-cli info keyspace
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 复制信息
echo -e "\n${BLUE}🔄 复制信息:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
redis-cli info replication | grep -E "role|connected_slaves|master_repl_offset"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 快速命令测试
echo -e "\n${BLUE}🧪 快速命令测试:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 测试 SET/GET
TEST_KEY="test_key_$(date +%s)"
TEST_VALUE="test_value_$(date +%s)"
redis-cli SET "$TEST_KEY" "$TEST_VALUE" > /dev/null
RESULT=$(redis-cli GET "$TEST_KEY")
if [ "$RESULT" = "$TEST_VALUE" ]; then
    echo -e "${GREEN}✅ SET/GET 测试通过${NC}"
else
    echo -e "${RED}❌ SET/GET 测试失败${NC}"
fi
redis-cli DEL "$TEST_KEY" > /dev/null

# 测试 INCR
redis-cli SET counter 0 > /dev/null
redis-cli INCR counter > /dev/null
COUNTER=$(redis-cli GET counter)
if [ "$COUNTER" = "1" ]; then
    echo -e "${GREEN}✅ INCR 测试通过${NC}"
else
    echo -e "${RED}❌ INCR 测试失败${NC}"
fi
redis-cli DEL counter > /dev/null

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Redis 状态检查完成！${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

