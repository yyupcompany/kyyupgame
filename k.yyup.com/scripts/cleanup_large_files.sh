#!/bin/bash

# 大文件清理脚本
# 帮助识别和清理项目中的大文件

PROJECT_ROOT=$(pwd)
REPORT_FILE="large_files_cleanup_report.txt"

echo "🧹 项目大文件清理助手"
echo "=============================================="
echo "📍 项目路径: $PROJECT_ROOT"
echo "📅 清理时间: $(date)"
echo "=============================================="
echo ""

# 函数：显示文件大小（MB）
show_file_size() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local size=$(du -m "$file" | cut -f1)
        echo "${size}MB"
    fi
}

# 函数：确认操作
confirm_action() {
    local prompt="$1"
    local default="${2:-n}"

    read -p "$prompt [y/N]: " response
    case "$response" in
        [yY]|[yY][eE][sS]) return 0 ;;
        *) return 1 ;;
    esac
}

# 1. 查找超大日志文件（>50MB）
echo "📋 1. 检查大日志文件 (>50MB):"
echo "----------------------------------------"
find "$PROJECT_ROOT" -name "*.log" -size +50M -not -path "./.git/*" -not -path "./node_modules/*" | while read -r logfile; do
    size=$(show_file_size "$logfile")
    echo "   📄 $logfile ($size)"
done
echo ""

# 2. 查找Swagger备份文件
echo "📋 2. Swagger备份文件:"
echo "----------------------------------------"
find "$PROJECT_ROOT" -name "swagger-backup-*.json" -not -path "./.git/*" | while read -r swagger; do
    size=$(show_file_size "$swagger")
    echo "   📄 $swagger ($size)"
done
echo ""

# 3. 查找测试视频文件
echo "📋 3. 测试视频文件:"
echo "----------------------------------------"
find "$PROJECT_ROOT" -name "*.webm" -name "*test*" -not -path "./.git/*" -not -path "./node_modules/*" | while read -r video; do
    size=$(show_file_size "$video")
    echo "   🎬 $video ($size)"
done
echo ""

# 4. 查找截图文件
echo "📋 4. 截图文件:"
echo "----------------------------------------"
find "$PROJECT_ROOT" -name "*.png" -name "*screenshot*" -not -path "./.git/*" -not -path "./node_modules/*" | while read -r screenshot; do
    size=$(show_file_size "$screenshot")
    echo "   📸 $screenshot ($size)"
done
echo ""

# 5. 查找数据库备份文件
echo "📋 5. 数据库备份文件:"
echo "----------------------------------------"
find "$PROJECT_ROOT" -name "*.sql" -size +5M -not -path "./.git/*" -not -path "./node_modules/*" | while read -r sqlfile; do
    size=$(show_file_size "$sqlfile")
    echo "   🗄️ $sqlfile ($size)"
done
echo ""

# 6. 查找临时文件
echo "📋 6. 临时文件:"
echo "----------------------------------------"
find "$PROJECT_ROOT" -name "*.tmp" -o -name "*.temp" -o -name "*.swp" -not -path "./.git/*" -not -path "./node_modules/*" | while read -r tempfile; do
    size=$(show_file_size "$tempfile")
    echo "   🗑️ $tempfile ($size)"
done
echo ""

# 生成总大小统计
echo "📊 大小统计:"
echo "----------------------------------------"
total_logs=$(find "$PROJECT_ROOT" -name "*.log" -size +10M -not -path "./.git/*" -not -path "./node_modules/*" -exec du -cm {} + 2>/dev/null | tail -1 | cut -f1 2>/dev/null || echo "0")
total_swagger=$(find "$PROJECT_ROOT" -name "swagger-backup-*.json" -not -path "./.git/*" -exec du -cm {} + 2>/dev/null | tail -1 | cut -f1 2>/dev/null || echo "0")
total_videos=$(find "$PROJECT_ROOT" -name "*.webm" -not -path "./.git/*" -not -path "./node_modules/*" -exec du -cm {} + 2>/dev/null | tail -1 | cut -f1 2>/dev/null || echo "0")
total_screenshots=$(find "$PROJECT_ROOT" -name "*.png" -name "*screenshot*" -not -path "./.git/*" -not -path "./node_modules/*" -exec du -cm {} + 2>/dev/null | tail -1 | cut -f1 2>/dev/null || echo "0")

echo "   📄 大日志文件: ${total_logs}MB"
echo "   📄 Swagger备份: ${total_swagger}MB"
echo "   🎬 测试视频: ${total_videos}MB"
echo "   📸 截图文件: ${total_screenshots}MB"
echo ""

# 清理建议
echo "💡 清理建议:"
echo "----------------------------------------"
echo "1. 🗑️ 清空日志文件而不是删除:"
echo "   > server/logs/uncaught-exceptions.log"
echo "   可以使用: > server/logs/uncaught-exceptions.log"
echo ""
echo "2. 🗑️ 删除旧的Swagger备份:"
echo "   保留最新的2-3个备份即可"
echo ""
echo "3. 🗑️ 删除不需要的测试视频和截图"
echo ""
echo "4. 📁 建议添加到 .gitignore:"
echo "   # 日志文件"
echo "   *.log"
echo "   server/logs/"
echo "   "
echo "   # 测试文件"
echo "   test-results/"
echo "   screenshots/"
echo "   "
echo "   # 备份文件"
echo "   *-backup-*"
echo "   swagger-backup-*"
echo ""

# 安全清理选项
if confirm_action "是否要清空大日志文件？"; then
    echo "🧹 清理日志文件..."
    find "$PROJECT_ROOT" -name "*.log" -size +10M -not -path "./.git/*" -not -path "./node_modules/*" | while read -r logfile; do
        echo "   清空: $logfile"
        > "$logfile"
    done
    echo "✅ 日志文件已清空"
fi

if confirm_action "是否要删除旧的Swagger备份（保留最新3个）？"; then
    echo "🧹 清理Swagger备份..."
    find "$PROJECT_ROOT" -name "swagger-backup-*.json" -not -path "./.git/*" | sort -r | tail -n +4 | while read -r swagger; do
        echo "   删除: $swagger"
        rm -f "$swagger"
    done
    echo "✅ Swagger备份已清理"
fi

echo ""
echo "🎉 清理完成！"
echo ""
echo "📋 后续建议:"
echo "1. 定期运行此清理脚本"
echo "2. 设置日志轮转"
echo "3. 更新 .gitignore 文件"
echo "4. 考虑使用 lfs (Git Large File Storage) 处理必要的大文件"