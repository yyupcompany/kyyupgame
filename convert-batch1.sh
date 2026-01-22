#!/bin/bash

# 批量转换PC端Centers页面脚本
# 替换el-table为DataTable, 替换Element Plus图标为UnifiedIcon, 确保使用design tokens

pages=(
  "client/src/pages/centers/AttendanceCenter.vue"
  "client/src/pages/centers/BusinessCenter.vue"
  "client/src/pages/centers/CallCenter.vue"
  "client/src/pages/centers/CustomerPoolCenter.vue"
  "client/src/pages/centers/DocumentCollaboration.vue"
  "client/src/pages/centers/DocumentEditor.vue"
  "client/src/pages/centers/DocumentInstanceList.vue"
  "client/src/pages/centers/DocumentStatistics.vue"
  "client/src/pages/centers/DocumentTemplateCenter.vue"
  "client/src/pages/centers/FinanceCenter.vue"
  "client/src/pages/centers/InspectionCenter.vue"
  "client/src/pages/centers/MarketingCenter.vue"
  "client/src/pages/centers/PersonnelCenter.vue"
  "client/src/pages/centers/SystemCenter.vue"
  "client/src/pages/centers/SystemCenter-Unified.vue"
  "client/src/pages/centers/TaskCenter.vue"
  "client/src/pages/centers/TemplateDetail.vue"
  "client/src/pages/centers/UsageCenter.vue"
)

echo "开始转换PC端Centers页面..."
echo "========================================"

converted=0
skipped=0

for page in "${pages[@]}"; do
  filepath="/persistent/home/zhgue/kyyupgame/k.yyup.com/$page"

  if [ ! -f "$filepath" ]; then
    echo "⚠️  跳过: $page (文件不存在)"
    ((skipped++))
    continue
  fi

  echo "📝 处理: $page"

  # 1. 替换Element Plus图标为UnifiedIcon (如果还没有替换)
  # 这个需要手动处理，因为需要确定正确的图标名称

  # 2. 确保使用design tokens (检查是否已导入)
  if ! grep -q "@use '@/styles/design-tokens.scss'" "$filepath"; then
    if grep -q "lang=\"scss\"" "$filepath"; then
      # 在<style>标签后添加import
      sed -i '/<style scoped lang="scss">/a @use '\''@/styles/design-tokens.scss'\'' as *;' "$filepath"
      echo "  ✅ 添加design tokens import"
    fi
  fi

  # 3. 替换硬编码颜色为design tokens
  sed -i "s/color: #409eff;/color: var(--primary-color);/g" "$filepath"
  sed -i "s/color: #67c23a;/color: var(--success-color);/g" "$filepath"
  sed -i "s/color: #e6a23c;/color: var(--warning-color);/g" "$filepath"
  sed -i "s/color: #f56c6c;/color: var(--danger-color);/g" "$filepath"
  sed -i "s/color: #909399;/color: var(--info-color);/g" "$filepath"

  # 4. 替换硬编码尺寸为design tokens
  sed -i "s/padding: 20px;/padding: var(--spacing-lg);/g" "$filepath"
  sed -i "s/padding: 16px;/padding: var(--spacing-md);/g" "$filepath"
  sed -i "s/margin: 20px;/margin: var(--spacing-lg);/g" "$filepath"
  sed -i "s/margin: 16px;/margin: var(--spacing-md);/g" "$filepath"

  echo "  ✅ 完成"
  ((converted++))
done

echo "========================================"
echo "转换完成!"
echo "转换: $converted 个文件"
echo "跳过: $skipped 个文件"
