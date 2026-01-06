#!/bin/bash

# Docker构建脚本
echo "开始构建幼儿园管理系统Docker镜像..."

# 设置镜像名称和标签
IMAGE_NAME="kindergarten-system"
TAG="latest"

# 清理旧的构建缓存（可选）
echo "清理Docker构建缓存..."
docker builder prune -f

# 构建镜像
echo "构建Docker镜像: ${IMAGE_NAME}:${TAG}"
docker build -t "${IMAGE_NAME}:${TAG}" .

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ Docker镜像构建成功！"
    echo "镜像名称: ${IMAGE_NAME}:${TAG}"
    
    # 显示镜像信息
    echo "镜像信息:"
    docker images "${IMAGE_NAME}:${TAG}"
    
    echo ""
    echo "使用以下命令启动容器:"
    echo "docker run -d --name kindergarten-app -p 80:80 ${IMAGE_NAME}:${TAG}"
    echo ""
    echo "或使用docker-compose:"
    echo "docker-compose up -d"
    
else
    echo "❌ Docker镜像构建失败！"
    exit 1
fi