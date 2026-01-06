#!/bin/bash

# 前端端口清理脚本
# 清理可能占用的前端端口：5173 和 6000

echo "🔍 检查前端端口占用情况..."

# 要检查的端口
FRONTEND_PORTS=(5173 6000)

for port in "${FRONTEND_PORTS[@]}"; do
    echo "检查端口 $port..."
    
    # 查找占用该端口的进程
    PID=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
    
    if [ ! -z "$PID" ]; then
        echo "⚠️  端口 $port 被进程 $PID 占用"
        
        # 获取进程详细信息
        PROCESS_INFO=$(ps -p $PID -o pid,ppid,cmd --no-headers 2>/dev/null)
        echo "进程信息: $PROCESS_INFO"
        
        # 强制杀死进程
        echo "🔥 正在杀死进程 $PID..."
        kill -9 $PID 2>/dev/null
        
        # 等待一下确保进程被杀死
        sleep 1
        
        # 再次检查端口是否还被占用
        NEW_PID=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
        if [ -z "$NEW_PID" ]; then
            echo "✅ 端口 $port 已释放"
        else
            echo "❌ 端口 $port 仍被占用，可能需要手动处理"
        fi
    else
        echo "✅ 端口 $port 未被占用"
    fi
    echo ""
done

echo "🎯 前端端口清理完成！"