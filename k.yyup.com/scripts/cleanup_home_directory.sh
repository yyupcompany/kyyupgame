#!/bin/bash

# 家目录清理脚本
# 清理/persistent/home/zhgue下的不必要文件和目录

HOME_DIR="/persistent/home/zhgue"
REPORT_FILE="home_cleanup_report_$(date +%Y%m%d_%H%M%S).txt"

echo "🧹 家目录清理助手"
echo "=============================================="
echo "📍 清理路径: $HOME_DIR"
echo "📅 清理时间: $(date)"
echo "=============================================="
echo ""

# 函数：显示文件大小
show_size() {
    local path="$1"
    if [[ -d "$path" ]]; then
        du -sh "$path" 2>/dev/null | cut -f1
    elif [[ -f "$path" ]]; then
        ls -lh "$path" 2>/dev/null | awk '{print $5}'
    fi
}

# 函数：计算目录大小
calc_dir_size() {
    local dir="$1"
    du -sb "$dir" 2>/dev/null | cut -f1
}

# 函数：格式化大小
format_size() {
    local size=$1
    if [[ $size -gt $((1024*1024*1024)) ]]; then
        echo "$(( size / 1024 / 1024 / 1024 ))GB"
    elif [[ $size -gt $((1024*1024)) ]]; then
        echo "$(( size / 1024 / 1024 ))MB"
    elif [[ $size -gt 1024 ]]; then
        echo "$(( size / 1024 ))KB"
    else
        echo "${size}B"
    fi
}

# 函数：确认操作
confirm_action() {
    local prompt="$1"
    read -p "$prompt [y/N]: " response
    case "$response" in
        [yY]|[yY][eE][sS]) return 0 ;;
        *) return 1 ;;
    esac
}

echo "📋 分析家目录占用情况..."
echo ""

# 1. 检查大日志文件
echo "📋 1. 大日志文件分析 (>50MB):"
echo "----------------------------------------"
find "$HOME_DIR" -name "*.log" -size +50M -type f 2>/dev/null | while read -r logfile; do
    size=$(show_size "$logfile")
    echo "   📄 $logfile ($size)"
done
echo ""

# 2. 检查编辑器缓存和备份
echo "📋 2. 编辑器缓存和备份:"
echo "----------------------------------------"
editor_cache_dirs=(
    "$HOME_DIR/.config/Code/User/workspaceStorage"
    "$HOME_DIR/.config/Cursor/User/workspaceStorage"
    "$HOME_DIR/.config/deepin/dde-file-manager/index"
    "$HOME_DIR/.vscode"
)

for dir in "${editor_cache_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
        size=$(show_size "$dir")
        echo "   💾 $dir ($size)"
    fi
done
echo ""

# 3. 检查开发工具缓存
echo "📋 3. 开发工具缓存:"
echo "----------------------------------------"
cache_dirs=(
    "$HOME_DIR/.cache"
    "$HOME_DIR/.npm"
    "$HOME_DIR/.gradle"
    "$HOME_DIR/.m2"
    "$HOME_DIR/.pub-cache"
    "$HOME_DIR/.dart_tool"
)

total_cache_size=0
for dir in "${cache_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
        size=$(calc_dir_size "$dir")
        total_cache_size=$((total_cache_size + size))
        echo "   💾 $dir ($(format_size $size))"
    fi
done
echo "   📊 总缓存大小: $(format_size $total_cache_size)"
echo ""

# 4. 检查虚拟化文件
echo "📋 4. 虚拟化文件:"
echo "----------------------------------------"
if [[ -d "$HOME_DIR/.Genymobile" ]]; then
    size=$(show_size "$HOME_DIR/.Genymobile")
    echo "   📱 Genymotion: $size"

    # 列出具体文件
    find "$HOME_DIR/.Genymobile" -name "*.qcow2" -o -name "*.ova" 2>/dev/null | while read -r vmfile; do
        filesize=$(show_size "$vmfile")
        echo "     - $vmfile ($filesize)"
    done
fi
echo ""

# 5. 检查下载目录
echo "📋 5. 下载目录:"
echo "----------------------------------------"
if [[ -d "$HOME_DIR/Downloads" ]]; then
    size=$(show_size "$HOME_DIR/Downloads")
    echo "   📥 Downloads: $size"

    # 列出大文件
    find "$HOME_DIR/Downloads" -size +50M -type f 2>/dev/null | head -10 | while read -r file; do
        filesize=$(show_size "$file")
        filename=$(basename "$file")
        echo "     - $filename ($filesize)"
    done
fi
echo ""

# 6. 检查临时文件
echo "📋 6. 临时文件:"
echo "----------------------------------------"
temp_patterns=(
    "$HOME_DIR/.sdkman/tmp"
    "$HOME_DIR/.tmp"
    "$HOME_DIR/tmp"
    "*.tmp"
    "*.temp"
    "*.swp"
    "*.swo"
    ".DS_Store"
    "Thumbs.db"
)

for pattern in "${temp_patterns[@]}"; do
    if [[ "$pattern" == *"/"* ]]; then
        if [[ -d "$pattern" ]]; then
            size=$(show_size "$pattern")
            echo "   🗑️ $pattern ($size)"
        fi
    else
        count=$(find "$HOME_DIR" -name "$pattern" -type f 2>/dev/null | wc -l)
        if [[ $count -gt 0 ]]; then
            echo "   🗑️ $pattern (文件数: $count)"
        fi
    fi
