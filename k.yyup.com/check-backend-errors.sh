#!/bin/bash

# 后端日志错误检查脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/home/devbox/project/k.yyup.com"
LOG_DIR="$PROJECT_ROOT/logs"
BACKEND_LOG="$LOG_DIR/backend.log"

echo -e "${BLUE}🔍 后端日志错误分析${NC}"
echo "=================================="

# 检查日志文件是否存在
if [ ! -f "$BACKEND_LOG" ]; then
    echo -e "${RED}❌ 后端日志文件不存在: $BACKEND_LOG${NC}"
    exit 1
fi

# 获取日志文件大小
LOG_SIZE=$(du -h "$BACKEND_LOG" | cut -f1)
echo -e "${CYAN}📄 日志文件: $BACKEND_LOG (${LOG_SIZE})${NC}"
echo ""

# 1. 统计错误类型
echo -e "${YELLOW}📊 错误统计:${NC}"
echo "--------------------------------"

# 统计各种错误
ERROR_COUNT=$(grep -iE "error|❌|failed|exception|fatal|critical" "$BACKEND_LOG" | wc -l)
WARNING_COUNT=$(grep -iE "warning|⚠️|warn" "$BACKEND_LOG" | wc -l)
REDIS_ERROR_COUNT=$(grep -iE "redis.*error|redis连接失败|redis错误|redis.*failed|ECONNREFUSED.*6379" "$BACKEND_LOG" | wc -l)
DATABASE_ERROR_COUNT=$(grep -iE "database.*error|sequelize.*error|mysql.*error|connection.*failed|ECONNREFUSED.*3306" "$BACKEND_LOG" | wc -l)
API_ERROR_COUNT=$(grep -iE "api.*error|[45][0-9]{2}|timeout|ECONNRESET" "$BACKEND_LOG" | wc -l)
DEPRECATION_COUNT=$(grep -i "deprecation\|deprecated" "$BACKEND_LOG" | wc -l)
SIP_ERROR_COUNT=$(grep -i "sip.*error\|sip.*失败\|sip_configs" "$BACKEND_LOG" | wc -l)

echo -e "   总错误数: ${RED}$ERROR_COUNT${NC}"
echo -e "   警告数: ${YELLOW}$WARNING_COUNT${NC}"
echo -e "   Redis错误: ${RED}$REDIS_ERROR_COUNT${NC}"
echo -e "   数据库错误: ${RED}$DATABASE_ERROR_COUNT${NC}"
echo -e "   API错误: ${RED}$API_ERROR_COUNT${NC}"
echo -e "   弃用警告: ${YELLOW}$DEPRECATION_COUNT${NC}"
echo -e "   SIP错误: ${RED}$SIP_ERROR_COUNT${NC}"
echo ""

# 2. Redis连接错误详情
if [ $REDIS_ERROR_COUNT -gt 0 ]; then
    echo -e "${RED}🔴 Redis连接错误详情:${NC}"
    echo "--------------------------------"
    grep -iE "redis.*error|redis连接失败|redis错误|redis.*failed|ECONNREFUSED.*6379" "$BACKEND_LOG" | head -10 | while read line; do
        echo -e "${RED}   $line${NC}"
    done
    echo ""
fi

# 3. 数据库错误详情
if [ $DATABASE_ERROR_COUNT -gt 0 ]; then
    echo -e "${RED}🔴 数据库错误详情:${NC}"
    echo "--------------------------------"
    grep -i "database.*error\|sequelize.*error\|mysql.*error" "$BACKEND_LOG" | head -5 | while read line; do
        echo -e "${RED}   $line${NC}"
    done
    echo ""
fi

