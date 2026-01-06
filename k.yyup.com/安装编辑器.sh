#!/bin/bash

# 更新系统并安装必要工具
sudo apt update
sudo apt install -y wget gpg apt-transport-https curl software-properties-common

# 安装VSCode
echo "正在安装VSCode..."
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
rm -f packages.microsoft.gpg
sudo apt update
sudo apt install -y code

# 安装Cursor
echo "正在安装Cursor..."
mkdir -p ~/cursor
cd ~/cursor
wget https://download.cursor.sh/linux/appImage/x64 -O cursor.AppImage
chmod +x cursor.AppImage

# 创建桌面快捷方式
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/cursor.desktop << EOL
[Desktop Entry]
Name=Cursor
Exec=$HOME/cursor/cursor.AppImage
Icon=cursor
Type=Application
Categories=Development;
EOL

echo "安装完成！"
echo "启动VSCode: code"
echo "启动Cursor: ~/cursor/cursor.AppImage"