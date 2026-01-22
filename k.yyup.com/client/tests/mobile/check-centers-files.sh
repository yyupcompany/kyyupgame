#!/bin/bash

# 检查 centers 路由中缺失的文件

PROJECT_ROOT="/home/zhgue/kyyupgame/k.yyup.com"
CENTERS_DIR="${PROJECT_ROOT}/client/src/pages/mobile/centers"
ROUTES_FILE="${PROJECT_ROOT}/client/src/router/mobile/centers-routes.ts"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   Centers 路由文件检查工具"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 检查路由文件中引用的所有组件
echo -e "${BLUE}分析路由文件...${NC}"
echo ""

# 提取所有 import 路径
imports=$(grep -o "import(['\"]@/pages/mobile/centers/[^'\"]*['\"])" "${ROUTES_FILE}" | sort -u)

# 统计
total_components=0
missing_components=0
found_components=0

# 检查每个导入的组件
echo -e "${BLUE}检查组件文件...${NC}"
echo ""

# 创建一个临时列表
IMPORT_LIST=$(mktemp)
echo "$imports" > "$IMPORT_LIST"

while IFS= read -r import_line; do
  # 提取路径
  import_path=$(echo "$import_line" | sed -n "s/import('\(.*\)')/\1/p" | sed "s/import(\"\(.*\)\")/\1/p" | sed "s/@\/pages\/mobile\/centers/\/home\/zhgue\/kyyupgame\/k.yyup.com\/client\/src\/pages\/mobile\/centers/")

  # 转换路径
  file_path="${import_path//\.vue/}.vue"

  total_components=$((total_components + 1))

  if [ -f "$file_path" ]; then
    echo -e "${GREEN}✓${NC} 存在: ${import_path}"
    found_components=$((found_components + 1))
  else
    echo -e "${RED}✗${NC} 缺失: ${import_path}"
    missing_components=$((missing_components + 1))

    # 提取目录名
    dir_path=$(dirname "$file_path")
    center_name=$(basename "$dir_path")

    # 添加到缺失列表
    echo "$center_name:$import_path" >> /tmp/missing-centers.txt
  fi
done < "$IMPORT_LIST"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${BLUE}检查结果总结${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "总组件数: $total_components"
echo -e "找到: ${GREEN}$found_components${NC}"
echo -e "缺失: ${RED}$missing_components${NC}"
echo ""

# 按中心统计
echo -e "${BLUE}按中心统计:${NC}"
echo ""

# 检查实际目录
if [ -d "$CENTERS_DIR" ]; then
  cd "$CENTERS_DIR"

  for center in */; do
    center_name=${center%/}
    index_file="${center}index.vue"

    if [ -f "$index_file" ]; then
      echo -e "${GREEN}✓${NC} $center_name (index.vue 存在)"
    else
      echo -e "${RED}✗${NC} $center_name (index.vue 缺失)"

      # 添加到缺失列表
      echo "$center_name:index" >> /tmp/missing-centers-index.txt
    fi
  done
fi

echo ""

# 检查是否有缺失文件
if [ $missing_components -gt 0 ] || [ -f /tmp/missing-centers-index.txt ]; then
  echo -e "${YELLOW}⚠  发现缺失文件，建议运行修复脚本${NC}"
  echo ""
  echo "手动修复命令:"
  echo "  cd ${PROJECT_ROOT}/client/src/pages/mobile/centers"
  echo "  # 为缺失的中心创建 index.vue 文件"
  echo ""
else
  echo -e "${GREEN}✓ 所有组件文件都存在${NC}"
fi

# 清理临时文件
rm -f "$IMPORT_LIST"

echo ""
