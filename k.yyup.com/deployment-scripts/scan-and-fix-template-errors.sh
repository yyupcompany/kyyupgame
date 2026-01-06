#!/bin/bash

# 扫描并修复所有模板错误
# 这个脚本会查找所有Vue文件中的模板结构问题

echo "🔧 开始扫描和修复模板错误..."

# 查找所有Vue文件
VUE_FILES=$(find ../client/src -name "*.vue" -type f)

for FILE in $VUE_FILES; do
  # 检查是否有 </UnifiedCenterLayout> 在错误的位置
  if grep -q "</UnifiedCenterLayout>" "$FILE"; then
    # 检查是否在 </template> 之前
    LAYOUT_LINE=$(grep -n "</UnifiedCenterLayout>" "$FILE" | head -1 | cut -d: -f1)
    TEMPLATE_LINE=$(grep -n "</template>" "$FILE" | head -1 | cut -d: -f1)
    
    if [ ! -z "$LAYOUT_LINE" ] && [ ! -z "$TEMPLATE_LINE" ] && [ "$LAYOUT_LINE" -lt "$TEMPLATE_LINE" ]; then
      echo "📝 修复文件: $FILE (第 $LAYOUT_LINE 行)"
      
      # 移除错误位置的 </UnifiedCenterLayout>
      sed -i "${LAYOUT_LINE}d" "$FILE"
      
      # 在 </template> 之前添加 </UnifiedCenterLayout>
      TEMPLATE_LINE=$((TEMPLATE_LINE - 1))
      sed -i "${TEMPLATE_LINE}i\\  </UnifiedCenterLayout>" "$FILE"
      
      echo "✅ 已修复: $FILE"
    fi
  fi
done

echo ""
echo "✅ 模板错误扫描和修复完成！"

