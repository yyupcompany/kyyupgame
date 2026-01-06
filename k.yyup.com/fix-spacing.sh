#!/bin/bash
# 批量修复PC端硬编码间距脚本
# 将硬编码间距替换为design-tokens变量

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}开始批量修复PC端硬编码间距...${NC}"

TARGET_DIR="${1:-/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src}"

count_before() {
  grep -rE "padding: [0-9]+px|margin: [0-9]+px|gap: [0-9]+px" "$TARGET_DIR" --include="*.vue" --include="*.scss" | wc -l
}

BEFORE_COUNT=$(count_before)
echo -e "修复前硬编码间距数量: ${YELLOW}$BEFORE_COUNT${NC}"

echo "正在替换间距..."

# padding: 4px -> var(--spacing-xs)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/padding: 4px/padding: var(--spacing-xs)/g' {} \;

# padding: 8px -> var(--spacing-sm)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/padding: 8px/padding: var(--spacing-sm)/g' {} \;

# padding: 12px -> var(--spacing-md) (近似值，12px接近16px的一半，使用spacing-md)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/padding: 12px/padding: var(--spacing-md)/g' {} \;

# padding: 16px -> var(--spacing-md)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/padding: 16px/padding: var(--spacing-md)/g' {} \;

# padding: 20px -> var(--spacing-lg) (近似值)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/padding: 20px/padding: var(--spacing-lg)/g' {} \;

# padding: 24px -> var(--spacing-lg)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/padding: 24px/padding: var(--spacing-lg)/g' {} \;

# padding: 32px -> var(--spacing-xl)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/padding: 32px/padding: var(--spacing-xl)/g' {} \;

# padding: 48px -> var(--spacing-2xl)
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/padding: 48px/padding: var(--spacing-2xl)/g' {} \;

# margin的替换
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/margin: 4px/margin: var(--spacing-xs)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/margin: 8px/margin: var(--spacing-sm)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/margin: 12px/margin: var(--spacing-md)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/margin: 16px/margin: var(--spacing-md)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/margin: 20px/margin: var(--spacing-lg)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/margin: 24px/margin: var(--spacing-lg)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/margin: 32px/margin: var(--spacing-xl)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/margin: 48px/margin: var(--spacing-2xl)/g' {} \;

# gap的替换
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/gap: 4px/gap: var(--spacing-xs)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/gap: 8px/gap: var(--spacing-sm)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/gap: 12px/gap: var(--spacing-md)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/gap: 16px/gap: var(--spacing-md)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/gap: 20px/gap: var(--spacing-lg)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/gap: 24px/gap: var(--spacing-lg)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/gap: 32px/gap: var(--spacing-xl)/g' {} \;
find "$TARGET_DIR" -type f \( -name "*.vue" -o -name "*.scss" \) -exec sed -i 's/gap: 48px/gap: var(--spacing-2xl)/g' {} \;

AFTER_COUNT=$(count_before)
echo -e "修复后硬编码间距数量: ${YELLOW}$AFTER_COUNT${NC}"

FIXED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))
echo -e "${GREEN}✅ 成功修复 $FIXED_COUNT 处硬编码间距！${NC}"
