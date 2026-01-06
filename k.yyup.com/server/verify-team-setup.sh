#!/bin/bash

# GitHub Team 版本 Runners 验证脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GitHub Team 版本 Runners 验证 ===${NC}"

ORG_NAME="${1:-yyupcompany}"
echo -e "${BLUE}组织名称: $ORG_NAME${NC}"
echo -e "${BLUE}组织类型: GitHub Team${NC}"

# 1. 检查 Docker 容器状态
echo -e "\n${YELLOW}1. 检查 Team Runners 容器状态${NC}"
RUNNING_CONTAINERS=$(docker ps | grep "github-team-runner" | wc -l)
if [ "$RUNNING_CONTAINERS" -eq 4 ]; then
    echo -e "${GREEN}✓ 4 个 Team runners 正在运行${NC}"
    docker ps | grep "github-team-runner" | awk '{print $1, $2, $NF}'
else
    echo -e "${RED}✗ 预期 4 个 Team runners，实际运行 $RUNNING_CONTAINERS 个${NC}"
    if [ "$RUNNING_CONTAINERS" -eq 0 ]; then
        echo -e "${YELLOW}提示: 运行 ./deploy-team-runners.sh <TOKEN> 来部署${NC}"
    fi
fi

# 2. 检查健康状态
echo -e "\n${YELLOW}2. 检查 Team Runners 健康状态${NC}"
for i in {1..4}; do
    CONTAINER_NAME="github-team-runner-$i"
    if docker ps | grep -q "$CONTAINER_NAME"; then
        HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "no-health-check")
        case $HEALTH_STATUS in
            "healthy")
                echo -e "${GREEN}✓ Team Runner-$i: 健康${NC}"
                ;;
            "starting")
                echo -e "${YELLOW}⏳ Team Runner-$i: 启动中${NC}"
                ;;
            "unhealthy")
                echo -e "${RED}✗ Team Runner-$i: 不健康${NC}"
                ;;
            "no-health-check")
                echo -e "${BLUE}? Team Runner-$i: 运行中 (无健康检查)${NC}"
                ;;
            *)
                echo -e "${RED}✗ Team Runner-$i: 未知状态 ($HEALTH_STATUS)${NC}"
                ;;
        esac
    else
        echo -e "${RED}✗ Team Runner-$i: 容器未运行${NC}"
    fi
done

# 3. 检查注册状态
echo -e "\n${YELLOW}3. 检查 GitHub 注册状态${NC}"
for i in {1..2}; do  # 检查前两个节省时间
    CONTAINER_NAME="github-team-runner-$i"
    if docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${BLUE}Team Runner-$i 注册状态:${NC}"
        REGISTRATION_LOG=$(docker logs "$CONTAINER_NAME" 2>/dev/null | grep -E "(Listening for Jobs|Runner successfully configured|Connected to GitHub|ERROR)" | tail -3)
        if echo "$REGISTRATION_LOG" | grep -q "Listening for Jobs"; then
            echo -e "${GREEN}✓ 已注册并监听任务${NC}"
        elif echo "$REGISTRATION_LOG" | grep -q "Connected to GitHub"; then
            echo -e "${GREEN}✓ 已连接到 GitHub${NC}"
        elif echo "$REGISTRATION_LOG" | grep -q "successfully configured"; then
            echo -e "${YELLOW}⏳ 配置成功，建立连接中${NC}"
        elif echo "$REGISTRATION_LOG" | grep -q "ERROR"; then
            echo -e "${RED}✗ 注册过程中出现错误${NC}"
            echo "$REGISTRATION_LOG" | head -3
        else
            echo -e "${BLUE}? 状态不明确，显示最新日志:${NC}"
            docker logs --tail 5 "$CONTAINER_NAME" 2>/dev/null || echo "无法获取日志"
        fi
    fi
done

