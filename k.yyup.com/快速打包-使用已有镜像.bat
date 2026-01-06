@echo off
title Docker快速打包(使用已有Node镜像)
color 0A

echo ========================================
echo   使用已有Node镜像快速打包
echo ========================================
echo.

echo [1/2] 使用node:18-alpine镜像构建...
docker build -f Dockerfile.simple2 -t kindergarten-simple .

if %errorlevel% neq 0 (
    echo 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/2] 启动容器...
docker run -d --name kindergarten-simple-container -p 3000:3000 -p 5173:5173 -p 80:80 kindergarten-simple

if %errorlevel% neq 0 (
    echo 启动失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 打包成功！
echo.
echo 镜像名称: kindergarten-simple
echo 容器名称: kindergarten-simple-container
echo 项目路径: /project
echo ========================================
echo.
echo 进入容器命令:
echo docker exec -it kindergarten-simple-container sh
echo.
echo 停止容器命令:
echo docker stop kindergarten-simple-container
echo.
pause