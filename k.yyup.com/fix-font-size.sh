#!/bin/bash
# 批量修复PC端硬编码字体大小脚本
# 将硬编码字体大小替换为design-tokens变量

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}开始批量修复PC端硬编码字体大小...${NC}"

TARGET_DIR="${1:-/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src}"

count_before() {
  grep -r "font-size: [0-9]\+px" "$TARGET_DIR" --include="*.vue" --include="*.scss" | wc -l
}

BEFORE_COUNT=$(count_before)
echo -e "修复前硬编码字体数量: ${YELLOW}$BEFORE_COUNT${NC}"

echo "正在替换字体大小..."

# 12px -> var(--text-xs)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 12px/font-size: var(--text-xs)/g' {} \;

# 13px -> var(--text-sm) (非标准值，映射到sm)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 13px/font-size: var(--text-sm)/g' {} \;

# 14px -> var(--text-sm)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 14px/font-size: var(--text-sm)/g' {} \;

# 15px -> var(--text-base) (非标准值，映射到base)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 15px/font-size: var(--text-base)/g' {} \;

# 16px -> var(--text-base)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 16px/font-size: var(--text-base)/g' {} \;

# 18px -> var(--text-lg)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 18px/font-size: var(--text-lg)/g' {} \;

# 20px -> var(--text-xl)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 20px/font-size: var(--text-xl)/g' {} \;

# 24px -> var(--text-2xl)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 24px/font-size: var(--text-2xl)/g' {} \;

# 28px -> var(--text-3xl) (近似值，30px)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 28px/font-size: var(--text-3xl)/g' {} \;

# 30px -> var(--text-3xl)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 30px/font-size: var(--text-3xl)/g' {} \;

# 32px -> var(--text-4xl) (近似值，36px)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 32px/font-size: var(--text-4xl)/g' {} \;

# 36px -> var(--text-4xl)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 36px/font-size: var(--text-4xl)/g' {} \;

# 48px -> var(--text-5xl)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/font-size: 48px/font-size: var(--text-5xl)/g' {} \;

AFTER_COUNT=$(count_before)
echo -e "修复后硬编码字体数量: ${YELLOW}$AFTER_COUNT${NC}"

FIXED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))
echo -e "${GREEN}✅ 成功修复 $FIXED_COUNT 处硬编码字体大小！${NC}"

# 显示剩余未修复的字体大小（如果有的话）
if [ $AFTER_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️  仍有 $AFTER_COUNT 处未修复的字体大小（可能是非标准值）${NC}"
  echo "以下是一些示例："
  grep -r "font-size: [0-9]\+px" "$TARGET_DIR" --include="*.vue" --include="*.scss" | head -10 || true
fi
