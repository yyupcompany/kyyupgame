@echo off
chcp 65001 > nul
title 从ISO导入Ubuntu到WSL

echo ============================================
echo     从ISO导入Ubuntu到WSL
echo ============================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 请以管理员身份运行此脚本！
    echo 右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

:: 设置变量
set ISO_PATH=G:\迅雷下载\ubuntu-24.04.2-desktop-amd64.iso
set WSL_NAME=Ubuntu-24.04
set INSTALL_PATH=%USERPROFILE%\WSL\%WSL_NAME%
set TEMP_DIR=C:\WSL-Temp

echo [1/6] 创建必要目录...
mkdir "%INSTALL_PATH%" 2>nul
mkdir "%TEMP_DIR%" 2>nul

echo [2/6] 挂载ISO文件...
powershell -Command "Mount-DiskImage -ImagePath '%ISO_PATH%'"

echo [3/6] 获取挂载盘符...
for /f "tokens=2 delims==" %%i in ('wmic logicaldisk where "volumename like '%%Ubuntu%%'" get deviceid /value') do set MOUNT_DRIVE=%%i

if "%MOUNT_DRIVE%"=="" (
    echo 错误：无法找到挂载的ISO！
    goto :error
)

echo ISO挂载在：%MOUNT_DRIVE%

echo [4/6] 复制系统文件...
xcopy /E /I /H "%MOUNT_DRIVE%\casper\minimal.standard.live.squashfs" "%TEMP_DIR%"

echo [5/6] 导入到WSL...
wsl --import %WSL_NAME% "%INSTALL_PATH%" "%TEMP_DIR%\minimal.standard.live.squashfs"

echo [6/6] 清理...
powershell -Command "Dismount-DiskImage -ImagePath '%ISO_PATH%'"
rmdir /S /Q "%TEMP_DIR%"

echo.
echo ============================================
echo               安装完成！
echo ============================================
echo.
echo 运行以下命令进入系统：
echo wsl -d %WSL_NAME%
echo.
pause
exit /b 0

:error
echo.
echo 安装失败！
pause
exit /b 1