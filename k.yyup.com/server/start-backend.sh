#!/bin/bash

# 后端智能启动脚本
# 检测3000端口占用情况，自动处理后启动后端服务

PORT=3000
SERVICE_NAME="后端服务"

echo "=== $SERVICE_NAME 启动脚本 ==="

# 检查端口是否被占用
check_port() {
    local port=$1
    # 优先使用lsof，如果不可用则使用netstat
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti:$port 2>/dev/null
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | grep -v '-'
    elif command -v ss >/dev/null 2>&1; then
        ss -tlnp 2>/dev/null | grep ":$port " | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2
    else
        echo "警告: 无法检测端口占用情况（缺少lsof/netstat/ss命令）" >&2
        return 1
    fi
}

# 智能端口检测和处理
smart_port_check() {
    local port=$1
    local service_name=$2
    
    echo "🔍 检查端口 $port 占用情况..."
    
    # 使用通用的端口检测
    local pids=$(check_port $port)
    
    if [ -n "$pids" ]; then
        echo "⚠️  端口 $port 被占用，分析占用进程..."
        
        # 显示占用端口的进程信息
        if command -v netstat >/dev/null 2>&1; then
            echo "📊 端口占用详情:"
            netstat -tlnp 2>/dev/null | grep ":$port " | while read line; do
                echo "   $line"
            done
        elif command -v ss >/dev/null 2>&1; then
            echo "📊 端口占用详情:"
            ss -tlnp 2>/dev/null | grep ":$port " | while read line; do
                echo "   $line"
            done
        fi
        
        # 分析占用进程
        local node_processes=""
        local other_processes=""
        
        for pid in $pids; do
            if [ -n "$pid" ] && [ "$pid" != "-" ]; then
                local cmd=$(ps -p $pid -o cmd --no-headers 2>/dev/null)
                if [ -n "$cmd" ]; then
                    if echo "$cmd" | grep -q "node"; then
                        node_processes="$node_processes $pid"
                        echo "   🟡 Node.js进程 (PID: $pid): $cmd"
                    else
                        other_processes="$other_processes $pid"
                        echo "   🔴 其他进程 (PID: $pid): $cmd"
                    fi
                fi
            fi
        done
        
        # 自动清理策略
        echo ""
        echo "🤖 自动清理模式启动..."
        
        # 优先清理Node.js进程
        if [ -n "$node_processes" ]; then
            echo "🧹 清理Node.js进程..."
            for pid in $node_processes; do
                if [ -n "$pid" ] && [ "$pid" != "-" ]; then
                    echo "   终止Node.js进程 PID: $pid"
                    kill -TERM $pid 2>/dev/null
                    sleep 1
                    kill -0 $pid 2>/dev/null && kill -9 $pid 2>/dev/null
                fi
            done
        fi
        
        # 清理其他进程
        if [ -n "$other_processes" ]; then
            echo "🧹 清理其他进程..."
            for pid in $other_processes; do
                if [ -n "$pid" ] && [ "$pid" != "-" ]; then
                    echo "   终止进程 PID: $pid"
                    kill -TERM $pid 2>/dev/null
                    sleep 1
                    kill -0 $pid 2>/dev/null && kill -9 $pid 2>/dev/null
                fi
            done
        fi
        
        # 额外的清理尝试
        echo "🔧 执行额外清理..."
        pkill -f "node.*$port" 2>/dev/null
        pkill -f ".*:$port" 2>/dev/null
        
        sleep 3
        
        # 验证清理结果
        local remaining_pids=$(check_port $port)
        if [ -n "$remaining_pids" ]; then
            echo "❌ 端口 $port 仍被占用"
            echo "💡 建议手动清理: pkill -f node 或重启系统"
            return 1
        else
            echo "✅ 端口 $port 已成功释放"
            return 0
        fi
    else
        echo "✅ 端口 $port 未被占用"
        return 0
    fi
}

