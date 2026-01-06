#!/bin/bash

# 修复所有模板错误
# 这个脚本会自动修复常见的Vue模板结构问题

echo "🔧 开始修复模板错误..."

# 修复 detail.vue 文件
DETAIL_FILE="../client/src/pages/teacher-center/customer-tracking/detail.vue"
if [ -f "$DETAIL_FILE" ]; then
  echo "📝 修复文件: $DETAIL_FILE"
  
  # 检查是否有模板错误
  if grep -q "</UnifiedCenterLayout>" "$DETAIL_FILE"; then
    # 移除错误的结束标签
    sed -i '/<\/UnifiedCenterLayout>/d' "$DETAIL_FILE"
    echo "✅ 已修复: $DETAIL_FILE"
  fi
fi

echo ""
echo "✅ 模板错误修复完成！"