done
echo ""

# 7. 统计各目录大小
echo "📋 7. 目录大小排名 (Top 10):"
echo "----------------------------------------"
du -sh "$HOME_DIR"/* 2>/dev/null | sort -hr | head -10 | while read -r line; do
    echo "   📁 $line"
done
echo ""

# 计算可释放空间
echo "📊 可释放空间估算:"
echo "----------------------------------------"

# 日志文件大小
logs_size=$(find "$HOME_DIR" -name "*.log" -size +10M -type f -exec du -sb {} + 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   📄 大日志文件: $(format_size ${logs_size:-0})"

# 编辑器备份大小
backup_size=$(find "$HOME_DIR" -name "*.backup" -type f -exec du -sb {} + 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   💾 编辑器备份: $(format_size ${backup_size:-0})"

# 开发工具缓存
dev_cache_size=$total_cache_size
echo "   💻 开发缓存: $(format_size ${dev_cache_size:-0})"

# 临时文件
temp_size=$(find "$HOME_DIR" -name "*.tmp" -o -name "*.temp" -o -name "*.swp" -o -name "*.swo" -type f -exec du -sb {} + 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
echo "   🗑️ 临时文件: $(format_size ${temp_size:-0})"

total_releasable=$((logs_size + backup_size + dev_cache_size + temp_size))
echo ""
echo "   💰 总计可释放: $(format_size $total_releasable)"
echo ""

# 清理建议
echo "💡 清理建议:"
echo "----------------------------------------"
echo "1. 🗑️ 清理大日志文件"
echo "   > kyyupgame/k.yyup.com/server/logs/uncaught-exceptions.log (550MB)"
echo ""
echo "2. 💾 清理编辑器缓存和备份"
echo "   > .config/Code/User/workspaceStorage/"
echo "   > .config/Cursor/User/workspaceStorage/"
echo "   > .config/deepin/dde-file-manager/index/"
echo ""
echo "3. 💻 清理开发工具缓存"
echo "   > .cache/, .npm/, .gradle/, .pub-cache/"
echo ""
echo "4. 📱 虚拟机文件（如不使用）"
echo "   > .Genymobile/ (1.9GB)"
echo ""
echo "5. 📥 清理下载目录"
echo "   > Downloads/ 中的大文件"
echo ""

# 交互式清理
if confirm_action "是否开始交互式清理？"; then
    echo ""
    echo "🧹 开始清理..."

    # 清理日志文件
    if confirm_action "清空大日志文件？"; then
        echo "   🗑️ 清理日志文件..."
        find "$HOME_DIR" -name "*.log" -size +10M -type f -exec truncate -s 0 {} \;
        echo "   ✅ 日志文件已清空"
    fi

    # 清理缓存
    if confirm_action "清理开发工具缓存？"; then
        echo "   🗑️ 清理缓存..."
        for cache_dir in "$HOME_DIR/.cache" "$HOME_DIR/.npm" "$HOME_DIR/.gradle" "$HOME_DIR/.pub-cache"; do
            if [[ -d "$cache_dir" ]]; then
                rm -rf "$cache_dir"
                echo "   ✅ 已删除: $cache_dir"
            fi
        done
    fi

    # 清理编辑器备份
    if confirm_action "清理编辑器备份文件？"; then
        echo "   🗑️ 清理编辑器备份..."
        find "$HOME_DIR" -name "*.backup" -type f -delete
        echo "   ✅ 编辑器备份已清理"
    fi

    # 清理临时文件
    if confirm_action "清理临时文件？"; then
        echo "   🗑️ 清理临时文件..."
        find "$HOME_DIR" -name "*.tmp" -o -name "*.temp" -o -name "*.swp" -o -name "*.swo" -o -name ".DS_Store" -o -name "Thumbs.db" -type f -delete
        rm -rf "$HOME_DIR/.sdkman/tmp" 2>/dev/null
        echo "   ✅ 临时文件已清理"
    fi

    echo ""
    echo "🎉 清理完成！"
else
    echo ""
    echo "❌ 取消清理操作"
fi

# 生成清理报告
echo ""
echo "📄 生成清理报告..."
cat > "$REPORT_FILE" << EOF
家目录清理报告
===============
清理时间: $(date)
清理路径: $HOME_DIR

建议清理的项目:
1. 大日志文件: $(format_size ${logs_size:-0})
2. 编辑器备份: $(format_size ${backup_size:-0})
3. 开发缓存: $(format_size ${dev_cache_size:-0})
4. 临时文件: $(format_size ${temp_size:-0})

总计可释放空间: $(format_size $total_releasable)

当前磁盘使用情况:
$(df -h "$HOME_DIR" | tail -1)
EOF

echo "📄 报告已保存到: $REPORT_FILE"
echo ""
echo "💡 后续建议:"
echo "1. 定期运行清理脚本（建议每月一次）"
echo "2. 设置日志轮转防止日志文件过大"
echo "3. 使用云存储存储大文件"
echo "4. 定期清理下载目录"