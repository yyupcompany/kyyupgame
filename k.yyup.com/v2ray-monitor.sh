#!/bin/bash

# V2Ray 自动监控和启动脚本
# 用于在终端启动时自动检测并启动 V2Ray 服务

SCRIPT_DIR="/home/devbox/project"
V2RAY_SCRIPT="$SCRIPT_DIR/start-v2ray.sh"
LOG_FILE="$SCRIPT_DIR/v2ray-monitor.log"

# 记录日志函数
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查 V2Ray 是否运行
check_v2ray() {
    if [[ -f "$SCRIPT_DIR/v2ray.pid" ]]; then
        local pid=$(cat "$SCRIPT_DIR/v2ray.pid")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # 正在运行
        fi
    fi
    return 1  # 未运行
}

# 主监控逻辑
main() {
    log_message "V2Ray 监控脚本启动"
    
    # 检查 V2Ray 脚本是否存在
    if [[ ! -f "$V2RAY_SCRIPT" ]]; then
        log_message "错误: V2Ray 启动脚本不存在 ($V2RAY_SCRIPT)"
        exit 1
    fi
    
    # 检查 V2Ray 是否运行
    if check_v2ray; then
        local pid=$(cat "$SCRIPT_DIR/v2ray.pid")
        log_message "V2Ray 已经在运行 (PID: $pid)"
        echo "✅ V2Ray 正在运行"
        echo "📡 SOCKS5 代理: 127.0.0.1:1080"
        echo "🌐 HTTP 代理: 127.0.0.1:8080"
    else
        log_message "V2Ray 未运行，正在启动..."
        echo "🔄 V2Ray 未运行，正在启动..."
        
        # 启动 V2Ray
        cd "$SCRIPT_DIR"
        if ./start-v2ray.sh start; then
            log_message "V2Ray 启动成功"
            echo "✅ V2Ray 启动成功"
            echo "📡 SOCKS5 代理: 127.0.0.1:1080"
            echo "🌐 HTTP 代理: 127.0.0.1:8080"
        else
            log_message "V2Ray 启动失败"
            echo "❌ V2Ray 启动失败，请检查日志"
            exit 1
        fi
    fi
    
    log_message "监控脚本执行完成"
}

# 运行主函数
main "$@" 