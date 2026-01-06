@echo off
chcp 65001 > nul
title 安装Ubuntu到WSL

echo ============================================
echo         Ubuntu WSL安装工具
echo ============================================
echo.

:: 设置变量
set ISO_PATH=G:\迅雷下载\ubuntu-24.04.2-desktop-amd64.iso
set WSL_NAME=Ubuntu-Desktop
set INSTALL_PATH=%USERPROFILE%\WSL\%WSL_NAME%

echo [1/4] 创建WSL安装目录...
mkdir "%INSTALL_PATH%" 2>nul

echo [2/4] 导入Ubuntu系统（这可能需要几分钟）...
wsl --import %WSL_NAME% "%INSTALL_PATH%" "%ISO_PATH%"

echo [3/4] 设置为默认发行版...
wsl --set-default %WSL_NAME%

echo [4/4] 配置远程桌面访问...
wsl -d %WSL_NAME% -u root apt update
wsl -d %WSL_NAME% -u root apt install -y xrdp xfce4

echo.
echo ============================================
echo               安装完成！
echo ============================================
echo.
echo 1. 运行以下命令进入系统：
echo    wsl -d %WSL_NAME%
echo.
echo 2. 使用远程桌面连接：
echo    Win + R，输入: mstsc
echo    连接到: localhost:3389
echo.
pause