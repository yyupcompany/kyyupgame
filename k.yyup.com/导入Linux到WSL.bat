@echo off
echo WSL Linux系统导入工具
echo ====================================

:: 设置变量
set /p ISO_PATH=请输入ISO或rootfs文件路径（例如：D:\ubuntu.iso）：
set WSL_NAME=Ubuntu-Custom
set INSTALL_PATH=%USERPROFILE%\%WSL_NAME%

echo.
echo 正在创建安装目录...
mkdir "%INSTALL_PATH%"

echo.
echo 正在导入Linux系统到WSL...
wsl --import %WSL_NAME% "%INSTALL_PATH%" "%ISO_PATH%"

echo.
echo 设置为默认发行版...
wsl --set-default %WSL_NAME%

echo.
echo ====================================
echo 安装完成！
echo.
echo 使用以下命令进入系统：
echo wsl -d %WSL_NAME%
echo.
echo 按任意键退出...
pause > nul