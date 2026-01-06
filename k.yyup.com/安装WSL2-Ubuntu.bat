@echo off
echo 开始安装WSL2 Ubuntu...

:: 下载阿里云Ubuntu WSL镜像
curl -L "https://mirrors.aliyun.com/ubuntu-releases/22.04/ubuntu-22.04.3-desktop-amd64.iso" -o ubuntu.iso

:: 导入WSL镜像
wsl --import Ubuntu-22.04 %USERPROFILE%\Ubuntu-22.04 ubuntu.iso

:: 设置为默认发行版
wsl --set-default Ubuntu-22.04

echo 安装完成！
echo 请运行 'wsl' 进入Ubuntu系统
pause