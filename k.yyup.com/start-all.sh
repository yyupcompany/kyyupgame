#!/bin/bash

# 幼儿园管理系统启动脚本
# 支持启动前端、后端或全部服务

set -e  # 错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 端口检查和清理函数
check_and_kill_port() {
    local port=$1
    local process_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "端口 $port 被占用，正在清理..."
        if command -v lsof >/dev/null 2>&1; then
            local pids=$(lsof -Pi :$port -sTCP:LISTEN -t)
            if [ -n "$pids" ]; then
                echo $pids | xargs kill -9 2>/dev/null || true
                log_info "已清理端口 $port 上的进程"
            fi
        elif command -v fuser >/dev/null 2>&1; then
            fuser -k $port/tcp 2>/dev/null || true
            log_info "已清理端口 $port 上的进程"
        else
            log_warn "无法清理端口 $port，请手动清理"
        fi
        sleep 2
    fi
}

# 检查依赖安装
check_dependencies() {
    log_info "检查项目依赖..."
    
    # 检查前端依赖
    if [ ! -d "client/node_modules" ]; then
        log_warn "前端依赖未安装，正在安装..."
        cd client && npm install && cd ..
        log_success "前端依赖安装完成"
    fi
    
    # 检查后端依赖
    if [ ! -d "server/node_modules" ]; then
        log_warn "后端依赖未安装，正在安装..."
        cd server && npm install && cd ..
        log_success "后端依赖安装完成"
    fi
}

# 设置代理环境变量
setup_proxy() {
    log_info "设置代理环境变量..."
    source scripts/setup-proxy.sh
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    check_and_kill_port 3000 "后端服务"

    # 设置代理环境变量
    setup_proxy

    cd server
    if [ -f "scripts/kill-ports.sh" ]; then
        bash scripts/kill-ports.sh
    fi

    log_info "启动 Express 服务器 (端口 3000)..."
    npm run dev &
    BACKEND_PID=$!
    cd ..

    # 等待后端启动
    sleep 5
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        log_success "后端服务启动成功 (PID: $BACKEND_PID)"
        echo $BACKEND_PID > .backend.pid
    else
        log_error "后端服务启动失败"
        return 1
    fi
}

# 启动前端服务
start_frontend() {
    log_info "启动前端服务..."
    check_and_kill_port 5173 "前端服务"

    # 设置代理环境变量
    setup_proxy

    cd client
    if [ -f "scripts/kill-ports.sh" ]; then
        bash scripts/kill-ports.sh
    fi

    log_info "启动 Vite 开发服务器 (端口 5173)..."
    npm run dev &
    FRONTEND_PID=$!
    cd ..

    # 等待前端启动
    sleep 5
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        log_success "前端服务启动成功 (PID: $FRONTEND_PID)"
        echo $FRONTEND_PID > .frontend.pid
    else
        log_error "前端服务启动失败"
        return 1
    fi
}

# 停止服务
stop_services() {
    log_info "停止所有服务..."
    
    # 停止前端
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill $FRONTEND_PID 2>/dev/null || true
            log_info "已停止前端服务 (PID: $FRONTEND_PID)"
        fi
        rm -f .frontend.pid
    fi
    
    # 停止后端
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill $BACKEND_PID 2>/dev/null || true
            log_info "已停止后端服务 (PID: $BACKEND_PID)"
        fi
        rm -f .backend.pid
    fi
    
    # 强制清理端口
    check_and_kill_port 3000 "后端"
    check_and_kill_port 5173 "前端"
    
    log_success "所有服务已停止"
}

# 显示服务状态
show_status() {
    log_info "检查服务状态..."
    
    # 检查前端状态
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            log_success "前端服务运行中 (PID: $FRONTEND_PID, 端口: 5173)"
        else
            log_warn "前端服务未运行 (PID文件存在但进程不存在)"
            rm -f .frontend.pid
        fi
    else
        log_warn "前端服务未运行"
    fi
    
    # 检查后端状态
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            log_success "后端服务运行中 (PID: $BACKEND_PID, 端口: 3000)"
        else
            log_warn "后端服务未运行 (PID文件存在但进程不存在)"
            rm -f .backend.pid
        fi
    else
        log_warn "后端服务未运行"
    fi
    
    # 端口检查
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_info "端口 3000 (后端) 被占用"
    fi
    
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_info "端口 5173 (前端) 被占用"
    fi
}

# 显示使用帮助
show_help() {
    echo "幼儿园管理系统启动脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start         启动前后端服务 (默认)"
    echo "  frontend      只启动前端服务"
    echo "  backend       只启动后端服务"
    echo "  all           启动前后端服务"
    echo "  stop          停止所有服务"
    echo "  status        显示服务状态"
    echo "  restart       重启所有服务"
    echo "  help          显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0              # 启动所有服务"
    echo "  $0 frontend     # 只启动前端"
    echo "  $0 backend      # 只启动后端"
    echo "  $0 stop         # 停止所有服务"
}

# 主逻辑
case "${1:-start}" in
    "start"|"all")
        log_info "启动幼儿园管理系统..."
        check_dependencies
        start_backend
        start_frontend
        log_success "所有服务启动完成！"
        echo ""
        echo "访问地址:"
        echo "  前端: http://localhost:5173 或 http://k.yyup.cc"
        echo "  后端: http://localhost:3000/api"
        echo ""
        echo "使用 '$0 stop' 停止服务"
        ;;
        
    "frontend")
        log_info "启动前端服务..."
        check_dependencies
        start_frontend
        log_success "前端服务启动完成！访问: http://localhost:5173"
        ;;
        
    "backend")
        log_info "启动后端服务..."
        check_dependencies
        start_backend
        log_success "后端服务启动完成！API: http://localhost:3000/api"
        ;;
        
    "stop")
        stop_services
        ;;
        
    "status")
        show_status
        ;;
        
    "restart")
        log_info "重启所有服务..."
        stop_services
        sleep 2
        check_dependencies
        start_backend
        start_frontend
        log_success "服务重启完成！"
        ;;
        
    "help"|"-h"|"--help")
        show_help
        ;;
        
    *)
        log_error "未知命令: $1"
        show_help
        exit 1
        ;;
esac