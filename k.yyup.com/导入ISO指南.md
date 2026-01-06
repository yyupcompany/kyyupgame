# 从ISO导入Ubuntu到WSL的步骤

## 准备工作
1. 已下载的ISO文件：`G:\迅雷下载\ubuntu-24.04.2-desktop-amd64.iso`
2. 7-Zip或其他解压工具
3. 管理员权限的PowerShell

## 导入步骤

### 方法1：使用7-Zip
1. 用7-Zip打开ISO文件
2. 进入 `casper` 文件夹
3. 提取 `filesystem.squashfs` 文件到临时目录
4. 使用该文件导入WSL：
```powershell
wsl --import Ubuntu-Desktop %USERPROFILE%\WSL\Ubuntu-Desktop 提取的filesystem.squashfs路径
```

### 方法2：使用PowerShell脚本
1. 以管理员身份运行PowerShell
2. 运行 `mount-ubuntu.ps1` 脚本

### 方法3：手动挂载
1. 在Windows中双击ISO文件挂载
2. 找到挂载的盘符（例如：E:）
3. 运行命令：
```powershell
wsl --import Ubuntu-Desktop %USERPROFILE%\WSL\Ubuntu-Desktop E:\casper\filesystem.squashfs
```

## 安装后配置

1. 进入系统：
```powershell
wsl -d Ubuntu-Desktop
```

2. 安装桌面环境：
```bash
sudo apt update
sudo apt install -y xfce4 xrdp
```

3. 启动远程桌面：
```bash
sudo systemctl enable xrdp
sudo systemctl start xrdp
```

## 故障排除

如果导入失败，可以尝试：
1. 确保ISO文件完整
2. 检查磁盘空间
3. 使用管理员权限
4. 关闭防病毒软件