# 下载Ubuntu WSL
Write-Host "正在下载Ubuntu WSL..."
Invoke-WebRequest -Uri "https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/22.04/ubuntu-22.04.3-live-server-amd64.iso" -OutFile "ubuntu.iso"

# 启用WSL2
Write-Host "启用WSL2..."
wsl --set-default-version 2

# 导入Ubuntu
Write-Host "导入Ubuntu..."
wsl --import Ubuntu-22.04 "$env:USERPROFILE\Ubuntu-22.04" "ubuntu.iso"

# 设置为默认发行版
Write-Host "设置为默认发行版..."
wsl --set-default Ubuntu-22.04

Write-Host "清理下载文件..."
Remove-Item "ubuntu.iso"

Write-Host "安装完成！"