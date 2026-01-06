# 在WSL2中安装Linux桌面环境

## 🎯 目标
- 完整的Ubuntu桌面环境
- 原生Linux版VSCode
- 原生Linux版Cursor
- 通过远程桌面访问

## 📋 步骤

### 1. 安装Ubuntu（如果还没有）
```powershell
# 在Windows PowerShell中运行
wsl --install Ubuntu-22.04
```

### 2. 进入WSL
```powershell
wsl
```

### 3. 运行安装脚本
```bash
chmod +x 安装Linux桌面环境.sh
./安装Linux桌面环境.sh
```

### 4. 连接到Linux桌面

方法1：远程桌面（推荐）
1. Win + R
2. 输入：mstsc
3. 连接：localhost:3389
4. 使用WSL用户名密码登录

方法2：直接启动（需要Windows 11）
```bash
wsl --system
```

## 🖥️ 使用说明

### 在Linux桌面中：
- VSCode：在应用菜单中找到"Visual Studio Code"
- Cursor：双击桌面上的Cursor图标

### 文件位置：
- 主目录：`/home/你的用户名`
- 桌面：`/home/你的用户名/Desktop`
- 应用：`/home/你的用户名/Applications`

### Windows访问：
- WSL文件：`\\wsl$\Ubuntu-22.04\home\你的用户名`

## ⚡ 性能提示

1. 把代码放在WSL文件系统中（/home目录下）
2. 避免在/mnt/c下工作（性能差）
3. 使用Linux原生Docker（如果需要）

## 🛠️ 常见问题

### 远程桌面连接失败
```bash
# 重启xrdp服务
sudo systemctl restart xrdp
```

### 分辨率调整
- 在远程桌面连接时可以设置
- 或在Ubuntu设置中调整

### 声音问题
```bash
# 安装声音支持
sudo apt install -y pulseaudio
```