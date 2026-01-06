#!/bin/bash

###############################################################################
# 移动端测试脚本 - Chrome DevTools 方案
# 用途: 一键启动前端服务并在Chrome中打开移动端模拟器
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Chrome是否安装
check_chrome() {
    if command -v google-chrome &> /dev/null; then
        CHROME_CMD="google-chrome"
    elif command -v chromium &> /dev/null; then
        CHROME_CMD="chromium"
    elif command -v chromium-browser &> /dev/null; then
        CHROME_CMD="chromium-browser"
    else
        print_error "未找到Chrome或Chromium浏览器"
        print_info "请安装Chrome: sudo apt install google-chrome-stable"
        exit 1
    fi
    print_success "找到浏览器: $CHROME_CMD"
}

# 检查前端服务是否运行
check_frontend() {
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "前端服务已运行 (http://localhost:5173)"
        return 0
    else
        print_warning "前端服务未运行，正在启动..."
        return 1
    fi
}

# 启动前端服务
start_frontend() {
    print_info "启动前端开发服务器..."
    cd client
    npm run dev &
    FRONTEND_PID=$!
    
    # 等待服务启动
    print_info "等待前端服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            print_success "前端服务启动成功！"
            cd ..
            return 0
        fi
        sleep 1
    done
    
    print_error "前端服务启动超时"
    cd ..
    exit 1
}

# 打开Chrome移动端模拟器
open_mobile_simulator() {
    local device=${1:-"iPhone 12 Pro"}
    local url="http://k.yyup.cc"
    
    print_info "打开Chrome移动端模拟器..."
    print_info "设备: $device"
    print_info "URL: $url"
    
    # 创建临时用户数据目录
    TEMP_DIR="/tmp/chrome-mobile-test-$$"
    mkdir -p "$TEMP_DIR"
    
    # 启动Chrome并自动打开DevTools
    $CHROME_CMD \
        --user-data-dir="$TEMP_DIR" \
        --auto-open-devtools-for-tabs \
        --window-size=1200,900 \
        "$url" &
    
    CHROME_PID=$!
    
    print_success "Chrome已启动 (PID: $CHROME_PID)"
    print_info ""
    print_info "📱 使用说明："
    print_info "1. 按 F12 打开开发者工具（如果未自动打开）"
    print_info "2. 点击左上角的设备图标（Toggle device toolbar）或按 Ctrl+Shift+M"
    print_info "3. 选择设备型号: $device"
    print_info "4. 开始测试移动端功能"
    print_info ""
    print_info "💡 常用设备："
    print_info "   - iPhone 12 Pro (390x844)"
    print_info "   - iPhone SE (375x667)"
    print_info "   - iPad Air (820x1180)"
    print_info "   - Samsung Galaxy S20 (360x800)"
    print_info "   - Pixel 5 (393x851)"
    print_info ""
    print_warning "按 Ctrl+C 停止所有服务"
}

# 清理函数
cleanup() {
    print_info ""
    print_info "正在清理..."
    
    if [ ! -z "$FRONTEND_PID" ]; then
        print_info "停止前端服务 (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$CHROME_PID" ]; then
        print_info "停止Chrome (PID: $CHROME_PID)"
        kill $CHROME_PID 2>/dev/null || true
    fi
    
    # 清理临时目录
    if [ ! -z "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
    
    print_success "清理完成"
    exit 0
}

# 注册清理函数
trap cleanup SIGINT SIGTERM EXIT

# 主函数
main() {
    print_info "========================================="
    print_info "  移动端测试工具 - Chrome DevTools"
    print_info "========================================="
    print_info ""
    
    # 检查Chrome
    check_chrome
    
    # 检查并启动前端服务
    if ! check_frontend; then
        start_frontend
    fi
    
    # 获取设备参数
    DEVICE=${1:-"iPhone 12 Pro"}
    
    # 打开移动端模拟器
    open_mobile_simulator "$DEVICE"
    
    # 保持脚本运行
    print_info ""
    print_success "移动端测试环境已就绪！"
    print_info "按 Ctrl+C 停止所有服务"
    
    # 等待用户中断
    while true; do
        sleep 1
    done
}

# 运行主函数
main "$@"

