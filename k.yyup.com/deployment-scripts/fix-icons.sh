#!/bin/bash

# 修复所有不存在的Element Plus图标
# 这个脚本会自动替换所有不存在的图标为可用的替代品

echo "🔧 开始修复Element Plus图标问题..."

# 定义图标映射（不存在的图标 -> 替代图标）
declare -A ICON_MAP=(
    ["QrCode"]="DocumentCopy"
    ["Lightbulb"]="Star"
    ["Scan"]="DocumentCopy"
)

# 获取所有Vue和TS文件
FILES=$(find ../client/src -type f \( -name "*.vue" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null)

FIXED_COUNT=0

for FILE in $FILES; do
    MODIFIED=false
    
    for INVALID_ICON in "${!ICON_MAP[@]}"; do
        REPLACEMENT_ICON="${ICON_MAP[$INVALID_ICON]}"
        
        # 检查文件是否包含无效的图标
        if grep -q "$INVALID_ICON" "$FILE"; then
            echo "📝 修复文件: $FILE"
            echo "   替换: $INVALID_ICON -> $REPLACEMENT_ICON"
            
            # 替换导入语句中的图标
            sed -i "s/\b$INVALID_ICON\b/$REPLACEMENT_ICON/g" "$FILE"
            
            # 替换模板中的图标使用
            sed -i "s/<$INVALID_ICON \/>/<$REPLACEMENT_ICON \/>/g" "$FILE"
            sed -i "s/<$INVALID_ICON>/<$REPLACEMENT_ICON>/g" "$FILE"
            sed -i "s/<\/$INVALID_ICON>/<\/$REPLACEMENT_ICON>/g" "$FILE"
            
            MODIFIED=true
            FIXED_COUNT=$((FIXED_COUNT + 1))
        fi
    done
    
    if [ "$MODIFIED" = true ]; then
        echo "✅ 已修复: $FILE"
    fi
done

echo ""
echo "✅ 图标修复完成！"
echo "📊 修复了 $FIXED_COUNT 个文件"
echo ""

