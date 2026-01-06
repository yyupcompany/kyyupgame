#!/bin/bash

# WSL2 + CURSOR 一键安装脚本
# 适用于Ubuntu 20.04/22.04

set -e

echo "=========================================="
echo "       WSL2 + CURSOR 一键安装脚本"
echo "=========================================="
echo

# 检查是否在WSL环境中
if ! grep -q microsoft /proc/version; then
    echo "❌ 错误：此脚本必须在WSL2环境中运行"
    exit 1
fi

echo "✅ 检测到WSL2环境"

# 更新系统
echo "🔄 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装基础工具
echo "🔧 安装基础工具..."
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# 检查Windows版本，判断GUI支持
echo "🖥️  检查GUI支持..."
if command -v wslg >/dev/null 2>&1 || [ -n "$WAYLAND_DISPLAY" ]; then
    echo "✅ 检测到WSLg支持（Windows 11）"
    GUI_METHOD="wslg"
else
    echo "⚠️  未检测到WSLg，使用X11转发模式（Windows 10）"
    GUI_METHOD="x11"
fi

# 安装桌面环境（轻量级）
echo "🖼️  安装桌面环境..."
sudo apt install -y \
    xfce4-session \
    xfce4-panel \
    xfce4-terminal \
    thunar \
    xfce4-settings \
    firefox

# 配置X11（如果需要）
if [ "$GUI_METHOD" = "x11" ]; then
    echo "🔧 配置X11转发..."
    
    # 添加DISPLAY环境变量
    if ! grep -q "DISPLAY=" ~/.bashrc; then
        cat >> ~/.bashrc << 'EOF'

# X11转发配置
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0
export LIBGL_ALWAYS_INDIRECT=1
EOF
    fi
    
    # 立即应用环境变量
    export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0
    export LIBGL_ALWAYS_INDIRECT=1
    
    echo "ℹ️  请确保Windows上已安装并运行VcXsrv"
fi

# 安装Node.js（CURSOR可能需要）
echo "📦 安装Node.js..."
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 安装Docker（原生Linux Docker）
echo "🐳 安装Docker..."
if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 安装CURSOR
echo "🎯 安装CURSOR编辑器..."

# 创建应用目录
mkdir -p ~/Applications

# 下载CURSOR AppImage
echo "📥 下载CURSOR..."
curl -L "https://download.cursor.sh/linux/appImage/x64" -o ~/Applications/cursor.AppImage

# 给执行权限
chmod +x ~/Applications/cursor.AppImage

# 安装AppImage依赖
sudo apt install -y fuse libfuse2

# 创建启动脚本
cat > ~/start-cursor.sh << 'EOF'
#!/bin/bash

# 检查GUI环境
if [ -z "$DISPLAY" ] && [ -z "$WAYLAND_DISPLAY" ]; then
    # 设置X11 DISPLAY
    export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0
fi

# 启动CURSOR
~/Applications/cursor.AppImage "$@"
EOF

chmod +x ~/start-cursor.sh

# 创建桌面快捷方式（如果有桌面环境）
if command -v xfce4-panel >/dev/null 2>&1; then
    mkdir -p ~/Desktop
    cat > ~/Desktop/cursor.desktop << EOF
[Desktop Entry]
Type=Application
Name=Cursor
Comment=AI-powered code editor
Exec=$HOME/start-cursor.sh
Icon=cursor
Categories=Development;TextEditor;
Terminal=false
EOF
    chmod +x ~/Desktop/cursor.desktop
fi

# 创建应用菜单项
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/cursor.desktop << EOF
[Desktop Entry]
Type=Application
Name=Cursor
Comment=AI-powered code editor
Exec=$HOME/start-cursor.sh
Icon=cursor
Categories=Development;TextEditor;
Terminal=false
EOF

# 安装一些有用的开发工具
echo "🔧 安装开发工具..."
sudo apt install -y \
    vim \
    code \
    git-gui \
    gitk \
    tree \
    htop \
    neofetch

echo
echo "=========================================="
echo "           安装完成！"
echo "=========================================="
echo
echo "🎉 CURSOR已安装完成！"
echo
echo "📋 启动方式："
echo "   1. 命令行: ~/start-cursor.sh"
echo "   2. 桌面快捷方式: ~/Desktop/cursor.desktop"
echo "   3. 应用菜单: 在应用菜单中找到Cursor"
echo
echo "🖥️  GUI环境: $GUI_METHOD"
if [ "$GUI_METHOD" = "x11" ]; then
    echo "   ⚠️  请确保VcXsrv在Windows上运行"
    echo "   🔧 VcXsrv配置: Multiple windows, Display 0, 禁用访问控制"
fi
echo
echo "🐳 Docker: 已安装（需要重新登录生效）"
echo "📦 Node.js: $(node --version 2>/dev/null || echo '已安装')"
echo
echo "🚀 使用建议："
echo "   • 项目文件保存在WSL文件系统中（更快的IO）"
echo "   • 使用Linux原生Docker（性能更好）"
echo "   • 可以直接在WSL中开发，无需Windows工具"
echo
echo "💡 测试GUI："
if [ "$GUI_METHOD" = "wslg" ]; then
    echo "   firefox &"
else
    echo "   xclock  # 测试X11转发"
fi
echo
echo "🎯 启动CURSOR："
echo "   ~/start-cursor.sh"
echo
read -p "按Enter键启动CURSOR..."

# 启动CURSOR
~/start-cursor.sh