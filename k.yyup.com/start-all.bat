@echo off
echo 启动幼儿园管理系统...

echo 🔧 设置代理环境变量...
call scripts\setup-proxy.bat

echo 启动后端服务...
start "后端服务" cmd /k "call scripts\setup-proxy.bat && cd /d %~dp0server && npm run dev"

timeout /t 5 /nobreak

echo 启动前端服务...
start "前端服务" cmd /k "call scripts\setup-proxy.bat && cd /d %~dp0client && npm run dev"

echo 服务启动完成！
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3000
pause