# 4. 弃用警告详情
if [ $DEPRECATION_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  弃用警告详情:${NC}"
    echo "--------------------------------"
    grep -i "deprecation\|deprecated" "$BACKEND_LOG" | head -5 | while read line; do
        echo -e "${YELLOW}   $line${NC}"
    done
    echo ""
fi

# 5. SIP配置错误详情
if [ $SIP_ERROR_COUNT -gt 0 ]; then
    echo -e "${RED}📞 SIP配置错误详情:${NC}"
    echo "--------------------------------"
    grep -i "sip.*error\|sip.*失败\|sip_configs" "$BACKEND_LOG" | head -5 | while read line; do
        echo -e "${RED}   $line${NC}"
    done
    echo ""
fi

# 6. 最近的错误 (最后50行中的错误)
echo -e "${YELLOW}🕒 最近的错误 (最后50行):${NC}"
echo "--------------------------------"
tail -50 "$BACKEND_LOG" | grep -iE "error|❌|failed|exception|fatal|critical|⚠️" | head -10 | while read line; do
    echo -e "${RED}   $line${NC}"
done
echo ""

# 5. 启动相关错误
echo -e "${YELLOW}🚀 启动相关错误:${NC}"
echo "--------------------------------"
grep -i "启动.*失败\|初始化.*失败\|连接.*失败\|加载.*失败" "$BACKEND_LOG" | head -5 | while read line; do
    echo -e "${RED}   $line${NC}"
done
echo ""

# 6. 端口占用错误
echo -e "${YELLOW}🔌 端口相关错误:${NC}"
echo "--------------------------------"
grep -i "port.*already\|端口.*占用\|EADDRINUSE\|address already in use" "$BACKEND_LOG" | head -3 | while read line; do
    echo -e "${RED}   $line${NC}"
done
echo ""

# 7. 权限相关错误
echo -e "${YELLOW}🔐 权限相关错误:${NC}"
echo "--------------------------------"
grep -i "permission.*denied\|unauthorized\|forbidden\|权限.*拒绝" "$BACKEND_LOG" | head -3 | while read line; do
    echo -e "${RED}   $line${NC}"
done
echo ""

# 8. 模型关联错误
echo -e "${YELLOW}🔗 模型关联错误:${NC}"
echo "--------------------------------"
grep -i "not associated\|关联.*失败\|model.*error" "$BACKEND_LOG" | head -5 | while read line; do
    echo -e "${RED}   $line${NC}"
done
echo ""

# 9. API请求错误
echo -e "${YELLOW}🌐 API请求错误:${NC}"
echo "--------------------------------"
grep -E "\s(4[0-9]{2}|5[0-9]{2})\s" "$BACKEND_LOG" | head -5 | while read line; do
    echo -e "${RED}   $line${NC}"
done
echo ""

# 10. 致命错误 (Fatal, Critical)
echo -e "${RED}💀 致命错误:${NC}"
echo "--------------------------------"
grep -i "fatal\|critical\|crash\|致命" "$BACKEND_LOG" | head -3 | while read line; do
    echo -e "${RED}   $line${NC}"
done
echo ""

# 11. 异常堆栈跟踪
echo -e "${PURPLE}📚 异常堆栈跟踪 (最近3个):${NC}"
echo "--------------------------------"
grep -A 5 -B 1 "Error:" "$BACKEND_LOG" | tail -20 | while read line; do
    if [[ $line == *"Error:"* ]]; then
        echo -e "${RED}   $line${NC}"
    elif [[ $line == *"at "* ]]; then
        echo -e "${YELLOW}   $line${NC}"
    else
        echo -e "   $line"
    fi
done
echo ""

# 12. 生成错误报告摘要
echo -e "${BLUE}📋 错误报告摘要:${NC}"
echo "=================================="
echo -e "分析时间: $(date)"
echo -e "日志文件: $BACKEND_LOG"
echo -e "文件大小: $LOG_SIZE"
echo ""
echo -e "错误分布:"
echo -e "  - 总错误: $ERROR_COUNT"
echo -e "  - Redis错误: $REDIS_ERROR_COUNT ($(echo "scale=1; $REDIS_ERROR_COUNT*100/$ERROR_COUNT" | bc 2>/dev/null || echo "0")%)"
echo -e "  - 数据库错误: $DATABASE_ERROR_COUNT ($(echo "scale=1; $DATABASE_ERROR_COUNT*100/$ERROR_COUNT" | bc 2>/dev/null || echo "0")%)"
echo -e "  - API错误: $API_ERROR_COUNT ($(echo "scale=1; $API_ERROR_COUNT*100/$ERROR_COUNT" | bc 2>/dev/null || echo "0")%)"
echo ""

# 13. 建议修复措施
echo -e "${GREEN}💡 建议修复措施:${NC}"
echo "--------------------------------"

if [ $REDIS_ERROR_COUNT -gt 10 ]; then
    echo -e "${YELLOW}   🔧 Redis连接问题严重，建议:${NC}"
    echo -e "      - 检查Redis服务是否启动: sudo systemctl status redis"
    echo -e "      - 启动Redis服务: sudo systemctl start redis"
    echo -e "      - 或禁用Redis依赖功能"
fi

if [ $DATABASE_ERROR_COUNT -gt 0 ]; then
    echo -e "${YELLOW}   🔧 数据库连接问题，建议:${NC}"
    echo -e "      - 检查数据库连接配置"
    echo -e "      - 运行数据库迁移: cd server && npx sequelize-cli db:migrate"
fi

if [ $ERROR_COUNT -gt 50 ]; then
    echo -e "${YELLOW}   🔧 错误数量较多，建议:${NC}"
    echo -e "      - 重启后端服务"
    echo -e "      - 检查系统资源使用情况"
    echo -e "      - 清理日志文件"
fi

echo ""
echo -e "${CYAN}💻 查看完整日志命令:${NC}"
echo -e "   实时监控: ${YELLOW}tail -f $BACKEND_LOG${NC}"
echo -e "   查看错误: ${YELLOW}grep -i error $BACKEND_LOG${NC}"
echo -e "   清理日志: ${YELLOW}> $BACKEND_LOG${NC}"
echo ""
