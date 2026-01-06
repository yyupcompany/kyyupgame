#!/bin/bash

# GitHub Enterprise Runners 验证脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GitHub Enterprise Runners 配置验证 ===${NC}"

ENTERPRISE_NAME="${1:-yyup-enterprise}"
echo -e "${BLUE}企业名称: $ENTERPRISE_NAME${NC}"

# 1. 检查 Docker 容器状态
echo -e "\n${YELLOW}1. 检查 Docker 容器状态${NC}"
RUNNING_CONTAINERS=$(docker ps | grep "github-enterprise-runner" | wc -l)
if [ "$RUNNING_CONTAINERS" -eq 4 ]; then
    echo -e "${GREEN}✓ 4 个企业级 runners 正在运行${NC}"
    docker ps | grep "github-enterprise-runner" | awk '{print $1, $2, $NF}'
else
    echo -e "${RED}✗ 预期 4 个 runners，实际运行 $RUNNING_CONTAINERS 个${NC}"
fi

# 2. 检查健康状态
echo -e "\n${YELLOW}2. 检查 Runners 健康状态${NC}"
for i in {1..4}; do
    CONTAINER_NAME="github-enterprise-runner-$i"
    if docker ps | grep -q "$CONTAINER_NAME"; then
        HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "no-health-check")
        case $HEALTH_STATUS in
            "healthy")
                echo -e "${GREEN}✓ Runner-$i: 健康${NC}"
                ;;
            "starting")
                echo -e "${YELLOW}⏳ Runner-$i: 启动中${NC}"
                ;;
            "unhealthy")
                echo -e "${RED}✗ Runner-$i: 不健康${NC}"
                ;;
            "no-health-check")
                echo -e "${BLUE}? Runner-$i: 无健康检查${NC}"
                ;;
            *)
                echo -e "${RED}✗ Runner-$i: 未知状态 ($HEALTH_STATUS)${NC}"
                ;;
        esac
    else
        echo -e "${RED}✗ Runner-$i: 容器未运行${NC}"
    fi
done

# 3. 检查注册日志
echo -e "\n${YELLOW}3. 检查注册状态（从日志）${NC}"
for i in {1..2}; do  # 只检查前两个以节省时间
    CONTAINER_NAME="github-enterprise-runner-$i"
    if docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${BLUE}Runner-$i 注册状态:${NC}"
        REGISTRATION_LOG=$(docker logs "$CONTAINER_NAME" 2>/dev/null | grep -E "(Listening for Jobs|Runner successfully configured|ERROR)" | tail -3)
        if echo "$REGISTRATION_LOG" | grep -q "Listening for Jobs"; then
            echo -e "${GREEN}✓ 已注册并监听任务${NC}"
        elif echo "$REGISTRATION_LOG" | grep -q "successfully configured"; then
            echo -e "${YELLOW}⏳ 配置成功，等待连接${NC}"
        elif echo "$REGISTRATION_LOG" | grep -q "ERROR"; then
            echo -e "${RED}✗ 注册过程中出现错误${NC}"
            echo "$REGISTRATION_LOG"
        else
            echo -e "${BLUE}? 状态不明确，请查看完整日志${NC}"
        fi
    fi
done

# 4. 检查网络连接
echo -e "\n${YELLOW}4. 检查网络连接${NC}"
NETWORK_NAME="github-runners-network"
if docker network ls | grep -q "$NETWORK_NAME"; then
    echo -e "${GREEN}✓ Docker 网络 '$NETWORK_NAME' 存在${NC}"
    CONNECTED_CONTAINERS=$(docker network inspect "$NETWORK_NAME" --format='{{len .Containers}}')
    echo -e "${BLUE}已连接容器数量: $CONNECTED_CONTAINERS${NC}"
else
    echo -e "${RED}✗ Docker 网络 '$NETWORK_NAME' 不存在${NC}"
fi

