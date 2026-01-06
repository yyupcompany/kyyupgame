#!/bin/bash
# 启动自动构建运行器的便捷脚本

echo "🚀 启动自动构建运行器..."
echo "项目目录: $(pwd)"
echo "Node版本: $(node --version)"
echo "NPM版本: $(npm --version)"
echo ""

# 域名配置
FRONTEND_DOMAIN="https://k.yyup.cc"
BACKEND_DOMAIN="https://shlxlyzagqnc.sealoshzh.site"

echo "前端域名: $FRONTEND_DOMAIN"
echo "后端域名: $BACKEND_DOMAIN"
echo ""
echo "注意: 按 Ctrl+C 可以随时停止程序"
echo "========================================================"

# 项目路径配置
PROJECT_ROOT="/home/devbox/project"
CLIENT_DIR="$PROJECT_ROOT/client"
SERVER_DIR="$PROJECT_ROOT/server"

# 启动服务器函数
start_servers() {
    echo "🚀 开始启动前后端服务器..."
    
    # 确保在项目根目录
    cd "$PROJECT_ROOT" || exit 1
    
    # 后端在外网运行，不需要本地启动
    echo "✅ 后端服务器在外网运行: https://shlxlyzagqnc.sealoshzh.site"
    
    # 启动前端服务器
    echo "🔄 启动前端服务器..."
    cd "$CLIENT_DIR" || exit 1
    
    # 检查node_modules是否存在，如果不存在则安装依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装前端依赖..."
        npm install
    fi
    
    # 后台启动前端
    nohup npm run dev > "../client.log" 2>&1 &
    echo "✅ 前端服务器启动中... (日志: client.log)"
    
    # 回到项目根目录
    cd "$PROJECT_ROOT" || exit 1
    
    echo "⏳ 等待服务器启动完成..."
    sleep 10
    
    # 检查服务器启动状态
    echo "🔍 验证服务器启动状态..."
    if ! check_server_status; then
        echo "❌ 服务器启动失败，开始自动修复..."
        fix_compilation_errors
    fi
}

# 服务器状态检测函数
check_server_status() {
    echo "🔍 检测服务器状态..."
    
    # 检测前端服务器 (默认端口5173)
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200\|404\|302"; then
        echo "✅ 前端服务器正常运行"
        frontend_running=true
    else
        echo "❌ 前端服务器未响应"
        frontend_running=false
    fi
    
    # 检测后端服务器 (外网域名)
    if curl -s -o /dev/null -w "%{http_code}" https://shlxlyzagqnc.sealoshzh.site | grep -q "200\|404\|302"; then
        echo "✅ 后端服务器正常运行"
        backend_running=true
    else
        echo "❌ 后端服务器未响应"
        backend_running=false
    fi
    
    # 如果任一服务器不在线，返回失败
    if [ "$frontend_running" = false ] || [ "$backend_running" = false ]; then
        return 1
    else
        return 0
    fi
}

# 监控循环函数
monitor_and_restart() {
    while true; do
        echo ""
        echo "⏰ $(date): 开始服务器状态检测..."
        
        if check_server_status; then
            echo "✅ 所有服务器运行正常，等待下次检测..."
            sleep 120  # 2分钟后再次检测
        else
            echo "⚠️  检测到服务器异常，启动重新编译流程..."
            echo "========================================================"
            
            # 前后端都在外网运行，不需要杀死任何进程
            echo "✅ 前后端都在外网运行，跳过进程清理"
            
            sleep 3
            
            # 重新启动构建流程
            echo "🚀 重新启动自动构建流程..."
            start_servers
            
            # 构建完成后等待2分钟再检测
            echo "⏳ 等待2分钟后开始状态检测..."
            sleep 120
        fi
    done
}

# 主程序流程
main() {
    # 首先检查服务器状态
    echo "🔍 检查当前服务器状态..."
    if check_server_status; then
        echo "✅ 服务器已运行，跳过构建直接进入监控模式..."
    else
        echo "❌ 服务器未运行，开始构建流程..."
        start_servers
        
        # 构建完成后等待2分钟
        echo ""
        echo "⏳ 构建完成，等待2分钟后开始监控..."
        sleep 120
    fi
    
    # 开始监控循环
    echo "🎯 开始服务器状态监控循环..."
    monitor_and_restart
}

# 信号处理函数
cleanup() {
    echo ""
    echo "🛑 接收到停止信号，正在清理本项目进程..."
    echo "只清理端口3000和5173的进程，保护其他项目"
    
    # 前后端都在外网运行，不需要杀死任何进程
    echo "✅ 前后端都在外网运行，跳过进程清理"
    
    echo "👋 程序已停止"
    exit 0
}

# 设置信号处理
trap cleanup INT TERM

# 启动主程序
main