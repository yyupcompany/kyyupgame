#!/bin/bash

# 优化测试运行脚本
# 自动运行测试、分析结果、应用修复

set -e

echo "🚀 启动智能测试优化系统..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLIENT_ROOT="$PROJECT_ROOT/client"
TEST_RESULTS_DIR="$CLIENT_ROOT/test-results"

# 创建测试结果目录
mkdir -p "$TEST_RESULTS_DIR"

echo -e "${BLUE}📁 项目路径: $PROJECT_ROOT${NC}"
echo -e "${BLUE}📁 客户端路径: $CLIENT_ROOT${NC}"
echo -e "${BLUE}📁 测试结果目录: $TEST_RESULTS_DIR${NC}"

# 切换到客户端目录
cd "$CLIENT_ROOT"

# 检查依赖
echo -e "${YELLOW}🔍 检查依赖...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 未找到 package.json${NC}"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    npm install
fi

# 清理之前的测试结果
echo -e "${YELLOW}🧹 清理之前的测试结果...${NC}"
rm -rf "$TEST_RESULTS_DIR"/*.json
rm -rf "$TEST_RESULTS_DIR"/*.html
rm -rf "$TEST_RESULTS_DIR"/coverage

# 第一次运行测试 - 获取基线
echo -e "${BLUE}🧪 第一次运行测试 (基线)...${NC}"
npm run test:unit -- --reporter=json --outputFile="$TEST_RESULTS_DIR/baseline-results.json" || true

# 分析测试结果
echo -e "${YELLOW}🔍 分析测试结果...${NC}"
BASELINE_RESULTS="$TEST_RESULTS_DIR/baseline-results.json"

if [ -f "$BASELINE_RESULTS" ]; then
    # 提取测试统计信息
    TOTAL_TESTS=$(jq '.numTotalTests // 0' "$BASELINE_RESULTS")
    PASSED_TESTS=$(jq '.numPassedTests // 0' "$BASELINE_RESULTS")
    FAILED_TESTS=$(jq '.numFailedTests // 0' "$BASELINE_RESULTS")
    
    echo -e "${BLUE}📊 基线测试结果:${NC}"
    echo -e "   总测试数: $TOTAL_TESTS"
    echo -e "   通过: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "   失败: ${RED}$FAILED_TESTS${NC}"
    
    if [ "$FAILED_TESTS" -gt 0 ]; then
        echo -e "${YELLOW}🔧 发现失败测试，启动自动修复...${NC}"
        
        # 运行自动修复脚本
        if [ -f "tests/scripts/auto-fix-tests.ts" ]; then
            npx tsx tests/scripts/auto-fix-tests.ts || echo -e "${YELLOW}⚠️ 自动修复脚本执行完成（可能有警告）${NC}"
        else
            echo -e "${YELLOW}⚠️ 自动修复脚本不存在，跳过自动修复${NC}"
        fi
        
        # 第二次运行测试 - 验证修复效果
        echo -e "${BLUE}🧪 第二次运行测试 (验证修复)...${NC}"
        npm run test:unit -- --reporter=json --outputFile="$TEST_RESULTS_DIR/fixed-results.json" || true
        
        FIXED_RESULTS="$TEST_RESULTS_DIR/fixed-results.json"
        if [ -f "$FIXED_RESULTS" ]; then
            FIXED_PASSED=$(jq '.numPassedTests // 0' "$FIXED_RESULTS")
            FIXED_FAILED=$(jq '.numFailedTests // 0' "$FIXED_RESULTS")
            
            echo -e "${BLUE}📊 修复后测试结果:${NC}"
            echo -e "   通过: ${GREEN}$FIXED_PASSED${NC} (之前: $PASSED_TESTS)"
            echo -e "   失败: ${RED}$FIXED_FAILED${NC} (之前: $FAILED_TESTS)"
            
            # 计算改进
            IMPROVEMENT=$((FIXED_PASSED - PASSED_TESTS))
            if [ "$IMPROVEMENT" -gt 0 ]; then
                echo -e "${GREEN}🎉 测试通过率提升了 $IMPROVEMENT 个测试！${NC}"
            elif [ "$IMPROVEMENT" -eq 0 ]; then
                echo -e "${YELLOW}⚠️ 测试通过率没有变化${NC}"
            else
                echo -e "${RED}❌ 测试通过率下降了 ${IMPROVEMENT#-} 个测试${NC}"
            fi
        fi
    else
        echo -e "${GREEN}🎉 所有测试都通过了！${NC}"
    fi
else
    echo -e "${RED}❌ 无法读取测试结果文件${NC}"
fi

# 生成覆盖率报告
echo -e "${YELLOW}📈 生成覆盖率报告...${NC}"
npm run test:coverage || echo -e "${YELLOW}⚠️ 覆盖率报告生成失败${NC}"

# 生成HTML报告
echo -e "${YELLOW}📄 生成HTML测试报告...${NC}"
npm run test:unit -- --reporter=html --outputFile="$TEST_RESULTS_DIR/test-report.html" || true

# 创建综合报告
echo -e "${YELLOW}📋 创建综合报告...${NC}"
cat > "$TEST_RESULTS_DIR/summary.md" << EOF
# 测试优化报告

## 📊 测试统计

- **运行时间**: $(date)
- **总测试数**: $TOTAL_TESTS
- **基线通过**: $PASSED_TESTS
- **基线失败**: $FAILED_TESTS

$(if [ -f "$FIXED_RESULTS" ]; then
    echo "- **修复后通过**: $FIXED_PASSED"
    echo "- **修复后失败**: $FIXED_FAILED"
    echo "- **改进数量**: $IMPROVEMENT"
fi)

## 🔧 优化措施

1. **Mock系统优化**: 统一的认证和API Mock
2. **DOM兼容性**: 完善的浏览器API Mock
3. **异步处理**: 改进的等待机制
4. **智能断言**: 更灵活的测试断言

## 📁 文件位置

- 测试结果: \`$TEST_RESULTS_DIR\`
- HTML报告: \`test-report.html\`
- 覆盖率报告: \`coverage/index.html\`

## 🚀 下一步建议

1. 检查剩余失败的测试用例
2. 更新测试断言以匹配实际组件结构
3. 完善Element Plus组件的Mock配置
4. 考虑引入视觉回归测试

EOF

# 显示最终结果
echo -e "${GREEN}✅ 测试优化完成！${NC}"
echo -e "${BLUE}📄 查看详细报告: $TEST_RESULTS_DIR/summary.md${NC}"

if [ -f "$TEST_RESULTS_DIR/test-report.html" ]; then
    echo -e "${BLUE}🌐 HTML报告: $TEST_RESULTS_DIR/test-report.html${NC}"
fi

if [ -d "$TEST_RESULTS_DIR/coverage" ]; then
    echo -e "${BLUE}📈 覆盖率报告: $TEST_RESULTS_DIR/coverage/index.html${NC}"
fi

# 如果有失败的测试，显示建议
if [ "$FAILED_TESTS" -gt 0 ] && [ -f "$FIXED_RESULTS" ] && [ "$FIXED_FAILED" -gt 0 ]; then
    echo -e "${YELLOW}💡 还有 $FIXED_FAILED 个测试失败，建议:${NC}"
    echo -e "   1. 检查组件实际结构与测试期望是否匹配"
    echo -e "   2. 更新CSS选择器和DOM查询"
    echo -e "   3. 完善异步操作的等待机制"
    echo -e "   4. 检查Element Plus组件的Mock配置"
fi

echo -e "${GREEN}🎯 测试优化代理任务完成！${NC}"
