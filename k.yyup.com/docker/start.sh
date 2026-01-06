#!/bin/sh

echo "Starting Kindergarten Management System..."

# 等待一下确保服务准备就绪
sleep 2

# 启动supervisor
echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf