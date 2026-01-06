#!/bin/bash

echo "=== ToDesk 安装脚本 ==="
echo "开始时间: $(date)"
echo

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
    echo "请不要以root用户运行此脚本"
    exit 1
fi

# 创建下载目录
DOWNLOAD_DIR="$HOME/Downloads/todesk"
mkdir -p "$DOWNLOAD_DIR"
cd "$DOWNLOAD_DIR"

echo "1. 创建下载目录: $DOWNLOAD_DIR"

# 检测系统架构
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    TODESK_ARCH="amd64"
elif [ "$ARCH" = "aarch64" ]; then
    TODESK_ARCH="arm64"
else
    echo "错误: 不支持的架构 $ARCH"
    exit 1
fi

echo "2. 检测到系统架构: $ARCH ($TODESK_ARCH)"

# 设置下载URL（版本4.3.1.0）
TODESK_VERSION="4.3.1.0"
TODESK_URL="https://dl.todesk.com/linux/todesk_${TODESK_VERSION}_${TODESK_ARCH}.deb"
TODESK_FILE="todesk_${TODESK_VERSION}_${TODESK_ARCH}.deb"

echo "3. 下载ToDesk..."
echo "   URL: $TODESK_URL"
echo "   文件: $TODESK_FILE"

# 下载文件
if command -v wget >/dev/null 2>&1; then
    wget -O "$TODESK_FILE" "$TODESK_URL"
elif command -v curl >/dev/null 2>&1; then
    curl -o "$TODESK_FILE" "$TODESK_URL"
else
    echo "错误: 未找到wget或curl"
    exit 1
fi

# 检查下载是否成功
if [ ! -f "$TODESK_FILE" ]; then
    echo "错误: 下载失败"
    exit 1
fi

echo "4. 下载完成: $(ls -lh "$TODESK_FILE")"

# 安装依赖
echo "5. 更新软件包列表..."
sudo apt update

echo "6. 安装依赖..."
sudo apt install -f -y

# 安装ToDesk
echo "7. 安装ToDesk..."
sudo dpkg -i "$TODESK_FILE"

# 修复可能的依赖问题
echo "8. 修复依赖问题..."
sudo apt install -f -y

# 检查安装
if command -v todesk >/dev/null 2>&1; then
    echo "✅ ToDesk 安装成功!"
    echo
    echo "使用方法:"
    echo "  命令行: todesk"
    echo "  图形界面: 在应用菜单中搜索ToDesk"
    echo
    echo "配置建议:"
    echo "  1. 首次运行需要登录账号"
    echo "  2. 设置固定密码便于连接"
    echo "  3. 配置开机自启动"
    echo
    echo "立即启动ToDesk? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        todesk &
        echo "ToDesk 已启动"
    fi
else
    echo "❌ ToDesk 安装失败"
    echo "请检查错误信息并手动安装"
    exit 1
fi

echo
echo "安装完成时间: $(date)"
echo "=== 脚本执行结束 ==="