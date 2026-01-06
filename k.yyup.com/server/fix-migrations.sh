#!/bin/bash

# 修复所有迁移文件中的重复索引问题
find src/migrations -name "*.js" -type f | while read file; do
  # 检查文件是否包含 addIndex 和 Duplicate index name 的错误处理
  if grep -q "addIndex" "$file" && ! grep -q "Duplicate key name" "$file"; then
    echo "修复: $file"
    # 替换错误处理
    sed -i "s/if (error\.message\.includes('Duplicate index name'))/if (error.message \&\& (error.message.includes('Duplicate key name') || error.message.includes('Duplicate index name')))/g" "$file"
  fi
done

echo "✅ 迁移文件修复完成"