# 5. 检查工作流配置
echo -e "\n${YELLOW}5. 检查工作流配置${NC}"
WORKFLOW_FILE="../.github/workflows/claude-code-action.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    if grep -q "self-hosted.*enterprise" "$WORKFLOW_FILE"; then
        echo -e "${GREEN}✓ 工作流已配置为使用企业级 runners${NC}"
    else
        echo -e "${YELLOW}⚠ 工作流可能仍在使用 GitHub 托管 runners${NC}"
    fi
    
    if grep -q "pull-requests: write" "$WORKFLOW_FILE"; then
        echo -e "${GREEN}✓ 工作流权限已更新${NC}"
    else
        echo -e "${YELLOW}⚠ 可能需要添加 pull-requests: write 权限${NC}"
    fi
else
    echo -e "${RED}✗ 工作流文件不存在${NC}"
fi

# 6. 检查环境变量配置
echo -e "\n${YELLOW}6. 检查环境变量配置${NC}"
if [ -f ".env" ]; then
    if grep -q "ENTERPRISE_REGISTRATION_TOKEN" ".env"; then
        echo -e "${GREEN}✓ 环境变量文件存在且包含企业 token${NC}"
    else
        echo -e "${RED}✗ 环境变量文件缺少企业 token${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 环境变量文件 .env 不存在${NC}"
fi

# 7. 提供下一步建议
echo -e "\n${YELLOW}7. 下一步操作建议${NC}"
echo -e "${BLUE}验证步骤:${NC}"
echo "1. 访问 https://github.com/enterprises/$ENTERPRISE_NAME/settings/actions/runners"
echo "2. 确认看到 4 个在线的企业级 runners"
echo "3. 在 Issue 或 PR 中测试 @claude 命令"
echo ""
echo -e "${BLUE}如果有问题:${NC}"
echo "查看详细日志: docker logs github-enterprise-runner-1"
echo "重启服务: docker-compose -f docker-compose.enterprise-runners.yml restart"
echo "完整重新部署: ./deploy-enterprise-runners.sh <NEW_TOKEN>"

# 8. 生成状态报告
echo -e "\n${YELLOW}8. 生成状态报告${NC}"
REPORT_FILE="../github-runners/enterprise-status-$(date +%Y%m%d-%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
GitHub Enterprise Runners 状态报告
生成时间: $(date)
企业名称: $ENTERPRISE_NAME

=== 容器状态 ===
$(docker ps | grep "github-enterprise-runner" || echo "无运行中的企业级 runners")

=== 健康检查 ===
EOF

for i in {1..4}; do
    CONTAINER_NAME="github-enterprise-runner-$i"
    if docker ps | grep -q "$CONTAINER_NAME"; then
        HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "no-health-check")
        echo "Runner-$i: $HEALTH_STATUS" >> "$REPORT_FILE"
    else
        echo "Runner-$i: 未运行" >> "$REPORT_FILE"
    fi
done

echo "" >> "$REPORT_FILE"
echo "=== 最新日志（Runner-1）===" >> "$REPORT_FILE"
docker logs --tail 10 "github-enterprise-runner-1" >> "$REPORT_FILE" 2>/dev/null || echo "无法获取日志" >> "$REPORT_FILE"

echo -e "${GREEN}状态报告已保存到: $REPORT_FILE${NC}"

# 9. 最终状态总结
echo -e "\n${GREEN}=== 验证完成 ===${NC}"
if [ "$RUNNING_CONTAINERS" -eq 4 ]; then
    echo -e "${GREEN}🎉 企业级 Runners 配置成功！${NC}"
    echo -e "${BLUE}现在可以在 GitHub Issues/PRs 中使用 @claude 命令${NC}"
else
    echo -e "${YELLOW}⚠ 部分 Runners 可能需要调试${NC}"
    echo -e "${BLUE}请检查上述问题并运行相应的修复命令${NC}"
fi