@echo off
title Docker快速打包
color 0A

echo ========================================
echo      Docker快速打包脚本
echo ========================================
echo.

echo [1/2] 构建Docker镜像...
docker build -f Dockerfile.simple -t kindergarten-project .

if %errorlevel% neq 0 (
    echo 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/2] 启动Docker容器...
docker run -d --name kindergarten-container -p 3000:3000 -p 5173:5173 -p 80:80 kindergarten-project

if %errorlevel% neq 0 (
    echo 启动失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 打包完成！
echo.
echo 镜像名称: kindergarten-project
echo 容器名称: kindergarten-container
echo 项目路径: /project
echo ========================================
echo.
echo 使用以下命令进入容器:
echo docker exec -it kindergarten-container bash
echo.
echo 使用以下命令停止容器:
echo docker stop kindergarten-container
echo.
pause