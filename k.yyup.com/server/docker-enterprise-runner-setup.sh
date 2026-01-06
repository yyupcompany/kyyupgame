#!/bin/bash

# GitHub Enterprise Runner Docker 配置脚本

set -e

echo "=== GitHub Enterprise Runner Docker 配置脚本 ==="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
GITHUB_ENTERPRISE_URL="https://github.com/enterprises/yyup-enterprise"  # 请根据实际企业名称修改
RUNNER_IMAGE="sumologic/docker-github-actions-runner"
RUNNER_COUNT=4
NETWORK_NAME="github-runners-network"

echo -e "${YELLOW}Docker Enterprise Runner 配置${NC}"
echo "- 企业 URL: $GITHUB_ENTERPRISE_URL"
echo "- Runner 镜像: $RUNNER_IMAGE"
echo "- Runner 数量: $RUNNER_COUNT"

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供企业级 runner registration token${NC}"
    echo "用法: $0 <企业注册token>"
    echo ""
    echo -e "${BLUE}获取企业级 token 的步骤：${NC}"
    echo "1. 访问 https://github.com/enterprises/YOUR_ENTERPRISE/settings/actions/runners"
    echo "2. 点击 'New runner'"
    echo "3. 选择 'Linux x64'"
    echo "4. 复制显示的 registration token"
    exit 1
fi

ENTERPRISE_TOKEN="$1"

# 1. 停止现有容器
echo -e "\n${YELLOW}步骤 1: 停止并移除现有 runner 容器${NC}"
for i in $(seq 1 $RUNNER_COUNT); do
    CONTAINER_NAME="github-enterprise-runner-$i"
    if docker ps -a | grep -q "$CONTAINER_NAME"; then
        echo "停止容器: $CONTAINER_NAME"
        docker stop "$CONTAINER_NAME" || true
        docker rm "$CONTAINER_NAME" || true
    fi
done

# 清理旧的组织级容器（如果存在）
docker ps -a | grep "github-runner" | awk '{print $1}' | xargs -r docker stop
docker ps -a | grep "github-runner" | awk '{print $1}' | xargs -r docker rm

# 2. 创建 Docker 网络（如果不存在）
echo -e "\n${YELLOW}步骤 2: 创建 Docker 网络${NC}"
if ! docker network ls | grep -q "$NETWORK_NAME"; then
    docker network create "$NETWORK_NAME"
    echo -e "${GREEN}网络 $NETWORK_NAME 创建成功${NC}"
else
    echo -e "${GREEN}网络 $NETWORK_NAME 已存在${NC}"
fi

# 3. 启动企业级 runner 容器
echo -e "\n${YELLOW}步骤 3: 启动企业级 runner 容器${NC}"
for i in $(seq 1 $RUNNER_COUNT); do
    CONTAINER_NAME="github-enterprise-runner-$i"
    RUNNER_NAME="enterprise-docker-runner-$i"
    
    echo -e "${BLUE}启动 $CONTAINER_NAME...${NC}"
    
    docker run -d \
        --name "$CONTAINER_NAME" \
        --network "$NETWORK_NAME" \
        --restart unless-stopped \
        -e GITHUB_REPOSITORY_URL="$GITHUB_ENTERPRISE_URL" \
        -e GITHUB_TOKEN="$ENTERPRISE_TOKEN" \
        -e GITHUB_RUNNER_NAME="$RUNNER_NAME" \
        -e GITHUB_RUNNER_LABELS="enterprise,docker,self-hosted,linux,runner-$i" \
        -e GITHUB_RUNNER_GROUP="Default" \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v "/f/kyyup730/github-runners/runner-cache:/runner-cache" \
        "$RUNNER_IMAGE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $CONTAINER_NAME 启动成功${NC}"
    else
        echo -e "${RED}✗ $CONTAINER_NAME 启动失败${NC}"
    fi
    
    # 稍作延迟避免同时注册冲突
    sleep 2
done

# 4. 验证容器状态
echo -e "\n${YELLOW}步骤 4: 验证容器状态${NC}"
sleep 10  # 等待容器初始化
for i in $(seq 1 $RUNNER_COUNT); do
    CONTAINER_NAME="github-enterprise-runner-$i"
    if docker ps | grep -q "$CONTAINER_NAME"; then
        STATUS=$(docker inspect "$CONTAINER_NAME" --format='{{.State.Status}}')
        echo -e "${GREEN}✓ $CONTAINER_NAME 状态: $STATUS${NC}"
    else
        echo -e "${RED}✗ $CONTAINER_NAME 状态: 未运行${NC}"
    fi
done

# 5. 显示日志
echo -e "\n${YELLOW}步骤 5: 显示 runner 注册日志${NC}"
echo -e "${BLUE}Runner-1 最近日志:${NC}"
docker logs --tail 20 "github-enterprise-runner-1"

# 6. 提供管理命令
echo -e "\n${GREEN}=== 企业级 Docker Runner 配置完成 ===${NC}"
echo -e "${BLUE}管理命令:${NC}"
echo "查看所有 runners: docker ps | grep github-enterprise-runner"
echo "查看 runner 日志: docker logs github-enterprise-runner-1"
echo "停止所有 runners: docker stop \$(docker ps | grep github-enterprise-runner | awk '{print \$1}')"
echo "重启 runner: docker restart github-enterprise-runner-1"
echo ""
echo -e "${YELLOW}验证地址:${NC} $GITHUB_ENTERPRISE_URL/settings/actions/runners"

# 创建管理脚本
cat > /f/kyyup730/github-runners/manage-enterprise-runners.sh << 'EOF'
#!/bin/bash
# GitHub Enterprise Runners 管理脚本

case "$1" in
    "status")
        echo "=== Enterprise Runners 状态 ==="
        docker ps | grep github-enterprise-runner
        ;;
    "logs")
        RUNNER_NUM=${2:-1}
        echo "=== Runner-$RUNNER_NUM 日志 ==="
        docker logs -f "github-enterprise-runner-$RUNNER_NUM"
        ;;
    "restart")
        RUNNER_NUM=${2:-all}
        if [ "$RUNNER_NUM" = "all" ]; then
            echo "重启所有 Enterprise Runners..."
            docker restart $(docker ps | grep github-enterprise-runner | awk '{print $1}')
        else
            echo "重启 Runner-$RUNNER_NUM..."
            docker restart "github-enterprise-runner-$RUNNER_NUM"
        fi
        ;;
    "stop")
        echo "停止所有 Enterprise Runners..."
        docker stop $(docker ps | grep github-enterprise-runner | awk '{print $1}')
        ;;
    *)
        echo "用法: $0 {status|logs [runner_num]|restart [runner_num|all]|stop}"
        ;;
esac
EOF

chmod +x /f/kyyup730/github-runners/manage-enterprise-runners.sh
echo -e "${GREEN}管理脚本已创建: /f/kyyup730/github-runners/manage-enterprise-runners.sh${NC}"