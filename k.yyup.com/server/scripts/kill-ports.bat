@echo off
echo 🔍 清理后端端口...

REM 杀死占用3000端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 "') do (
    echo 杀死端口3000的进程: %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM 杀死占用3001端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 "') do (
    echo 杀死端口3001的进程: %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM 杀死占用3003端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3003 "') do (
    echo 杀死端口3003的进程: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo ✅ 后端端口清理完成！
