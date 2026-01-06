#!/bin/bash

# 安全清理脚本 - 只清理缓存和Android开发环境，保留源码
# 清理目标：缓存文件、Android开发环境
# 保留内容：项目源码、重要配置

HOME_DIR="/persistent/home/zhgue"
PROJECT_DIR="$HOME_DIR/kyyupgame"

echo "🧹 安全缓存清理脚本"
echo "=============================================="
echo "📍 家目录: $HOME_DIR"
echo "📅 清理时间: $(date)"
echo "⚠️  只清理缓存，保留源码和重要配置"
echo "=============================================="
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

# 函数：格式化字节大小
format_bytes() {
    local bytes=$1
    if [[ $bytes -gt $((1024*1024*1024)) ]]; then
        echo "$(( bytes / 1024 / 1024 / 1024 ))GB"
    elif [[ $bytes -gt $((1024*1024)) ]]; then
        echo "$(( bytes / 1024 / 1024 ))MB"
    elif [[ $bytes -gt 1024 ]]; then
        echo "$(( bytes / 1024 ))KB"
    else
        echo "${bytes}B"
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

# 函数：获取目录大小（字节）
get_dir_size() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        du -sb "$dir" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

echo "📊 清理前大小统计:"
echo "----------------------------------------"

# 计算即将清理的项目大小
cache_size=$(get_dir_size "$HOME_DIR/.cache")
npm_size=$(get_dir_size "$HOME_DIR/.npm")
android_size=$(get_dir_size "$HOME_DIR/Android")
genymobile_size=$(get_dir_size "$HOME_DIR/.Genymobile")
gradle_size=$(get_dir_size "$HOME_DIR/.gradle")
pubcache_size=$(get_dir_size "$HOME_DIR/.pub-cache")

total_cache_size=$((cache_size + npm_size + android_size + genymobile_size + gradle_size + pubcache_size))

echo "📁 缓存文件: $(format_bytes $cache_size)"
echo "📦 npm缓存: $(format_bytes $npm_size)"
echo "📱 Android开发: $(format_bytes $android_size)"
echo "🤖 Genymobile: $(format_bytes $genymobile_size)"
echo "🔧 Gradle缓存: $(format_bytes $gradle_size)"
echo "🎯 Dart缓存: $(format_bytes $pubcache_size)"
echo ""
echo "📊 总计可释放: $(format_bytes $total_cache_size)"
echo ""

echo "🔍 检查要保留的重要目录:"
echo "✅ 项目源码: $(show_size "$PROJECT_DIR")"
echo "✅ 用户配置: $(show_size "$HOME_DIR/.config")"
echo "✅ Claude数据: $(show_size "$HOME_DIR/.claude")"
echo ""

# 详细清理列表
echo "📋 详细清理清单:"
echo "=============================================="

echo "🗑️  浏览器缓存 (~4.7GB):"
cache_items=(
    "$HOME_DIR/.cache/puppeteer"
    "$HOME_DIR/.cache/ms-playwright"
    "$HOME_DIR/.cache/google-chrome"
    "$HOME_DIR/.cache/deepin"
    "$HOME_DIR/.cache/browser"
    "$HOME_DIR/.cache/deepin-anything-server"
)

for item in "${cache_items[@]}"; do
    if [[ -d "$item" ]]; then
        size=$(show_size "$item")
        echo "   - $(basename "$item"): $size"
    fi
done

echo ""
echo "🗑️  包管理器缓存 (~4.1GB):"
npm_items=(
    "$HOME_DIR/.npm/_cacache"
    "$HOME_DIR/.npm/_npx"
    "$HOME_DIR/.pub-cache"
    "$HOME_DIR/.cache/uv"
    "$HOME_DIR/.cache/node-gyp"
)

for item in "${npm_items[@]}"; do
    if [[ -d "$item" ]]; then
        size=$(show_size "$item")
        echo "   - $(basename "$item"): $size"
    fi
done

echo ""
echo "🗑️  Android开发环境 (~1.9GB):"
android_items=(
    "$HOME_DIR/Android"
    "$HOME_DIR/.Genymobile"
)

for item in "${android_items[@]}"; do
    if [[ -d "$item" ]]; then
        size=$(show_size "$item")
        echo "   - $(basename "$item"): $size"
    fi
done

echo ""
echo "🗑️  其他缓存 (~1GB):"
other_items=(
    "$HOME_DIR/.gradle"
    "$HOME_DIR/.cache/dde-blackwidget"
    "$HOME_DIR/.cache/mozilla"
)

for item in "${other_items[@]}"; do
    if [[ -d "$item" ]]; then
        size=$(show_size "$item")
        echo "   - $(basename "$item"): $size"
    fi
done

echo ""
echo "✅ 保留的重要内容:"
echo "   • 项目源码: $PROJECT_DIR"
echo "   • Git历史: $PROJECT_DIR/k.yyup.com/.git"
echo "   • 用户配置: .config/"
echo "   • Claude缓存: .claude/"
echo "   • SSH密钥: .ssh/"
echo ""

# 确认清理
echo "⚠️  警告：以下操作将删除所有缓存文件，但保留源码和重要配置！"
echo ""
if confirm_action "是否开始安全清理？"; then
    echo ""
    echo "🧹 开始安全清理..."
    cleaned_size=0

    # 清理浏览器缓存
    echo ""
    echo "🌐 清理浏览器缓存..."
    for item in "${cache_items[@]}"; do
        if [[ -d "$item" ]]; then
            size=$(get_dir_size "$item")
            echo "   🗑️  删除: $(basename "$item") ($(format_bytes $size))"
            rm -rf "$item"
            cleaned_size=$((cleaned_size + size))
        fi
    done

    # 清理包管理器缓存
    echo ""
    echo "📦 清理包管理器缓存..."
    for item in "${npm_items[@]}"; do
        if [[ -d "$item" ]]; then
            size=$(get_dir_size "$item")
            echo "   🗑️  删除: $(basename "$item") ($(format_bytes $size))"
            rm -rf "$item"
            cleaned_size=$((cleaned_size + size))
        fi
    done

    # 清理Android开发环境
    echo ""
    echo "📱 清理Android开发环境..."
    for item in "${android_items[@]}"; do
        if [[ -d "$item" ]]; then
            size=$(get_dir_size "$item")
            echo "   🗑️  删除: $(basename "$item") ($(format_bytes $size))"
            rm -rf "$item"
            cleaned_size=$((cleaned_size + size))
        fi
    done

    # 清理其他缓存
    echo ""
    echo "🗂️  清理其他缓存..."
    for item in "${other_items[@]}"; do
        if [[ -d "$item" ]]; then
            size=$(get_dir_size "$item")
            echo "   🗑️  删除: $(basename "$item") ($(format_bytes $size))"
            rm -rf "$item"
            cleaned_size=$((cleaned_size + size))
        fi
    done

    # 额外清理一些常见缓存
    echo ""
    echo "🧹 清理其他临时缓存..."

    # 清理npm全局缓存
    if command -v npm &> /dev/null; then
        echo "   🗑️  清理npm全局缓存..."
        npm cache clean --force 2>/dev/null || true
    fi

    # 清理pip缓存
    if command -v pip &> /dev/null; then
        echo "   🗑️  清理pip缓存..."
        pip cache purge 2>/dev/null || true
    fi

    # 清理Docker缓存（如果存在）
    if command -v docker &> /dev/null; then
        echo "   🗑️  清理Docker缓存..."
        docker system prune -f 2>/dev/null || true
    fi

    echo ""
    echo "✅ 清理完成！"
    echo ""
    echo "📊 清理统计:"
    echo "   🗑️  已清理空间: $(format_bytes $cleaned_size)"
    echo "   📁 保留源码: $(show_size "$PROJECT_DIR")"
    echo "   ⚙️  保留配置: $(show_size "$HOME_DIR/.config")"
    echo ""

    # 显示磁盘空间变化
    echo "💾 磁盘空间状况:"
    echo "----------------------------------------"
    df -h "$HOME_DIR"
    echo ""

else
    echo ""
    echo "❌ 取消清理操作"
    exit 0
fi

echo "🎉 安全清理完成！"
echo ""
echo "💡 后续建议:"
echo "1. 🔄 重新安装开发工具时可能会稍慢（需要重新下载缓存）"
echo "2. 📱 如需Android开发，重新安装Android Studio和SDK"
echo "3. 📦 npm install 时会重新下载包缓存"
echo "4. 🌐 浏览器首次访问网站会重新建立缓存"
echo ""
echo "⚠️  注意事项:"
echo "• 源码和重要配置已完整保留"
echo "• Git仓库和历史记录未受影响"
echo "• 用户设置和配置文件安全"
echo "• 下次使用相关工具时可能需要重新配置"