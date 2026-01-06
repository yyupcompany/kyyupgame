#!/bin/bash

################################################################################
#                                                                              #
#                    快速部署脚本 - 一键部署到香港服务器                      #
#                                                                              #
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
SSH_ALIAS="yisu"
REMOTE_BASE="/home/szblade/yyup-deploy"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  香港服务器 - 快速部署                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检查SSH连接
echo -e "${YELLOW}🔍 检查SSH连接...${NC}"
if ! ssh $SSH_ALIAS "echo 'SSH连接成功'" > /dev/null 2>&1; then
    echo -e "${RED}❌ SSH连接失败，请检查配置${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SSH连接成功${NC}"
echo ""

# 选择部署方式
echo -e "${BLUE}请选择部署方式:${NC}"
echo "1. 完整部署 (编译+上传+启动) - 推荐"
echo "2. 仅编译"
echo "3. 仅上传"
echo "4. 仅启动"
echo "5. 前端部署"
echo "6. 后端部署"
echo "7. 检查状态"
echo "8. 查看日志"
echo ""
read -p "请输入选项 (1-8): " choice

case $choice in
    1)
        echo -e "${YELLOW}开始完整部署...${NC}"
        ./deploy-to-hong-kong.sh --full
        ;;
    2)
        echo -e "${YELLOW}开始编译...${NC}"
        ./deploy-to-hong-kong.sh --build-only
        ;;
    3)
        echo -e "${YELLOW}开始上传...${NC}"
        ./deploy-to-hong-kong.sh --upload-only
        ;;
    4)
        echo -e "${YELLOW}开始启动...${NC}"
        ./deploy-to-hong-kong.sh --start-only
        ;;
    5)
        echo -e "${YELLOW}开始前端部署...${NC}"
        ./deploy-to-hong-kong.sh --frontend-only
        ;;
    6)
        echo -e "${YELLOW}开始后端部署...${NC}"
        ./deploy-to-hong-kong.sh --backend-only
        ;;
    7)
        echo -e "${YELLOW}检查服务状态...${NC}"
        ./deploy-to-hong-kong.sh --check-status
        ;;
    8)
        echo -e "${YELLOW}查看服务日志...${NC}"
        ./deploy-to-hong-kong.sh --view-logs
        ;;
    *)
        echo -e "${RED}❌ 无效选项${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ 操作完成！${NC}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo "  前端: http://103.210.237.249:6000"
echo "  后端: http://103.210.237.249:4000"
echo "  API文档: http://103.210.237.249:4000/api-docs"
echo ""

