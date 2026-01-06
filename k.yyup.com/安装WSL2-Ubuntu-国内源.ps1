# PowerShell脚本 - 使用阿里云镜像安装WSL2 Ubuntu

# 创建临时目录
$tempDir = "C:\WSL-Temp"
New-Item -ItemType Directory -Force -Path $tempDir
Set-Location $tempDir

Write-Host "正在从阿里云下载Ubuntu WSL..."
# 下载阿里云Ubuntu WSL rootfs
$url = "https://mirrors.aliyun.com/ubuntu-releases/22.04/ubuntu-22.04.3-desktop-amd64.iso"
$output = "$tempDir\ubuntu-rootfs.tar.gz"
Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "正在导入Ubuntu..."
# 创建WSL实例目录
$wslDir = "$env:USERPROFILE\WSL\Ubuntu-22.04"
New-Item -ItemType Directory -Force -Path $wslDir

# 导入WSL发行版
wsl --import Ubuntu-22.04 $wslDir $output

Write-Host "设置为默认发行版..."
wsl --set-default Ubuntu-22.04

Write-Host "清理临时文件..."
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "======================================"
Write-Host "安装完成！"
Write-Host "运行以下命令进入Ubuntu："
Write-Host "wsl -d Ubuntu-22.04"
Write-Host ""
Write-Host "首次运行需要设置用户名和密码"
Write-Host "======================================"

# 等待用户按键
Read-Host "按Enter键继续..."