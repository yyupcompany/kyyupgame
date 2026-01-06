@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 前端端口清理脚本 (Windows版本)
REM 清理可能占用的前端端口：5173 和 6000

echo 🔍 检查前端端口占用情况...
echo.

REM 要检查的端口
set PORTS=5173 6000

for %%p in (%PORTS%) do (
    echo 检查端口 %%p...
    
    REM 查找占用该端口的进程
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        set PID=%%a
        if not "!PID!"=="" (
            echo ⚠️  端口 %%p 被进程 !PID! 占用
            
            REM 获取进程详细信息
            for /f "tokens=1*" %%b in ('tasklist /fi "pid eq !PID!" /fo table /nh 2^>nul') do (
                echo 进程信息: %%b %%c
            )
            
            REM 强制杀死进程
            echo 🔥 正在杀死进程 !PID!...
            taskkill /f /pid !PID! >nul 2>&1
            
            REM 等待一下确保进程被杀死
            timeout /t 1 /nobreak >nul
            
            REM 再次检查端口是否还被占用
            set NEW_PID=
            for /f "tokens=5" %%d in ('netstat -ano ^| findstr ":%%p " 2^>nul') do (
                set NEW_PID=%%d
            )
            
            if "!NEW_PID!"=="" (
                echo ✅ 端口 %%p 已释放
            ) else (
                echo ❌ 端口 %%p 仍被占用，可能需要手动处理
            )
            goto :next_port
        )
    )
    
    echo ✅ 端口 %%p 未被占用
    
    :next_port
    echo.
)

echo 🎯 前端端口清理完成！
