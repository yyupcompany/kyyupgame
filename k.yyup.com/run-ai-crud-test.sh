#!/bin/bash

##############################################################################
# AI接口CRUD测试 - 一键运行脚本
# 功能：自动启动后端服务并运行完整测试
# 使用：chmod +x run-ai-crud-test.sh && ./run-ai-crud-test.sh
##############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 检查后端服务
check_backend() {
    print_step "检查后端服务状态..."
    
    if curl -s http://localhost:3000/api-docs > /dev/null 2>&1; then
        print_success "后端服务已运行"
        return 0
    else
        print_info "后端服务未运行"
        return 1
    fi
}

# 启动后端服务
start_backend() {
    print_header "启动后端服务"
    
    if [ ! -d "server" ]; then
        print_error "找不到server目录！"
        exit 1
    fi
    
    print_step "进入server目录并启动服务..."
    cd server
    
    # 检查是否已安装依赖
    if [ ! -d "node_modules" ]; then
        print_info "未找到node_modules，正在安装依赖..."
        npm install
    fi
    
    # 后台启动服务
    print_step "启动后端服务（后台运行）..."
    npm run dev > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    
    echo $BACKEND_PID > /tmp/backend.pid
    
    print_info "后端进程 PID: $BACKEND_PID"
    print_step "等待服务启动（最多30秒）..."
    
    # 等待服务启动
    for i in {1..30}; do
        if curl -s http://localhost:3000/api-docs > /dev/null 2>&1; then
            print_success "后端服务启动成功！"
            cd ..
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    echo ""
    print_error "后端服务启动超时！"
    print_info "查看日志: tail -f /tmp/backend.log"
    exit 1
}

# 运行测试
run_tests() {
    print_header "运行AI接口CRUD测试"
    
    print_step "选择测试脚本："
    echo "1) Node.js版本（推荐）"
    echo "2) Bash版本"
    read -p "请选择 [1/2]: " choice
    
    case $choice in
        1)
            print_step "运行Node.js测试脚本..."
            node test-ai-crud.cjs
            ;;
        2)
            print_step "运行Bash测试脚本..."
            ./test-ai-crud.sh
            ;;
        *)
            print_error "无效选择，默认使用Node.js版本"
            node test-ai-crud.cjs
            ;;
    esac
}

# 清理函数
cleanup() {
    print_header "清理环境"
    
    if [ -f /tmp/backend.pid ]; then
        BACKEND_PID=$(cat /tmp/backend.pid)
        print_step "停止后端服务（PID: $BACKEND_PID）..."
        kill $BACKEND_PID 2>/dev/null || true
        rm /tmp/backend.pid
        print_success "后端服务已停止"
    fi
}

# 注册退出清理
trap cleanup EXIT

# 主流程
main() {
    clear
    
    print_header "🚀 AI接口CRUD测试 - 一键运行"
    
    print_info "工作目录: $(pwd)"
    echo ""
    
    # 检查后端服务
    if ! check_backend; then
        read -p "是否需要启动后端服务？[Y/n]: " start_service
        
        if [[ $start_service =~ ^[Yy]$ ]] || [ -z "$start_service" ]; then
            start_backend
            sleep 2
        else
            print_error "后端服务未运行，测试无法继续"
            exit 1
        fi
    fi
    
    # 运行测试
    run_tests
    
    print_header "测试完成"
    
    read -p "是否停止后端服务？[y/N]: " stop_service
    
    if [[ $stop_service =~ ^[Yy]$ ]]; then
        cleanup
    else
        print_info "后端服务继续运行"
        print_info "查看日志: tail -f /tmp/backend.log"
        if [ -f /tmp/backend.pid ]; then
            print_info "停止服务: kill $(cat /tmp/backend.pid)"
        fi
        trap - EXIT  # 取消自动清理
    fi
}

# 运行主函数
main
