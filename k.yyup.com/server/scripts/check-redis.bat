@echo off
REM Redis 检测和启动脚本 (Windows 版本)
REM 检查 Redis 是否运行，如果没有运行则自动启动

setlocal enabledelayedexpansion

REM 颜色定义
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "CYAN=[36m"
set "RESET=[0m"

echo.
echo %BLUE%📋 检查 Redis 服务状态...%RESET%

REM 检查 Redis 是否运行
redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✅ Redis 服务已运行%RESET%
    echo %GREEN%   连接地址: redis://127.0.0.1:6379%RESET%
    echo.
    exit /b 0
)

echo %YELLOW%⚠️  Redis 服务未运行%RESET%
echo %CYAN%🚀 正在启动 Redis 服务...%RESET%

REM 尝试启动 Redis
redis-server --daemonize yes --port 6379 >nul 2>&1

REM 等待 Redis 启动
timeout /t 2 /nobreak >nul

REM 再次检查 Redis 是否运行
redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✅ Redis 服务启动成功！%RESET%
    echo %GREEN%   连接地址: redis://127.0.0.1:6379%RESET%
    echo.
    exit /b 0
) else (
    echo %RED%❌ Redis 启动失败%RESET%
    echo.
    echo %YELLOW%💡 请手动启动 Redis:%RESET%
    echo %YELLOW%   1. 确保 Redis 已安装%RESET%
    echo %YELLOW%   2. 运行: redis-server%RESET%
    echo %YELLOW%   3. 或使用 WSL: wsl redis-server%RESET%
    echo.
    exit /b 1
)

