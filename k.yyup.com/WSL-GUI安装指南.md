# WSL GUI版本安装指南

## 1. 下载Ubuntu MATE
- 文件：`ubuntu-mate-22.04.3-desktop-amd64.iso`
- 大小：约3.1GB
- 特点：预装GUI界面，适合桌面使用

## 2. 准备工作
1. 下载完成后，不要解压ISO文件
2. 记住ISO文件的保存位置（例如：`D:\Downloads\ubuntu-mate-22.04.3-desktop-amd64.iso`）

## 3. 导入步骤

### 方法1：使用自动脚本
1. 双击运行 `安装WSL-GUI.bat`
2. 输入ISO文件路径
3. 等待安装完成

### 方法2：手动安装
```powershell
# 创建安装目录
mkdir %USERPROFILE%\WSL-Ubuntu-GUI

# 导入系统
wsl --import Ubuntu-GUI %USERPROFILE%\WSL-Ubuntu-GUI 你的ISO文件路径

# 设置为默认发行版
wsl --set-default Ubuntu-GUI
```

## 4. 配置远程桌面
安装完成后，在WSL中运行：
```bash
# 安装xrdp
sudo apt update
sudo apt install -y xrdp

# 启动服务
sudo systemctl enable xrdp
sudo systemctl start xrdp
```

## 5. 连接到桌面环境
1. 在Windows中按 `Win + R`
2. 输入：`mstsc`
3. 连接到：`localhost:3389`
4. 使用WSL的用户名和密码登录

## 6. 安装开发工具
```bash
# 安装VSCode
sudo apt install -y code

# 安装Cursor
cd ~/Downloads
wget https://download.cursor.sh/linux/appImage/x64 -O cursor.AppImage
chmod +x cursor.AppImage
./cursor.AppImage
```

## 常见问题解决

### 1. 远程桌面连接失败
```bash
# 重启xrdp服务
sudo systemctl restart xrdp
```

### 2. 显示问题
```bash
# 安装显示驱动
sudo apt install -y mesa-utils
```

### 3. 中文支持
```bash
# 安装中文语言包
sudo apt install -y language-pack-zh-hans fonts-wqy-microhei
```

## 使用建议
1. 将代码项目放在 `/home/你的用户名` 目录下
2. 使用远程桌面时设置合适的分辨率
3. 定期备份重要数据