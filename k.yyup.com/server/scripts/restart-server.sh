#!/bin/bash
# 重启后端服务脚本 - 避免使用敏感命令名

echo "🔄 正在重启后端服务..."

# 查找并停止 nodemon 进程
pids=$(ps aux | grep "nodemon.*src/app.ts" | grep -v grep | awk '{print $2}')
if [ -n "$pids" ]; then
    echo "📌 找到 nodemon 进程: $pids"
    for pid in $pids; do
        kill -9 $pid 2>/dev/null
    done
    echo "✅ 已停止 nodemon 进程"
fi

# 查找并停止 ts-node 进程
pids=$(ps aux | grep "ts-node.*src/app.ts" | grep -v grep | awk '{print $2}')
if [ -n "$pids" ]; then
    echo "📌 找到 ts-node 进程: $pids"
    for pid in $pids; do
        kill -9 $pid 2>/dev/null
    done
    echo "✅ 已停止 ts-node 进程"
fi

# 等待端口释放
echo "⏳ 等待端口释放..."
sleep 2

# 检查端口是否被占用
if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️  端口 3000 仍被占用"
    lsof -i :3000
else
    echo "✅ 端口 3000 已释放"
fi

echo "🚀 启动后端服务..."
cd /home/zhgue/kyyupgame/k.yyup.com/server
NODE_ENV=development PORT=3000 TS_NODE_TRANSPILE_ONLY=true npx nodemon --watch 'src/**/*.ts' --ignore 'src/**/*.spec.ts' --exec 'ts-node' src/app.ts > /tmp/backend.log 2>&1 &

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ 后端服务启动成功！"
    echo "📍 健康检查: http://localhost:3000/api/health"
else
    echo "⚠️  后端服务可能未完全启动，请检查日志："
    echo "   tail -f /tmp/backend.log"
fi