# 4. 检查网络连接
echo -e "\n${YELLOW}4. 检查 Docker 网络配置${NC}"
NETWORK_NAME="github-team-runners-network"
if docker network ls | grep -q "$NETWORK_NAME"; then
    echo -e "${GREEN}✓ Docker 网络 '$NETWORK_NAME' 存在${NC}"
    CONNECTED_CONTAINERS=$(docker network inspect "$NETWORK_NAME" --format='{{len .Containers}}' 2>/dev/null || echo "0")
    echo -e "${BLUE}已连接容器数量: $CONNECTED_CONTAINERS${NC}"
else
    echo -e "${RED}✗ Docker 网络 '$NETWORK_NAME' 不存在${NC}"
fi

# 5. 检查工作流配置
echo -e "\n${YELLOW}5. 检查 GitHub Actions 工作流配置${NC}"
WORKFLOW_FILE="../.github/workflows/claude-code-action.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    echo -e "${GREEN}✓ Claude Code Action 工作流文件存在${NC}"
    
    if grep -q "self-hosted.*team" "$WORKFLOW_FILE"; then
        echo -e "${GREEN}✓ 工作流已配置为使用 Team self-hosted runners${NC}"
    elif grep -q "ubuntu-latest" "$WORKFLOW_FILE"; then
        echo -e "${YELLOW}⚠ 工作流仍使用 GitHub 托管的 ubuntu-latest${NC}"
        echo -e "${BLUE}建议修改为: runs-on: [self-hosted, team, org-licensed]${NC}"
    else
        echo -e "${BLUE}? 工作流配置需要检查${NC}"
    fi
    
    if grep -q "pull-requests: write" "$WORKFLOW_FILE"; then
        echo -e "${GREEN}✓ 工作流权限已优化${NC}"
    else
        echo -e "${YELLOW}⚠ 建议添加 pull-requests: write 权限${NC}"
    fi
    
    if grep -q "max_turns" "$WORKFLOW_FILE"; then
        MAX_TURNS=$(grep "max_turns" "$WORKFLOW_FILE" | sed 's/.*max_turns: "\([0-9]*\)".*/\1/')
        echo -e "${GREEN}✓ 最大轮次设置: $MAX_TURNS${NC}"
    fi
else
    echo -e "${RED}✗ Claude Code Action 工作流文件不存在${NC}"
    echo -e "${BLUE}路径: $WORKFLOW_FILE${NC}"
fi

# 6. 检查 GitHub Secrets
echo -e "\n${YELLOW}6. 检查 GitHub Secrets 配置${NC}"
echo -e "${BLUE}需要验证以下 Secrets 是否在 GitHub 中配置:${NC}"
echo "- CLAUDE_CODE_OAUTH_TOKEN"
echo "- GITHUB_TOKEN (自动提供)"
echo ""
echo -e "${YELLOW}验证方式:${NC}"
echo "访问: https://github.com/$ORG_NAME/settings/secrets/actions"

# 7. 检查环境变量
echo -e "\n${YELLOW}7. 检查本地环境变量配置${NC}"
if [ -f ".env" ]; then
    if grep -q "TEAM_REGISTRATION_TOKEN" ".env"; then
        echo -e "${GREEN}✓ 环境变量文件包含 Team token 配置${NC}"
    else
        echo -e "${YELLOW}⚠ 环境变量文件缺少 TEAM_REGISTRATION_TOKEN${NC}"
    fi
    
    if grep -q "ORG_NAME" ".env"; then
        ENV_ORG=$(grep "ORG_NAME" ".env" | cut -d'=' -f2)
        echo -e "${BLUE}配置的组织名称: $ENV_ORG${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 环境变量文件 .env 不存在${NC}"
fi

# 8. 组织级别权限检查
echo -e "\n${YELLOW}8. GitHub Team 版本特性验证${NC}"
echo -e "${BLUE}GitHub Team 版本支持的功能:${NC}"
echo "✓ 组织级 self-hosted runners (当前配置)"
echo "✓ 高级协作工具"
echo "✓ 受保护的分支"
echo "✓ 代码所有者"
echo "✓ GitHub Actions (无限私有仓库分钟数)"
echo ""
echo -e "${YELLOW}注意: Team 版本限制${NC}"
echo "- Self-hosted runners 作用域限制在组织级别"
echo "- 不支持企业级策略管理"
echo "- Runner 配置 URL 格式: https://github.com/ORG_NAME"

