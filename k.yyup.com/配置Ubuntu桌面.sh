#!/bin/bash

# 设置阿里云源
echo "设置阿里云源..."
sudo cp /etc/apt/sources.list /etc/apt/sources.list.backup
sudo bash -c 'cat > /etc/apt/sources.list << EOL
deb https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse
deb https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
EOL'

# 更新系统
echo "更新系统..."
sudo apt update && sudo apt upgrade -y

# 安装桌面环境
echo "安装XFCE桌面环境（较轻量）..."
sudo apt install -y xfce4 xfce4-goodies

# 安装远程桌面服务
echo "安装远程桌面服务..."
sudo apt install -y xrdp
sudo adduser xrdp ssl-cert
sudo systemctl enable xrdp
sudo systemctl restart xrdp

# 安装中文支持
echo "安装中文支持..."
sudo apt install -y language-pack-zh-hans fonts-wqy-microhei

# 安装常用工具
echo "安装常用工具..."
sudo apt install -y firefox git curl wget

# 安装VSCode
echo "安装VSCode..."
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
rm -f packages.microsoft.gpg
sudo apt update
sudo apt install -y code

# 安装Cursor
echo "安装Cursor..."
mkdir -p ~/Applications
cd ~/Applications
wget https://download.cursor.sh/linux/appImage/x64 -O cursor.AppImage
chmod +x cursor.AppImage

# 创建桌面快捷方式
mkdir -p ~/Desktop
cat > ~/Desktop/cursor.desktop << EOL
[Desktop Entry]
Type=Application
Name=Cursor
Exec=$HOME/Applications/cursor.AppImage
Icon=text-editor
Categories=Development;
Terminal=false
EOL

chmod +x ~/Desktop/cursor.desktop

# 配置中文环境
echo "配置中文环境..."
sudo update-locale LANG=zh_CN.UTF-8

echo "======================================"
echo "安装完成！"
echo ""
echo "使用说明："
echo "1. 在Windows中运行远程桌面连接："
echo "   - Win + R"
echo "   - 输入：mstsc"
echo "   - 连接到：localhost:3389"
echo ""
echo "2. 使用WSL用户名和密码登录"
echo ""
echo "3. 在桌面上可以找到Cursor图标"
echo "   VSCode可以在应用程序菜单中找到"
echo ""
echo "注意：首次登录可能需要注销后重新登录"
echo "======================================"