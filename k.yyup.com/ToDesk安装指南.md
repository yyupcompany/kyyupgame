# ToDesk 安装指南

## 当前系统环境
- **操作系统**: Linux (Deepin/Ubuntu)
- **架构**: AMD64
- **网络**: 使用代理 (192.168.1.80:10808)

## 安装方法

### 方法1: 官方下载安装
```bash
# 1. 下载最新版本
cd ~/Downloads
wget https://dl.todesk.com/linux/todesk_4.3.1.0_amd64.deb

# 2. 安装依赖
sudo apt update
sudo apt install -f

# 3. 安装ToDesk
sudo dpkg -i todesk_4.3.1.0_amd64.deb

# 4. 修复依赖问题
sudo apt install -f
```

### 方法2: 使用包管理器
```bash
# Ubuntu/Deepin
sudo apt update
sudo apt install todesk

# 或者
sudo snap install todesk
```

### 方法3: 手动安装步骤
```bash
# 1. 创建临时目录
mkdir -p ~/temp/todesk
cd ~/temp/todesk

# 2. 下载安装包（检查官网最新版本）
# 访问 https://www.todesk.com/linux 获取最新下载链接

# 3. 安装
sudo dpkg -i todesk_*.deb
sudo apt install -f
```

## 替代远程桌面方案

### 1. 向日葵 (Sunlogin)
```bash
# 下载
wget https://down.oray.com/sunlogin/linux/deb/x86_64/sunloginclientshell-10.1.0.31168-amd64.deb

# 安装
sudo dpkg -i sunloginclientshell-*.deb
sudo apt install -f

# 启动
sunloginclient
```

### 2. AnyDesk
```bash
# 添加仓库
wget -qO - https://keys.anydesk.com/repos/DEB-GPG-KEY | sudo apt-key add -
echo "deb http://deb.anydesk.com/ all main" | sudo tee /etc/apt/sources.list.d/anydesk-stable.list

# 安装
sudo apt update
sudo apt install anydesk

# 启动
anydesk
```

### 3. Chrome Remote Desktop
```bash
# 安装Chrome浏览器
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install google-chrome-stable

# 安装Chrome远程桌面
# 访问 https://remotedesktop.google.com/
```

### 4. TeamViewer
```bash
# 下载
wget https://download.teamviewer.com/download/linux/teamviewer_amd64.deb

# 安装
sudo dpkg -i teamviewer_amd64.deb
sudo apt install -f

# 启动
teamviewer
```

## 配置和使用

### ToDesk 配置
```bash
# 启动ToDesk服务
sudo systemctl start todesk

# 设置开机自启
sudo systemctl enable todesk

# 查看连接信息
todesk info
```

### 安全设置
```bash
# 设置固定密码
todesk set password your_password

# 设置固定连接码
todesk set fixed-code your_code

# 启用双因素认证
todesk enable-2fa
```

## 网络问题解决

### 代理环境配置
```bash
# 设置代理
export http_proxy=http://192.168.1.80:10808
export https_proxy=http://192.168.1.80:10808
export no_proxy=localhost,127.0.0.1

# 下载时使用代理
wget --proxy=on http://example.com/file.deb
```

### 防火墙配置
```bash
# 允许远程桌面端口
sudo ufw allow 5900/tcp  # VNC
sudo ufw allow 3389/tcp  # RDP
sudo ufw allow todesk    # ToDesk
```

## 故障排除

### 常见问题
1. **依赖问题**: `sudo apt install -f`
2. **权限问题**: `sudo chmod +x /usr/bin/todesk`
3. **服务启动失败**: 检查系统日志 `journalctl -u todesk`
4. **连接失败**: 检查防火墙和网络设置

### 卸载
```bash
# 卸载ToDesk
sudo dpkg -r todesk
sudo dpkg -P todesk

# 清理配置
rm -rf ~/.config/todesk
rm -rf ~/.local/share/todesk
```

## 推荐方案
基于当前环境，推荐使用 **AnyDesk** 或 **向日葵**，因为：
1. 安装简单，依赖少
2. 在Linux下兼容性好
3. 网络连接稳定

## 自动安装脚本
```bash
#!/bin/bash
# ToDesk自动安装脚本

echo "开始安装ToDesk..."

# 检查系统架构
ARCH=$(uname -m)
if [ "$ARCH" != "x86_64" ]; then
    echo "只支持AMD64架构"
    exit 1
fi

# 下载最新版本
cd /tmp
wget "https://dl.todesk.com/linux/todesk_4.3.1.0_amd64.deb" -O todesk.deb

# 安装
sudo dpkg -i todesk.deb
sudo apt install -f

# 清理
rm todesk.deb

echo "ToDesk安装完成！"
echo "运行 'todesk' 启动应用"
```