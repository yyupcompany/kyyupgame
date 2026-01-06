@echo off
echo 启动后端服务...
cd /d "%~dp0server"
npm run dev
pause