# 杀死占用端口的进程
kill_port_process() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "🔍 发现端口 $port 被以下进程占用："
        lsof -i:$port 2>/dev/null | grep LISTEN | while read line; do
            echo "   $line"
        done
        
        echo "⚡ 正在终止占用端口 $port 的进程..."
        for pid in $pids; do
            # 获取进程信息
            local process_info=$(ps -p $pid -o pid,ppid,cmd --no-headers 2>/dev/null)
            if [ -n "$process_info" ]; then
                echo "   终止进程: $process_info"
            else
                echo "   终止进程 PID: $pid"
            fi
            
            # 先尝试优雅关闭
            kill -TERM $pid 2>/dev/null
            sleep 1
            
            # 如果进程仍在运行，强制关闭
            if kill -0 $pid 2>/dev/null; then
                echo "   强制终止进程 PID: $pid"
                kill -9 $pid 2>/dev/null
            fi
        done
        
        # 等待进程完全终止
        echo "⏳ 等待进程完全终止..."
        sleep 3
        
        # 再次检查
        local remaining_pids=$(lsof -ti:$port 2>/dev/null)
        if [ -n "$remaining_pids" ]; then
            echo "⚠️  警告: 端口 $port 仍被以下进程占用："
            lsof -i:$port 2>/dev/null | grep LISTEN
            echo "🔧 尝试更强力的清理..."
            
            # 最后一次尝试
            for pid in $remaining_pids; do
                echo "   最后尝试终止进程 PID: $pid"
                kill -9 $pid 2>/dev/null
                # 使用 pkill 作为备选
                pkill -f "node.*$port" 2>/dev/null
            done
            
            sleep 2
            
            # 最终检查
            if [ -n "$(lsof -ti:$port 2>/dev/null)" ]; then
                echo "❌ 端口 $port 仍被占用，可能需要手动处理"
                echo "💡 建议手动执行: sudo lsof -ti:$port | xargs kill -9"
                return 1
            else
                echo "✅ 端口 $port 已释放"
                return 0
            fi
        else
            echo "✅ 端口 $port 已成功释放"
            return 0
        fi
    else
        echo "✅ 端口 $port 未被占用"
        return 0
    fi
}

# 检查数据库连接
check_database() {
    echo "🔍 检查数据库连接..."
    
    # 检查.env文件
    if [ ! -f ".env" ]; then
        echo "⚠️  未找到 .env 文件，使用默认数据库配置"
    else
        echo "✅ 找到 .env 配置文件"
    fi
    
    # 简单的数据库连接测试
    node -e "
    const mysql = require('mysql2/promise');
    require('dotenv').config();
    
    async function testDB() {
        try {
            console.log('🔍 测试数据库连接...');
            console.log('配置信息:');
            console.log('Host:', process.env.DB_HOST || 'dbconn.sealoshzh.site');
            console.log('Port:', process.env.DB_PORT || 43906);
            console.log('Database:', process.env.DB_NAME || 'kargerdensales');
            console.log('User:', process.env.DB_USER || 'root');
            
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
                port: process.env.DB_PORT || 43906,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'pwk5ls7j',
                database: process.env.DB_NAME || 'kargerdensales'
            });
            console.log('✅ 数据库连接测试成功');
            await connection.end();
        } catch (error) {
            console.log('❌ 数据库连接测试失败:', error.message);
            console.log('⚠️  服务仍会启动，但可能无法正常工作');
        }
    }
    testDB();
    " 2>/dev/null || echo "⚠️  无法进行数据库连接测试（可能缺少mysql2模块）"
}

# 启动后端服务
start_backend() {
    echo "🚀 启动后端开发服务器..."
    echo "API访问地址: http://localhost:$PORT"
    echo "健康检查: http://localhost:$PORT/health"
    echo "按 Ctrl+C 停止服务"
    echo "=========================="
    
    # 启动后端服务
    npm run dev
}

# 主逻辑
main() {
    echo "🔧 $SERVICE_NAME 智能启动检测..."
    
    # 使用智能端口检测
    smart_port_check $PORT "$SERVICE_NAME"
    
    if [ $? -ne 0 ]; then
        echo "❌ 端口 $PORT 清理失败，请手动检查"
        echo "💡 手动清理命令: lsof -ti:$PORT | xargs kill -9"
        exit 1
    fi
    
    # 确保在正确的目录
    if [ ! -f "package.json" ]; then
        echo "❌ 错误: 未找到 package.json 文件"
        echo "请确保在后端项目根目录下运行此脚本"
        exit 1
    fi
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 检测到缺少依赖，正在安装..."
        npm install
    fi
    
    # 检查数据库连接
    check_database
    
    echo ""
    start_backend
}

# 捕获 Ctrl+C 信号，优雅退出
trap 'echo -e "\n🛑 正在停止后端服务..."; exit 0' INT

# 运行主逻辑
main 