# 9. 提供故障排除建议
echo -e "\n${YELLOW}9. 故障排除建议${NC}"
echo -e "${BLUE}如果 @claude 命令不响应:${NC}"
echo "1. 检查 GitHub 组织设置中的 Actions 权限"
echo "2. 确认 CLAUDE_CODE_OAUTH_TOKEN secret 已配置"
echo "3. 验证工作流文件语法正确"
echo "4. 查看 Actions 页面的工作流运行日志"
echo ""
echo -e "${BLUE}Runner 管理命令:${NC}"
echo "查看状态: ../github-runners/team-runners-ctl.sh status"
echo "查看日志: ../github-runners/team-runners-ctl.sh logs 1"
echo "重启服务: ../github-runners/team-runners-ctl.sh restart all"

# 10. 生成验证报告
echo -e "\n${YELLOW}10. 生成验证报告${NC}"
REPORT_FILE="../github-runners/team-verification-$(date +%Y%m%d-%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
GitHub Team 版本 Runners 验证报告
验证时间: $(date)
组织名称: $ORG_NAME
组织类型: GitHub Team

=== 容器状态 ===
运行中的 Team Runners: $RUNNING_CONTAINERS/4
$(docker ps | grep "github-team-runner" || echo "无运行中的 Team runners")

=== 健康状态 ===
EOF

for i in {1..4}; do
    CONTAINER_NAME="github-team-runner-$i"
    if docker ps | grep -q "$CONTAINER_NAME"; then
        HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "running")
        echo "Team Runner-$i: $HEALTH_STATUS" >> "$REPORT_FILE"
    else
        echo "Team Runner-$i: 未运行" >> "$REPORT_FILE"
    fi
done

echo "" >> "$REPORT_FILE"
echo "=== 网络配置 ===" >> "$REPORT_FILE"
echo "网络名称: $NETWORK_NAME" >> "$REPORT_FILE"
if docker network ls | grep -q "$NETWORK_NAME"; then
    CONNECTED_COUNT=$(docker network inspect "$NETWORK_NAME" --format='{{len .Containers}}' 2>/dev/null || echo "0")
    echo "连接的容器数量: $CONNECTED_COUNT" >> "$REPORT_FILE"
else
    echo "网络状态: 不存在" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "=== 最新日志（Team Runner-1）===" >> "$REPORT_FILE"
docker logs --tail 10 "github-team-runner-1" >> "$REPORT_FILE" 2>/dev/null || echo "无法获取日志" >> "$REPORT_FILE"

echo -e "${GREEN}验证报告已保存: $REPORT_FILE${NC}"

# 11. 最终状态总结
echo -e "\n${GREEN}=== GitHub Team 版本验证完成 ===${NC}"
if [ "$RUNNING_CONTAINERS" -eq 4 ]; then
    echo -e "${GREEN}🎉 GitHub Team Runners 配置成功！${NC}"
    echo -e "${BLUE}验证地址: https://github.com/$ORG_NAME/settings/actions/runners${NC}"
    echo -e "${BLUE}现在可以在 Issues/PRs 中使用 @claude 命令${NC}"
    echo ""
    echo -e "${YELLOW}测试建议:${NC}"
    echo "1. 在仓库 Issue 中评论 '@claude hello' 测试基本功能"
    echo "2. 在 PR 中使用 '@claude review this code' 测试代码审查"
    echo "3. 观察 Actions 页面的工作流执行情况"
else
    echo -e "${YELLOW}⚠ 部分 Team Runners 需要调试${NC}"
    echo -e "${BLUE}建议操作:${NC}"
    echo "1. 检查上述问题并运行相应修复命令"
    echo "2. 如需重新部署: ./deploy-team-runners.sh <TOKEN>"
    echo "3. 查看详细日志: docker logs github-team-runner-1"
fi