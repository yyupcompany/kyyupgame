#!/bin/bash

# 布局组件测试运行脚本
# 此脚本用于运行所有布局组件的测试并生成报告

echo "🧪 开始运行布局组件测试..."
echo "================================"

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试文件列表
TEST_FILES=(
    "PageContainer.test.ts"
    "OptimizedHeaderActions.test.ts"
    "MenuItemComponent.test.ts"
    "ImprovedSidebar.test.ts"
    "Breadcrumb.test.ts"
)

# 函数：运行单个测试文件
run_test() {
    local test_file=$1
    echo -e "${BLUE}📋 运行测试: $test_file${NC}"
    
    # 运行测试并捕获结果
    if npm test -- "$test_file" -- --run --reporter=verbose; then
        echo -e "${GREEN}✅ $test_file 测试通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $test_file 测试失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo "--------------------------------"
}

# 函数：运行覆盖率测试
run_coverage_test() {
    echo -e "${BLUE}📊 运行覆盖率测试...${NC}"
    
    if npm run test:coverage -- --include="src/components/layout/**/*" --exclude="**/*.test.ts"; then
        echo -e "${GREEN}✅ 覆盖率测试完成${NC}"
    else
        echo -e "${RED}❌ 覆盖率测试失败${NC}"
    fi
}

# 函数：生成测试报告
generate_report() {
    echo -e "${BLUE}📄 生成测试报告...${NC}"
    
    # 创建报告目录
    mkdir -p reports/layout-tests
    
    # 生成测试结果报告
    cat > reports/layout-tests/test-summary.md << EOF
# 布局组件测试报告

## 测试执行时间
$(date)

## 测试结果统计
- 总测试文件数: $TOTAL_TESTS
- 通过测试文件数: $PASSED_TESTS
- 失败测试文件数: $FAILED_TESTS
- 成功率: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%

## 测试文件列表
EOF

    # 添加每个测试文件的状态
    for test_file in "${TEST_FILES[@]}"; do
        echo "- $test_file" >> reports/layout-tests/test-summary.md
    done
    
    echo -e "${GREEN}✅ 测试报告已生成: reports/layout-tests/test-summary.md${NC}"
}

# 函数：显示最终结果
show_final_results() {
    echo ""
    echo "================================"
    echo -e "${BLUE}🎯 测试执行完成${NC}"
    echo "================================"
    echo -e "${YELLOW}总测试文件数: $TOTAL_TESTS${NC}"
    echo -e "${GREEN}通过测试文件数: $PASSED_TESTS${NC}"
    echo -e "${RED}失败测试文件数: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 所有测试通过！${NC}"
        exit 0
    else
        echo -e "${RED}💥 有 $FAILED_TESTS 个测试失败！${NC}"
        exit 1
    fi
}

# 主执行流程
main() {
    echo "🚀 布局组件测试套件"
    echo "执行时间: $(date)"
    echo ""
    
    # 检查是否在正确的目录
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ 错误: 请在项目根目录下运行此脚本${NC}"
        exit 1
    fi
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  警告: node_modules 不存在，正在安装依赖...${NC}"
        npm install
    fi
    
    # 解析命令行参数
    RUN_COVERAGE=false
    RUN_WATCH=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --coverage|-c)
                RUN_COVERAGE=true
                shift
                ;;
            --watch|-w)
                RUN_WATCH=true
                shift
                ;;
            --help|-h)
                echo "用法: $0 [选项]"
                echo ""
                echo "选项:"
                echo "  --coverage, -c   运行覆盖率测试"
                echo "  --watch, -w      监视模式运行测试"
                echo "  --help, -h       显示此帮助信息"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ 未知选项: $1${NC}"
                exit 1
                ;;
        esac
    done
    
    # 根据参数执行不同的测试模式
    if [ "$RUN_WATCH" = true ]; then
        echo -e "${BLUE}🔄 监视模式运行测试...${NC}"
        npm test -- --watch layout/
    elif [ "$RUN_COVERAGE" = true ]; then
        run_coverage_test
    else
        # 运行所有测试文件
        for test_file in "${TEST_FILES[@]}"; do
            run_test "$test_file"
        done
        
        # 生成报告
        generate_report
        
        # 显示最终结果
        show_final_results
    fi
}

# 运行主函数
main "$@"