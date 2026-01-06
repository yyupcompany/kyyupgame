#!/bin/bash

# GitHub Enterprise Runner 重新配置脚本
# 用于将组织级 runner 升级为企业级 runner

set -e

echo "=== GitHub Enterprise Runner 重新配置脚本 ==="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
GITHUB_ENTERPRISE_URL="https://github.com/enterprises/yyup-enterprise"  # 请根据实际企业名称修改
GITHUB_ORG_URL="https://github.com/yyupcompany"
RUNNER_BASE_DIR="/f/kyyup730/github-runners"
RUNNER_COUNT=4

echo -e "${YELLOW}当前配置：${NC}"
echo "- 组织 URL: $GITHUB_ORG_URL"
echo "- 企业 URL: $GITHUB_ENTERPRISE_URL"
echo "- Runner 数量: $RUNNER_COUNT"
echo "- Runner 目录: $RUNNER_BASE_DIR"

# 1. 停止现有 runners
echo -e "\n${YELLOW}步骤 1: 停止现有 runners${NC}"
for i in $(seq 1 $RUNNER_COUNT); do
    RUNNER_DIR="$RUNNER_BASE_DIR/runners/runner-$i"
    if [ -d "$RUNNER_DIR" ]; then
        echo "停止 runner-$i..."
        if [ -f "$RUNNER_DIR/svc.sh" ]; then
            cd "$RUNNER_DIR"
            sudo ./svc.sh stop || echo "Runner $i 可能已经停止"
            sudo ./svc.sh uninstall || echo "Runner $i 服务卸载完成"
        fi
        
        # 移除现有配置
        if [ -f "$RUNNER_DIR/config.sh" ]; then
            cd "$RUNNER_DIR"
            ./config.sh remove --token "$1" || echo "移除配置可能失败，继续..."
        fi
    fi
done

# 2. 重新配置为企业级 runner
echo -e "\n${YELLOW}步骤 2: 重新配置为企业级 runner${NC}"

# 检查是否提供了新的 token
if [ -z "$2" ]; then
    echo -e "${RED}错误: 请提供企业级 runner registration token${NC}"
    echo "用法: $0 <移除token> <企业注册token>"
    echo ""
    echo "获取企业级 token 的步骤："
    echo "1. 访问 GitHub Enterprise 设置"
    echo "2. 进入 Settings → Actions → Runners"
    echo "3. 点击 'New runner'"
    echo "4. 复制 registration token"
    exit 1
fi

ENTERPRISE_TOKEN="$2"

for i in $(seq 1 $RUNNER_COUNT); do
    RUNNER_DIR="$RUNNER_BASE_DIR/runners/runner-$i"
    if [ -d "$RUNNER_DIR" ]; then
        echo -e "\n${GREEN}配置企业级 runner-$i...${NC}"
        cd "$RUNNER_DIR"
        
        # 企业级配置
        ./config.sh --url "$GITHUB_ENTERPRISE_URL" \
                    --token "$ENTERPRISE_TOKEN" \
                    --name "enterprise-runner-$i" \
                    --work "_work" \
                    --labels "enterprise,docker,self-hosted,linux" \
                    --runnergroup "Default" \
                    --unattended
        
        # 安装为系统服务
        sudo ./svc.sh install
        sudo ./svc.sh start
        
        echo -e "${GREEN}Enterprise runner-$i 配置完成${NC}"
    fi
done

# 3. 验证配置
echo -e "\n${YELLOW}步骤 3: 验证 runner 状态${NC}"
for i in $(seq 1 $RUNNER_COUNT); do
    RUNNER_DIR="$RUNNER_BASE_DIR/runners/runner-$i"
    if [ -d "$RUNNER_DIR" ]; then
        cd "$RUNNER_DIR"
        if sudo ./svc.sh status | grep -q "Active"; then
            echo -e "${GREEN}✓ Runner-$i 状态: 运行中${NC}"
        else
            echo -e "${RED}✗ Runner-$i 状态: 停止${NC}"
        fi
    fi
done

echo -e "\n${GREEN}=== 企业级 Runner 配置完成 ===${NC}"
echo "请在 GitHub Enterprise 设置中验证 runners 是否正常注册"
echo "Enterprise URL: $GITHUB_ENTERPRISE_URL/settings/actions/runners"

# 4. 清理旧配置（可选）
echo -e "\n${YELLOW}是否要清理旧的组织级配置文件？ (y/n)${NC}"
read -r cleanup_choice
if [[ $cleanup_choice == "y" || $cleanup_choice == "Y" ]]; then
    echo "清理旧配置文件..."
    find "$RUNNER_BASE_DIR" -name "*.old" -delete 2>/dev/null || true
    echo "清理完成"
fi