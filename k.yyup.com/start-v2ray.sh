#!/bin/bash

# V2Ray 自动启动脚本
# 用于在容器环境中管理V2Ray服务

V2RAY_CONFIG="/home/devbox/project/v2ray-install/config.json"
V2RAY_BIN="/usr/local/bin/v2ray/v2ray"
PID_FILE="/home/devbox/project/v2ray.pid"

start_v2ray() {
    echo "启动 V2Ray 服务..."
    
    # 检查配置文件是否存在
    if [[ ! -f "$V2RAY_CONFIG" ]]; then
        echo "错误: 配置文件不存在 $V2RAY_CONFIG"
        exit 1
    fi
    
    # 检查是否已经运行
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "V2Ray 已经在运行 (PID: $pid)"
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    
    # 启动V2Ray
    nohup "$V2RAY_BIN" run -config "$V2RAY_CONFIG" > /home/devbox/project/v2ray.log 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # 等待启动
    sleep 2
    
    if ps -p "$pid" > /dev/null 2>&1; then
        echo "V2Ray 启动成功 (PID: $pid)"
        echo "SOCKS5 代理: 127.0.0.1:1080"
        echo "HTTP 代理: 127.0.0.1:8080"
        return 0
    else
        echo "V2Ray 启动失败"
        rm -f "$PID_FILE"
        return 1
    fi
}

stop_v2ray() {
    echo "停止 V2Ray 服务..."
    
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            kill "$pid"
            sleep 2
            if ps -p "$pid" > /dev/null 2>&1; then
                kill -9 "$pid"
            fi
            echo "V2Ray 已停止"
        fi
        rm -f "$PID_FILE"
    else
        pkill -f "v2ray.*$V2RAY_CONFIG"
        echo "V2Ray 进程已清理"
    fi
}

status_v2ray() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "V2Ray 正在运行 (PID: $pid)"
            echo "SOCKS5 代理: 127.0.0.1:1080"
            echo "HTTP 代理: 127.0.0.1:8080"
            return 0
        else
            echo "V2Ray 未运行 (PID文件存在但进程不存在)"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        echo "V2Ray 未运行"
        return 1
    fi
}

case "$1" in
    start)
        start_v2ray
        ;;
    stop)
        stop_v2ray
        ;;
    restart)
        stop_v2ray
        sleep 1
        start_v2ray
        ;;
    status)
        status_v2ray
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        echo "  start   - 启动V2Ray服务"
        echo "  stop    - 停止V2Ray服务"
        echo "  restart - 重启V2Ray服务"
        echo "  status  - 查看V2Ray状态"
        exit 1
        ;;
esac
