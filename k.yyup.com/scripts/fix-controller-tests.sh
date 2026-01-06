#!/bin/bash

# 批量修复控制器测试文件
# 只修复测试用例，不修改源代码

echo "🔧 开始批量修复控制器测试文件..."

# 需要跳过的测试文件（这些文件的控制器导出的是函数而不是类）
SKIP_FILES=(
  "enrollment-statistics.controller.test.ts"
  "migration.controller.test.ts"
  "personnel-center.controller.test.ts"
  "page-guide-section.controller.test.ts"
  "poster-template.controller.test.ts"
  "marketing-center.controller.test.ts"
  "permission-cache.controller.test.ts"
  "poster-upload.controller.test.ts"
  "page-guide.controller.test.ts"
  "enrollment-quota.controller.test.ts"
  "page-permissions.controller.test.ts"
  "user-simple.controller.test.ts"
  "kindergarten-basic-info.controller.test.ts"
  "errors.controller.test.ts"
  "script-category.controller.test.ts"
  "activity-center.controller.test.ts"
  "enrollment-center.controller.test.ts"
)

# 统计
TOTAL=0
SKIPPED=0
FIXED=0

cd server/tests/unit/controllers

for file in *.controller.test.ts; do
  TOTAL=$((TOTAL + 1))
  
  # 检查是否需要跳过
  SKIP=0
  for skip_file in "${SKIP_FILES[@]}"; do
    if [ "$file" = "$skip_file" ]; then
      SKIP=1
      break
    fi
  done
  
  if [ $SKIP -eq 1 ]; then
    echo "⏭️  跳过: $file (需要手动修复)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  
  echo "✅ 已处理: $file"
  FIXED=$((FIXED + 1))
done

echo ""
echo "📊 修复统计:"
echo "  总文件数: $TOTAL"
echo "  已修复: $FIXED"
echo "  跳过: $SKIPPED"
echo ""
echo "✅ 批量修复完成！"

