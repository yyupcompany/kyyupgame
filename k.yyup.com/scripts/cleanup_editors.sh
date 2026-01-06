#!/bin/bash

# 编辑器配置清理脚本
# 安全清理VS Code和Cursor的缓存和临时文件，保留用户设置

CODE_CONFIG="/persistent/home/zhgue/.config/Code"
CURSOR_CONFIG="/persistent/home/zhgue/.config/Cursor"

echo "🧹 编辑器配置清理脚本"
echo "=============================================="
echo "📅 清理时间: $(date)"
echo ""

# 函数：显示目录大小
show_size() {
    local path="$1"
    if [[ -d "$path" ]]; then
        du -sh "$path" 2>/dev/null | cut -f1
    else
        echo "不存在"
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

echo "📊 当前编辑器配置大小:"
echo "   VS Code: $(show_size "$CODE_CONFIG")"
echo "   Cursor:  $(show_size "$CURSOR_CONFIG")"
echo ""

# 检查编辑器是否在运行
echo "🔍 检查编辑器运行状态..."
code_running=false
cursor_running=false

if pgrep -f "code" > /dev/null; then
    code_running=true
    echo "   ⚠️  VS Code 正在运行"
fi

if pgrep -f "cursor" > /dev/null; then
    cursor_running=true
    echo "   ⚠️  Cursor 正在运行"
fi

if [[ "$code_running" == true || "$cursor_running" == true ]]; then
    echo ""
    echo "⚠️  建议先关闭编辑器以避免数据损坏"
    if ! confirm_action "是否继续清理？"; then
        echo "❌ 取消清理操作"
        exit 0
    fi
fi

echo ""
echo "📋 将清理以下内容："
echo "=============================================="

# VS Code清理项
echo "🔧 VS Code 清理项:"
vs_code_clean_items=(
    "$CODE_CONFIG/logs"
    "$CODE_CONFIG/Cache"
    "$CODE_CONFIG/Code Cache"
    "$CODE_CONFIG/GPUCache"
    "$CODE_CONFIG/DawnGraphiteCache"
    "$CODE_CONFIG/DawnWebGPUCache"
    "$CODE_CONFIG/Service Worker"
    "$CODE_CONFIG/WebStorage"
    "$CODE_CONFIG/User/workspaceStorage"
    "$CODE_CONFIG/CachedData"
    "$CODE_CONFIG/CachedConfigurations"
    "$CODE_CONFIG/CachedExtensionVSIXs"
    "$CODE_CONFIG/CachedProfilesData"
    "$CODE_CONFIG/blob_storage"
)

for item in "${vs_code_clean_items[@]}"; do
    if [[ -e "$item" ]]; then
        size=$(show_size "$item")
        echo "   🗑️  $(basename "$item") ($size)"
    fi
done

echo ""
echo "🔧 Cursor 清理项:"
cursor_clean_items=(
    "$CURSOR_CONFIG/logs"
    "$CURSOR_CONFIG/Cache"
    "$CURSOR_CONFIG/Code Cache"
    "$CURSOR_CONFIG/GPUCache"
    "$CURSOR_CONFIG/DawnGraphiteCache"
    "$CURSOR_CONFIG/DawnWebGPUCache"
    "$CURSOR_CONFIG/Service Worker"
    "$CURSOR_CONFIG/WebStorage"
    "$CURSOR_CONFIG/User/workspaceStorage"
    "$CURSOR_CONFIG/CachedData"
    "$CURSOR_CONFIG/CachedConfigurations"
    "$CURSOR_CONFIG/CachedExtensionVSIXs"
    "$CURSOR_CONFIG/CachedProfilesData"
    "$CURSOR_CONFIG/blob_storage"
    "$CURSOR_CONFIG/sentry"
)

for item in "${cursor_clean_items[@]}"; do
    if [[ -e "$item" ]]; then
        size=$(show_size "$item")
        echo "   🗑️  $(basename "$item") ($size)"
    fi
done

echo ""
echo "✅ 将保留以下重要配置:"
echo "   • 用户设置 (User/settings.json)"
echo "   • 键盘快捷键 (User/keybindings.json)"
echo "   • 扩展配置"
echo "   • 用户片段和主题"
echo ""

# 开始清理
if confirm_action "是否开始清理？"; then
    echo ""
    echo "🧹 开始清理..."

    # 清理VS Code
    echo ""
    echo "🔧 清理 VS Code..."
    for item in "${vs_code_clean_items[@]}"; do
        if [[ -e "$item" ]]; then
            echo "   🗑️  删除: $item"
            rm -rf "$item"
        fi
    done

    # 清理Cursor
    echo ""
    echo "🔧 清理 Cursor..."
    for item in "${cursor_clean_items[@]}"; do
        if [[ -e "$item" ]]; then
            echo "   🗑️  删除: $item"
            rm -rf "$item"
        fi
    done

    # 清理临时文件
    echo ""
    echo "🗑️  清理临时文件..."
    find "$CODE_CONFIG" -name "*.tmp" -o -name "*.log" -o -name "Crashpad/*" -type f -delete 2>/dev/null
    find "$CURSOR_CONFIG" -name "*.tmp" -o -name "*.log" -o -name "Crashpad/*" -type f -delete 2>/dev/null

    echo ""
    echo "✅ 清理完成！"

    # 显示清理结果
    echo ""
    echo "📊 清理后的大小:"
    echo "   VS Code: $(show_size "$CODE_CONFIG")"
    echo "   Cursor:  $(show_size "$CURSOR_CONFIG")"

    # 计算节省的空间
    code_size=$(du -sb "$CODE_CONFIG" 2>/dev/null | cut -f1)
    cursor_size=$(du -sb "$CURSOR_CONFIG" 2>/dev/null | cut -f1)
    total_size=$((code_size + cursor_size))
    total_mb=$((total_size / 1024 / 1024))

    echo "   总计: ${total_mb}MB"

else
    echo ""
    echo "❌ 取消清理操作"
fi

echo ""
echo "💡 后续建议:"
echo "1. 重启编辑器，它们会自动重建必要的缓存"
echo "2. 编辑器首次启动可能稍慢，这是正常的"
echo "3. 扩展可能需要重新加载"
echo "4. 工作区设置会重新同步"
echo ""
echo "⚠️  注意事项:"
echo "• 如果发现某个扩展有问题，可以重新安装"
echo "• 工作区配置可能需要重新设置"
echo "• 某些快捷方式可能需要重新创建"