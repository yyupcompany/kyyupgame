#!/bin/sh

# 健康检查脚本
echo "正在进行健康检查..."

# 检查nginx是否运行
if ! pgrep nginx > /dev/null; then
    echo "❌ Nginx未运行"
    exit 1
fi

# 检查后端服务是否响应
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ 后端服务无响应"
    exit 1
fi

# 检查前端是否可访问
if ! curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "❌ 前端服务无响应"
    exit 1
fi

echo "✅ 所有服务运行正常"
exit 0