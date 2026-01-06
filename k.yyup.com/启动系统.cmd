@echo off
title 幼儿园管理系统启动器
color 0A

echo ========================================
echo       幼儿园管理系统启动器
echo ========================================
echo.

echo [1/3] 检查环境...
cd /d "%~dp0"

echo [2/3] 启动后端服务...
start "后端服务 - 端口3000" cmd /k "cd server && npm run dev"

echo [3/3] 等待5秒后启动前端...
timeout /t 5 /nobreak > nul

echo [3/3] 启动前端服务...
start "前端服务 - 端口5173" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo 启动完成！请等待服务初始化...
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3000
echo ========================================
echo.
echo 按任意键关闭此窗口...
pause > nul