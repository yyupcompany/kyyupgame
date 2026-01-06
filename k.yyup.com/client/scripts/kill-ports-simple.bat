@echo off
echo 🔍 清理前端端口...

REM 杀死占用5173端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
    echo 杀死端口5173的进程: %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM 杀死占用6000端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":6000 "') do (
    echo 杀死端口6000的进程: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo ✅ 端口清理完成！
