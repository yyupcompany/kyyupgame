#!/bin/bash

# 安装完整的Ubuntu桌面环境
echo "正在安装Ubuntu桌面环境..."
sudo apt update
sudo apt install -y ubuntu-desktop xrdp firefox

# 配置远程桌面服务
echo "配置远程桌面服务..."
sudo systemctl enable xrdp
sudo systemctl start xrdp

# 安装VSCode（原生Linux版本）
echo "安装VSCode..."
sudo apt install -y software-properties-common apt-transport-https wget
wget -q https://packages.microsoft.com/keys/microsoft.asc -O- | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main"
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
EOL

chmod +x ~/Desktop/cursor.desktop

echo "======================================"
echo "安装完成！"
echo "1. 在Windows中按Win+R，输入: mstsc"
echo "2. 连接到: localhost:3389"
echo "3. 使用WSL的用户名和密码登录"
echo "======================================"