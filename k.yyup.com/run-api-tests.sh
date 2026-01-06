#!/bin/bash

# API集成测试执行脚本
# 使用方式: ./run-api-tests.sh [OPTIONS]
# 选项:
#   --db-check      先执行数据库检查
#   --auto-fix      自动修复数据库问题
#   --url URL       指定API测试地址
#   --env ENV       指定环境 (dev/test/prod)

set -e  # 遇到错误就退出

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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "API集成测试执行脚本"
    echo ""
    echo "使用方式:"
    echo "  $0 [OPTIONS]"
    echo ""
    echo "选项:"
    echo "  --db-check         先执行数据库完整性检查"
    echo "  --auto-fix         自动修复数据库问题"
    echo "  --url URL          指定API测试地址 (默认: https://k.yyup.cc/api)"
    echo "  --env ENV          指定环境 dev/test/prod (默认: prod)"
    echo "  --no-deps          跳过依赖检查"
    echo "  --help             显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                                    # 基本API测试"
    echo "  $0 --db-check --auto-fix             # 先检查修复数据库，再测试API"
    echo "  $0 --url http://localhost:3000/api   # 测试本地API"
    echo ""
}

# 默认配置
DB_CHECK=false
AUTO_FIX=false
API_URL="https://k.yyup.cc/api"
ENVIRONMENT="prod"
CHECK_DEPS=true
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --db-check)
            DB_CHECK=true
            shift
            ;;
        --auto-fix)
            AUTO_FIX=true
            shift
            ;;
        --url)
            API_URL="$2"
            shift 2
            ;;
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --no-deps)
            CHECK_DEPS=false
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查依赖
check_dependencies() {
    log_info "检查运行环境和依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2)
    log_info "Node.js 版本: v${node_version}"
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    # 检查必需的npm包
    local required_packages=("axios" "mysql2")
    local missing_packages=()
    
    for package in "${required_packages[@]}"; do
        if ! npm list "$package" &> /dev/null; then
            missing_packages+=("$package")
        fi
    done
    
    if [ ${#missing_packages[@]} -gt 0 ]; then
        log_warning "缺少依赖包: ${missing_packages[*]}"
        log_info "正在安装缺少的依赖..."
        
        for package in "${missing_packages[@]}"; do
            npm install "$package" || {
                log_error "安装 $package 失败"
                exit 1
            }
        done
        
        log_success "依赖安装完成"
    else
        log_success "所有依赖已就绪"
    fi
}

# 检查文件是否存在
check_files() {
    log_info "检查测试脚本文件..."
    
    local required_files=(
        "api-integration-test.cjs"
        "database-integrity-check.cjs"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$SCRIPT_DIR/$file" ]; then
            log_error "缺少文件: $file"
            exit 1
        fi
    done
    
    log_success "所有测试脚本文件存在"
}

# 数据库检查
run_database_check() {
    log_info "开始数据库完整性检查..."
    
    local db_cmd="node $SCRIPT_DIR/database-integrity-check.cjs"
    
    if [ "$AUTO_FIX" = true ]; then
        db_cmd="$db_cmd --auto-fix"
        log_info "启用自动修复模式"
    fi
    
    if $db_cmd; then
        log_success "数据库检查完成"
        return 0
    else
        log_error "数据库检查失败"
        return 1
    fi
}

# API测试
run_api_tests() {
    log_info "开始API集成测试..."
    log_info "测试地址: $API_URL"
    log_info "测试环境: $ENVIRONMENT"
    
    # 设置环境变量
    export API_BASE_URL="$API_URL"
    export NODE_ENV="$ENVIRONMENT"
    
    # 执行API测试
    if node "$SCRIPT_DIR/api-integration-test.cjs"; then
        log_success "API测试完成"
        return 0
    else
        log_error "API测试失败"
        return 1
    fi
}

# 生成汇总报告
generate_summary() {
    log_info "生成测试汇总报告..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local summary_file="test-summary-${timestamp}.md"
    
    cat > "$summary_file" << EOF
# API集成测试汇总报告

**执行时间**: $(date)  
**测试环境**: $ENVIRONMENT  
**API地址**: $API_URL  
**数据库检查**: $([ "$DB_CHECK" = true ] && echo "是" || echo "否")  
**自动修复**: $([ "$AUTO_FIX" = true ] && echo "是" || echo "否")  

## 执行步骤

1. **环境检查**: ✅ 通过
2. **依赖检查**: ✅ 通过
EOF

    if [ "$DB_CHECK" = true ]; then
        echo "3. **数据库检查**: $([ -f "database-check-report-"*.json ] && echo "✅ 通过" || echo "❌ 失败")" >> "$summary_file"
        echo "4. **API测试**: $([ -f "api-test-report-"*.json ] && echo "✅ 完成" || echo "❌ 失败")" >> "$summary_file"
    else
        echo "3. **API测试**: $([ -f "api-test-report-"*.json ] && echo "✅ 完成" || echo "❌ 失败")" >> "$summary_file"
    fi
    
    cat >> "$summary_file" << EOF

## 生成的报告文件

EOF

    # 列出生成的报告文件
    for file in database-check-report-*.json api-test-report-*.json api-test-summary-*.md; do
        if [ -f "$file" ]; then
            echo "- $file" >> "$summary_file"
        fi
    done
    
    cat >> "$summary_file" << EOF

## 下一步行动

- 查看详细测试报告
- 修复发现的问题
- 重新运行失败的测试用例
- 准备生产环境部署

---
*报告生成时间: $(date)*
EOF

    log_success "汇总报告已生成: $summary_file"
}

# 清理旧的报告文件
cleanup_old_reports() {
    log_info "清理旧的测试报告..."
    
    # 保留最近5个报告文件
    local patterns=("database-check-report-*.json" "api-test-report-*.json" "api-test-summary-*.md" "test-summary-*.md")
    
    for pattern in "${patterns[@]}"; do
        local files=($(ls -t $pattern 2>/dev/null || true))
        if [ ${#files[@]} -gt 5 ]; then
            for ((i=5; i<${#files[@]}; i++)); do
                rm -f "${files[$i]}"
                log_info "删除旧报告: ${files[$i]}"
            done
        fi
    done
}

# 主执行流程
main() {
    echo "🚀 API集成测试开始执行"
    echo "======================================"
    
    # 清理旧报告
    cleanup_old_reports
    
    # 检查依赖
    if [ "$CHECK_DEPS" = true ]; then
        check_dependencies
    fi
    
    # 检查文件
    check_files
    
    local overall_success=true
    
    # 数据库检查 (可选)
    if [ "$DB_CHECK" = true ]; then
        echo ""
        echo "🔍 Phase 1: 数据库完整性检查"
        echo "======================================"
        
        if ! run_database_check; then
            overall_success=false
            if [ "$AUTO_FIX" = false ]; then
                log_error "数据库检查失败，建议使用 --auto-fix 选项"
                exit 1
            fi
        fi
    fi
    
    # API测试
    echo ""
    echo "🧪 Phase 2: API集成测试"
    echo "======================================"
    
    if ! run_api_tests; then
        overall_success=false
    fi
    
    # 生成汇总报告
    echo ""
    echo "📊 Phase 3: 生成汇总报告"
    echo "======================================"
    
    generate_summary
    
    # 最终结果
    echo ""
    echo "🎯 测试执行完成"
    echo "======================================"
    
    if [ "$overall_success" = true ]; then
        log_success "所有测试通过！✨"
        echo ""
        echo "📋 可以查看的报告文件:"
        ls -la *report-*.json *summary-*.md 2>/dev/null || true
        echo ""
        echo "🚀 系统已准备好进行生产部署！"
        exit 0
    else
        log_warning "发现问题，请查看详细报告"
        echo ""
        echo "📋 生成的报告文件:"
        ls -la *report-*.json *summary-*.md 2>/dev/null || true
        echo ""
        echo "🔧 建议先修复问题，然后重新运行测试"
        exit 1
    fi
}

# 信号处理
trap 'log_error "测试被中断"; exit 130' INT TERM

# 执行主流程
main "$@"