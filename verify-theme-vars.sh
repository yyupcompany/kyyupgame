#!/bin/bash

# 主题变量验证脚本
# 用于检查项目中是否还有错误的主题变量使用

echo "================================"
echo "主题变量验证工具"
echo "================================"
echo ""

BASE_PATH="/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages"

# 检查 --bg-secondary
echo "1. 检查 --bg-secondary 使用..."
BG_SECONDARY_COUNT=$(grep -r "var(--bg-secondary)" "$BASE_PATH" --include="*.vue" | wc -l)
if [ "$BG_SECONDARY_COUNT" -eq 0 ]; then
    echo "   ✅ 未发现 --bg-secondary 使用"
else
    echo "   ❌ 发现 $BG_SECONDARY_COUNT 处 --bg-secondary 使用"
    grep -rn "var(--bg-secondary)" "$BASE_PATH" --include="*.vue" | head -10
fi

# 检查 --bg-primary (排除 --bg-primary-light)
echo ""
echo "2. 检查 --bg-primary 使用（排除 --bg-primary-light）..."
BG_PRIMARY_COUNT=$(grep -r "var(--bg-primary)" "$BASE_PATH" --include="*.vue" | grep -v "var(--bg-primary-light)" | wc -l)
if [ "$BG_PRIMARY_COUNT" -eq 0 ]; then
    echo "   ✅ 未发现 --bg-primary 使用"
else
    echo "   ❌ 发现 $BG_PRIMARY_COUNT 处 --bg-primary 使用"
    grep -rn "var(--bg-primary)" "$BASE_PATH" --include="*.vue" | grep -v "var(--bg-primary-light)" | head -10
fi

# 检查 --bg-color
echo ""
echo "3. 检查 --bg-color 使用..."
BG_COLOR_COUNT=$(grep -r "var(--bg-color)" "$BASE_PATH" --include="*.vue" | wc -l)
if [ "$BG_COLOR_COUNT" -eq 0 ]; then
    echo "   ✅ 未发现 --bg-color 使用"
else
    echo "   ❌ 发现 $BG_COLOR_COUNT 处 --bg-color 使用"
    grep -rn "var(--bg-color)" "$BASE_PATH" --include="*.vue" | head -10
fi

# 统计总问题数
TOTAL_ISSUES=$((BG_SECONDARY_COUNT + BG_PRIMARY_COUNT + BG_COLOR_COUNT))

echo ""
echo "================================"
echo "验证结果总结"
echo "================================"
echo "总问题数: $TOTAL_ISSUES"

if [ "$TOTAL_ISSUES" -eq 0 ]; then
    echo "✅ 所有主题变量使用正确！"
    exit 0
else
    echo "❌ 发现 $TOTAL_ISSUES 个问题需要修复"
    exit 1
fi
