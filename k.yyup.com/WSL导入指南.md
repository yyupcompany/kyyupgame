# 将下载的Linux系统导入WSL

## 支持的Linux发行版文件格式
1. `.tar.gz` 格式的rootfs文件
2. `.vhdx` 格式的虚拟硬盘文件
3. `.iso` 格式的安装镜像（需要先解压）

## 下载地址推荐（国内镜像）

### Ubuntu
- 清华镜像：https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/
- 阿里云镜像：https://mirrors.aliyun.com/ubuntu-releases/
- 中科大镜像：https://mirrors.ustc.edu.cn/ubuntu-releases/

### 推荐下载文件
- `ubuntu-22.04.3-live-server-amd64.iso`
- 或 `ubuntu-22.04-server-cloudimg-amd64-wsl.rootfs.tar.gz`

## 导入步骤

### 方法1：使用批处理脚本（推荐）
1. 双击运行 `导入Linux到WSL.bat`
2. 输入下载的文件路径
3. 等待导入完成

### 方法2：手动命令导入
```powershell
# 创建目录
mkdir %USERPROFILE%\WSL-Ubuntu

# 导入系统
wsl --import Ubuntu-Custom %USERPROFILE%\WSL-Ubuntu 下载的文件路径

# 设置默认
wsl --set-default Ubuntu-Custom
```

## 导入后配置

### 1. 创建用户（可选）
```bash
# 进入WSL
wsl -d Ubuntu-Custom

# 创建用户
NEW_USER=你的用户名
useradd -m -G sudo -s /bin/bash $NEW_USER
passwd $NEW_USER

# 设置默认用户
echo "[user]
default=$NEW_USER" | tee /etc/wsl.conf
```

### 2. 安装桌面环境
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装XFCE桌面
sudo apt install -y xfce4 xfce4-goodies

# 安装远程桌面服务
sudo apt install -y xrdp
sudo systemctl enable xrdp
```

### 3. 安装开发工具
```bash
# 安装VSCode
sudo apt install -y code

# 安装Cursor
wget https://download.cursor.sh/linux/appImage/x64 -O cursor.AppImage
chmod +x cursor.AppImage
```

## 常见问题解决

### 1. 导入失败
- 检查文件路径是否正确
- 确保文件格式支持
- 尝试使用管理员权限运行

### 2. 无法启动
```powershell
# 重启WSL
wsl --shutdown
wsl --start
```

### 3. 空间不足
```powershell
# 检查WSL磁盘使用
wsl --system
df -h
```

## 使用建议

1. 将开发文件放在WSL文件系统中（性能更好）
2. 使用WSL的Docker而不是Docker Desktop
3. 定期备份重要数据

## 备份方法

```powershell
# 导出备份
wsl --export Ubuntu-Custom Ubuntu-backup.tar

# 需要时恢复
wsl --import Ubuntu-Restore %USERPROFILE%\WSL-Restore Ubuntu-backup.tar
```