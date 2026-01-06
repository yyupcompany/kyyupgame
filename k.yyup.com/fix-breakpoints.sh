#!/bin/bash
# 批量修复PC端硬编码断点脚本
# 将硬编码断点替换为design-tokens变量

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始批量修复PC端硬编码断点...${NC}"

# 定义目录
TARGET_DIR="${1:-./client/src}"

# 统计函数
count_before() {
  grep -r "@media.*max-width.*[0-9]\+px" "$TARGET_DIR" --include="*.vue" --include="*.scss" | wc -l
}

# 显示修复前的数量
BEFORE_COUNT=$(count_before)
echo -e "修复前硬编码断点数量: ${YELLOW}$BEFORE_COUNT${NC}"

# 批量替换断点
echo "正在替换断点..."

# 1280px -> breakpoint-xl
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/@media (max-width: 1280px)/@media (max-width: var(--breakpoint-xl))/g' {} \;

# 1024px -> breakpoint-lg
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/@media (max-width: 1024px)/@media (max-width: var(--breakpoint-lg))/g' {} \;

# 768px -> breakpoint-md
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/@media (max-width: 768px)/@media (max-width: var(--breakpoint-md))/g' {} \;

# 640px -> breakpoint-sm
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/@media (max-width: 640px)/@media (max-width: var(--breakpoint-sm))/g' {} \;

# 480px -> breakpoint-xs
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/@media (max-width: 480px)/@media (max-width: var(--breakpoint-xs))/g' {} \;

# 处理带空格的变体
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/@media(max-width:/@media (max-width:/g' {} \;

# 显示修复后的数量
AFTER_COUNT=$(count_before)
echo -e "修复后硬编码断点数量: ${YELLOW}$AFTER_COUNT${NC}"

# 计算修复数量
FIXED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))
echo -e "${GREEN}✅ 成功修复 $FIXED_COUNT 处硬编码断点！${NC}"

# 显示剩余未修复的断点（如果有的话）
if [ $AFTER_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️  仍有 $AFTER_COUNT 处未修复的断点（可能是非标准值）${NC}"
  echo "以下是一些示例："
  grep -r "@media.*max-width.*[0-9]\+px" "$TARGET_DIR" --include="*.vue" --include="*.scss" | head -10 || true
fi
