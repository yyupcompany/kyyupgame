#!/bin/bash

# API文档生成脚本
# 这个脚本会运行所有API文档生成工具，一键生成完整的API文档和统计报告

# 定义当前目录为server目录
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$CURRENT_DIR"

echo "=========================================="
echo "     API文档生成工具 v1.0"
echo "=========================================="
echo ""

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 创建输出目录
mkdir -p ./docs/api

# 生成API统计报告
echo -e "${YELLOW}[1/4] 正在生成API统计报告...${NC}"
node ./scripts/count-apis.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ API统计报告生成成功${NC}"
  cp ./api-statistics.md ./docs/api/
else
  echo -e "${RED}✗ API统计报告生成失败${NC}"
fi

# 生成API文档
echo -e "${YELLOW}[2/4] 正在生成API文档...${NC}"
node ./scripts/generate-api-docs.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ API文档生成成功${NC}"
  cp ./api-documentation.md ./docs/api/
else
  echo -e "${RED}✗ API文档生成失败${NC}"
fi

# 生成Swagger文档
echo -e "${YELLOW}[3/4] 正在生成Swagger文档...${NC}"
node ./scripts/generate-swagger-docs.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Swagger文档生成成功${NC}"
  cp ./swagger.json ./docs/api/
else
  echo -e "${RED}✗ Swagger文档生成失败${NC}"
fi

# 生成API覆盖率报告
echo -e "${YELLOW}[4/4] 正在生成API测试覆盖率报告...${NC}"
node ./scripts/compare-real-test-apis.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ API测试覆盖率报告生成成功${NC}"
  cp ./api-coverage-report.md ./docs/api/
else
  echo -e "${RED}✗ API测试覆盖率报告生成失败${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "     API文档生成完成"
echo "===========================================${NC}"
echo ""
echo "文档已保存到以下位置:"
echo "- API统计报告: ./docs/api/api-statistics.md"
echo "- API文档: ./docs/api/api-documentation.md"
echo "- Swagger文档: ./docs/api/swagger.json"
echo "- API测试覆盖率报告: ./docs/api/api-coverage-report.md"
echo ""

# 添加可执行权限
chmod +x generate-api-docs.sh 