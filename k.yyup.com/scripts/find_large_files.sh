#!/bin/bash

# 项目大文件查找脚本
# 查找项目中超过指定大小的文件

DEFAULT_SIZE=100  # 默认100MB
SIZE=${1:-$DEFAULT_SIZE}
PROJECT_ROOT=$(pwd)

echo "🔍 在 $PROJECT_ROOT 中查找超过 ${SIZE}MB 的大文件..."
echo "=================================================="

# 查找大文件，排除常见的可忽略目录
find "$PROJECT_ROOT" -type f \
    -not -path "*/.git/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/.npm/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/__pycache__/*" \
    -not -path "*/coverage/*" \
    -not -path "*/.cache/*" \
    -size +${SIZE}M \
    -exec ls -lh {} \; | \
    awk '{
        size=$5
        path=$9
        gsub(/^.\//, "", path)  # 移除开头的 ./

        # 转换为MB
        if (size ~ /K$/) {
            size_mb = substr(size, 1, length(size)-1) / 1024
        } else if (size ~ /M$/) {
            size_mb = substr(size, 1, length(size)-1)
        } else if (size ~ /G$/) {
            size_mb = substr(size, 1, length(size)-1) * 1024
        } else {
            size_mb = size / 1024 / 1024
        }

        printf "%8.1f MB  %s\n", size_mb, path
    }' | \
    sort -nr | \
    head -20

echo ""
echo "✅ 查找完成！"

# 统计信息
TOTAL_COUNT=$(find "$PROJECT_ROOT" -type f \
    -not -path "*/.git/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/.npm/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/__pycache__/*" \
    -not -path "*/coverage/*" \
    -not -path "*/.cache/*" \
    -size +${SIZE}M | wc -l)

TOTAL_SIZE=$(find "$PROJECT_ROOT" -type f \
    -not -path "*/.git/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/.npm/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/__pycache__/*" \
    -not -path "*/coverage/*" \
    -not -path "*/.cache/*" \
    -size +${SIZE}M -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)

echo "📊 统计信息:"
echo "   • 文件数量: $TOTAL_COUNT"
echo "   • 总大小: $TOTAL_SIZE"