# Ubuntu桌面版下载链接（国内镜像）

## 推荐下载地址

### 1. 上海交大镜像站（推荐）
- 下载链接：https://mirrors.sjtug.sjtu.edu.cn/ubuntu-cd/22.04/ubuntu-22.04.5-desktop-amd64.iso
- 大小：约4.7GB
- 特点：标准Ubuntu桌面版，界面友好

### 2. 中科大镜像站（备选）
- 下载链接：https://mirrors.ustc.edu.cn/ubuntu-releases/22.04/ubuntu-22.04.5-desktop-amd64.iso
- 大小：约4.7GB

### 3. 北京外国语大学镜像站（备选）
- 下载链接：https://mirrors.bfsu.edu.cn/ubuntu-releases/22.04/ubuntu-22.04.5-desktop-amd64.iso
- 大小：约4.7GB

## 下载说明

1. 选择上述任意链接下载
2. 下载完成后**不要解压**ISO文件
3. 记住下载文件的保存位置（后面安装需要用到）

## 安装步骤

1. 等待ISO文件下载完成
2. 右键点击 `安装WSL-GUI.bat`，选择"以管理员身份运行"
3. 在脚本中输入ISO文件的完整路径

## 校验文件（可选）

如果想验证下载文件的完整性，可以使用以下命令：
```powershell
# 在PowerShell中运行
Get-FileHash 下载的ISO文件路径 -Algorithm SHA256
```

## 注意事项

- 下载时间取决于网络速度，文件较大请耐心等待
- 确保磁盘有足够空间（至少10GB）
- 下载完成后不要更改文件名