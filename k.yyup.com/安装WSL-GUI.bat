@echo off
chcp 65001 > nul
title WSL GUI版本安装工具

echo ============================================
echo         WSL GUI版本安装工具
echo ============================================
echo.

:: 检查是否以管理员权限运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 请以管理员权限运行此脚本！
    echo 右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

:: 设置变量
set /p ISO_PATH=请输入ISO文件路径（例如：D:\Downloads\ubuntu-mate-22.04.3-desktop-amd64.iso）：
set WSL_NAME=Ubuntu-GUI
set INSTALL_PATH=%USERPROFILE%\%WSL_NAME%

:: 检查文件是否存在
if not exist "%ISO_PATH%" (
    echo 错误：找不到ISO文件！
    echo 请确保文件路径正确。
    pause
    exit /b 1
)

echo.
echo [1/4] 正在启用WSL功能...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

echo.
echo [2/4] 设置WSL2为默认版本...
wsl --set-default-version 2

echo.
echo [3/4] 创建安装目录...
mkdir "%INSTALL_PATH%" 2>nul

echo.
echo [4/4] 正在导入系统（这可能需要几分钟）...
wsl --import %WSL_NAME% "%INSTALL_PATH%" "%ISO_PATH%"

:: 检查是否导入成功
if %errorLevel% neq 0 (
    echo.
    echo 错误：系统导入失败！
    echo 请检查ISO文件是否完整。
    pause
    exit /b 1
)

echo.
echo 设置为默认发行版...
wsl --set-default %WSL_NAME%

echo.
echo ============================================
echo               安装完成！
echo ============================================
echo.
echo 1. 运行以下命令进入系统：
echo    wsl -d %WSL_NAME%
echo.
echo 2. 在系统中运行以下命令安装远程桌面：
echo    sudo apt update
echo    sudo apt install -y xrdp
echo    sudo systemctl enable xrdp
echo.
echo 3. 然后在Windows中：
echo    按Win+R，输入mstsc，连接localhost:3389
echo.
echo 提示：首次运行需要设置用户名和密码
echo ============================================
echo.
pause