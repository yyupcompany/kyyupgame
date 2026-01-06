#!/bin/bash

# Claude Code SDK 安装脚本
# 自动安装Claude Code CLI和Python SDK

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查系统要求
check_requirements() {
    print_info "检查系统要求..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 未安装，请先安装 Python 3"
        exit 1
    fi
    
    # 检查pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 未安装，请先安装 pip3"
        exit 1
    fi
    
    print_success "系统要求检查通过"
}

# 安装Claude Code CLI
install_claude_cli() {
    print_info "安装 Claude Code CLI..."
    
    if command -v claude &> /dev/null; then
        print_warning "Claude Code CLI 已安装，跳过"
        return
    fi
    
    npm install -g @anthropic-ai/claude-code
    
    if command -v claude &> /dev/null; then
        print_success "Claude Code CLI 安装成功"
    else
        print_error "Claude Code CLI 安装失败"
        exit 1
    fi
}

# 安装Python依赖
install_python_deps() {
    print_info "安装 Python 依赖..."
    
    # 检查是否已安装
    if python3 -c "import claude_code_sdk, anyio" &> /dev/null; then
        print_warning "Python 依赖已安装，跳过"
        return
    fi
    
    pip3 install claude-code-sdk anyio
    
    if python3 -c "import claude_code_sdk, anyio" &> /dev/null; then
        print_success "Python 依赖安装成功"
    else
        print_error "Python 依赖安装失败"
        exit 1
    fi
}

# 设置API密钥
setup_api_key() {
    print_info "设置 API 密钥..."
    
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        print_success "API 密钥已设置"
        return
    fi
    
    print_warning "ANTHROPIC_API_KEY 环境变量未设置"
    echo ""
    echo "请按以下步骤设置 API 密钥："
    echo "1. 访问 https://console.anthropic.com/"
    echo "2. 创建或获取你的 API 密钥"
    echo "3. 运行以下命令设置环境变量："
    echo ""
    echo "   export ANTHROPIC_API_KEY='your-api-key-here'"
    echo ""
    echo "4. 或者将以下行添加到 ~/.bashrc 或 ~/.zshrc："
    echo ""
    echo "   export ANTHROPIC_API_KEY='your-api-key-here'"
    echo ""
    
    read -p "是否现在设置 API 密钥？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "请输入你的 API 密钥: " api_key
        if [ -n "$api_key" ]; then
            export ANTHROPIC_API_KEY="$api_key"
            echo "export ANTHROPIC_API_KEY='$api_key'" >> ~/.bashrc
            print_success "API 密钥已设置并保存到 ~/.bashrc"
        else
            print_warning "API 密钥为空，跳过设置"
        fi
    fi
}

# 运行测试
run_test() {
    print_info "运行测试..."
    
    if [ ! -f "test_claude_code.py" ]; then
        print_error "测试文件不存在"
        return
    fi
    
    python3 test_claude_code.py
}

# 显示使用说明
show_usage() {
    echo ""
    print_info "安装完成！使用说明："
    echo ""
    echo "1. 测试安装："
    echo "   python3 test_claude_code.py"
    echo ""
    echo "2. 查看所有页面："
    echo "   python3 auto_fix_pages.py --list"
    echo ""
    echo "3. 修复特定分类的页面："
    echo "   python3 auto_fix_pages.py --category system"
    echo ""
    echo "4. 使用Shell脚本："
    echo "   ./run_auto_fix.sh --help"
    echo ""
    echo "5. 检查依赖："
    echo "   ./run_auto_fix.sh --check"
    echo ""
    print_warning "注意：使用 Claude API 会产生费用，请合理使用"
}

# 主函数
main() {
    echo "🚀 Claude Code SDK 安装脚本"
    echo "=" * 50
    
    check_requirements
    install_claude_cli
    install_python_deps
    setup_api_key
    
    echo ""
    echo "=" * 50
    print_success "安装完成！"
    
    # 如果API密钥已设置，运行测试
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        echo ""
        run_test
    fi
    
    show_usage
}

# 错误处理
trap 'print_error "安装过程中出现错误"; exit 1' ERR

# 运行主函数
main "$@"
