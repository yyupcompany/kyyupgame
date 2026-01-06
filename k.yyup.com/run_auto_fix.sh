#!/bin/bash

# 自动化页面修复脚本启动器
# 使用Claude Code SDK批量修复前端页面

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 未安装"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查Claude Code CLI
    if ! command -v claude &> /dev/null; then
        print_warning "Claude Code CLI 未安装，正在安装..."
        npm install -g @anthropic-ai/claude-code
    fi
    
    # 检查Python依赖
    if ! python3 -c "import claude_code_sdk, anyio" &> /dev/null; then
        print_warning "Python依赖未安装，正在安装..."
        pip3 install claude-code-sdk anyio
    fi
    
    print_success "依赖检查完成"
}

# 检查API密钥
check_api_key() {
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        print_error "ANTHROPIC_API_KEY 环境变量未设置"
        print_info "请设置API密钥: export ANTHROPIC_API_KEY='your-api-key'"
        exit 1
    fi
    print_success "API密钥已设置"
}

# 显示帮助信息
show_help() {
    echo "自动化页面修复脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --help              显示此帮助信息"
    echo "  --check             只检查依赖，不执行修复"
    echo "  --list              列出所有页面"
    echo "  --reset             重置进度，从头开始"
    echo "  --category <类型>   只修复指定分类的页面"
    echo "  --priority <数字>   只修复指定优先级的页面"
    echo "  --dry-run           模拟运行，不实际修复"
    echo ""
    echo "分类选项:"
    echo "  system      系统管理页面"
    echo "  education   教育管理页面"
    echo "  enrollment  招生管理页面"
    echo "  activity    活动管理页面"
    echo "  ai          AI系统页面"
    echo "  principal   园长功能页面"
    echo "  business    业务扩展页面"
    echo ""
    echo "优先级选项:"
    echo "  1-8         数字越小优先级越高"
    echo ""
    echo "示例:"
    echo "  $0                           # 修复所有页面"
    echo "  $0 --category system         # 只修复系统管理页面"
    echo "  $0 --priority 1              # 只修复优先级1的页面"
    echo "  $0 --reset --category system # 重置并修复系统管理页面"
}

# 显示进度
show_progress() {
    if [ -f ".auto_fix_progress.json" ]; then
        print_info "当前进度:"
        if command -v jq &> /dev/null; then
            completed=$(jq -r '.completed | length' .auto_fix_progress.json)
            failed=$(jq -r '.failed | length' .auto_fix_progress.json)
            echo "  ✅ 已完成: $completed"
            echo "  ❌ 已失败: $failed"
        else
            echo "  进度文件存在，使用 --reset 重新开始"
        fi
    else
        print_info "没有找到进度文件，将从头开始"
    fi
}

# 主函数
main() {
    print_info "🚀 自动化页面修复脚本"
    
    # 解析命令行参数
    ARGS=()
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help)
                show_help
                exit 0
                ;;
            --check)
                check_dependencies
                check_api_key
                print_success "所有检查通过"
                exit 0
                ;;
            --dry-run)
                print_warning "模拟运行模式（暂未实现）"
                exit 0
                ;;
            *)
                ARGS+=("$1")
                ;;
        esac
        shift
    done
    
    # 检查依赖和API密钥
    check_dependencies
    check_api_key
    
    # 显示当前进度
    show_progress
    
    # 确认执行
    if [ ${#ARGS[@]} -eq 0 ]; then
        print_warning "即将修复所有页面，这可能需要较长时间并产生API费用"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "已取消"
            exit 0
        fi
    fi
    
    # 执行Python脚本
    print_info "开始执行修复..."
    python3 auto_fix_pages.py "${ARGS[@]}"
    
    # 显示最终结果
    if [ $? -eq 0 ]; then
        print_success "修复完成！"
        if [ -f ".auto_fix_progress.json" ] && command -v jq &> /dev/null; then
            completed=$(jq -r '.completed | length' .auto_fix_progress.json)
            failed=$(jq -r '.failed | length' .auto_fix_progress.json)
            echo ""
            print_info "最终统计:"
            echo "  ✅ 成功: $completed"
            echo "  ❌ 失败: $failed"
            
            if [ "$failed" -gt 0 ]; then
                print_warning "有失败的页面，请查看日志: auto_fix.log"
            fi
        fi
    else
        print_error "修复过程中出现错误"
        exit 1
    fi
}

# 错误处理
trap 'print_error "脚本被中断"; exit 1' INT TERM

# 运行主函数
main "$@"
