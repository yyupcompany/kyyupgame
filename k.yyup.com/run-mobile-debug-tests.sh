#!/bin/bash

# 移动端页面调试测试运行器
# 自动运行 Centers、教师中心、家长中心的链接测试

set -e

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   移动端页面调试测试 - 控制台错误和空白页检测"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/home/zhgue/kyyupgame/k.yyup.com"
REPORT_DIR="${PROJECT_ROOT}/client/playwright-report/complete"

# 确保报告目录存在
mkdir -p "${REPORT_DIR}"

# 检查端口是否可用
check_port() {
  local port=$1
  if lsof -i :${port} >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# 启动服务
start_services() {
  echo -e "${BLUE}步骤 1: 检查服务状态...${NC}"

  if check_port 5173; then
    echo -e "${GREEN}✓ ${NC}前端服务已在运行 (端口 5173)"
  else
    echo -e "${YELLOW}⚠ ${NC}前端服务未运行，请先启动:"
    echo "   cd ${PROJECT_ROOT}/client && npm run dev"
    exit 1
  fi

  echo -e "${BLUE}✓ ${NC}服务检查完成"
  echo ""
}

# 运行单个测试套件
run_test() {
  local test_name=$1
  local test_file=$2
  local role=$3

  echo -e "${BLUE}运行 ${role} 中心调试测试...${NC}"
  echo "测试文件: ${test_file}"
  echo ""

  cd "${PROJECT_ROOT}"

  # 运行测试
  if npx playwright test "${test_file}" --reporter=html; then
    echo -e "${GREEN}✓ ${NC}${role} 测试运行完成"
    return 0
  else
    echo -e "${YELLOW}⚠ ${NC}${role} 测试发现错误（继续执行其他测试）"
    return 1
  fi
}

# 生成综合分析报告
generate_summary_report() {
  echo ""
  echo -e "${BLUE}生成综合分析报告...${NC}"
  echo ""

  cd "${PROJECT_ROOT}"

  # 使用 Node.js 合并报告
  node -e "
const fs = require('fs');
const path = require('path');

const reportDir = '${REPORT_DIR}';

// 读取所有调试报告
const reports = [];
const reportFiles = [
  'CENTERS_DEBUG_REPORT.json',
  'TEACHER_DEBUG_REPORT.json',
  'PARENT_DEBUG_REPORT.json'
];

reportFiles.forEach(file => {
  const filePath = path.join(reportDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      reports.push(data);
    } catch (error) {
      console.log(\`无法读取 \${file}: \${error.message}\`);
    }
  } else {
    console.log(\`报告文件不存在: \${file}\`);
  }
});

// 生成汇总
if (reports.length === 0) {
  console.log('没有可用的调试报告');
  process.exit(0);
}

const summary = {
  totalReports: reports.length,
  totalLinks: reports.reduce((sum, r) => sum + (r.totalLinks || 0), 0),
  totalTested: reports.reduce((sum, r) => sum + (r.linksTested || 0), 0),
  totalFailed: reports.reduce((sum, r) => sum + (r.failedLinks?.length || 0), 0),
  totalBlankPages: reports.reduce((sum, r) => sum + (r.totalBlankPages || 0), 0),
  totalErrors: reports.reduce((sum, r) => sum + (r.totalErrors || 0), 0),
  reports: reports.map(r => ({
    role: r.role || 'unknown',
    totalLinks: r.totalLinks || 0,
    linksTested: r.linksTested || 0,
    failedLinks: r.failedLinks?.length || 0,
    blankPages: r.totalBlankPages || 0,
    passRate: r.summary?.passRate || 0,
    status: r.summary?.status || 'unknown'
  }))
};

// 保存汇总报告
const summaryPath = path.join(reportDir, 'MOBILE_DEBUG_SUMMARY.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

// 打印HTML格式的汇总报告
const htmlReport = path.join(reportDir, 'MOBILE_DEBUG_SUMMARY.html');
const htmlContent = \`
<!DOCTYPE html>
<html>
<head>
    <meta charset=\"UTF-8\">
    <title>移动端调试测试汇总报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 30px; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-item { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #007bff; }
        .summary-item.error { border-left-color: #dc3545; }
        .summary-item.warning { border-left-color: #ffc107; }
        .summary-item.success { border-left-color: #28a745; }
        .summary-item h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: normal; }
        .summary-item .value { font-size: 24px; font-weight: bold; color: #333; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; color: #555; }
        .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-warning { background: #fff3cd; color: #856404; }
        .pass-rate { font-size: 18px; font-weight: bold; }
        .pass-rate.good { color: #28a745; }
        .pass-rate.warning { color: #ffc107; }
        .pass-rate.danger { color: #dc3545; }
        .error-details { margin-top: 30px; }
        .error-item { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class=\"container\">
        <h1>📱 移动端页面调试测试汇总报告</h1>
        <p style=\"color: #666;\">生成时间: \${new Date().toLocaleString()}</p>

        <div class=\"summary\">
            <div class=\"summary-item\">
                <h3>总测试模块</h3>
                <div class=\"value\">\${summary.totalReports}</div>
            </div>
            <div class=\"summary-item\">
                <h3>总链接数</h3>
                <div class=\"value\">\${summary.totalLinks}</div>
            </div>
            <div class=\"summary-item \${summary.totalFailed > 0 ? 'error' : 'success'}\">
                <h3>失败链接</h3>
                <div class=\"value\">\${summary.totalFailed}</div>
            </div>
            <div class=\"summary-item \${summary.totalBlankPages > 0 ? 'warning' : 'success'}\">
                <h3>空白页面</h3>
                <div class=\"value\">\${summary.totalBlankPages}</div>
            </div>
            <div class=\"summary-item \${summary.totalErrors > 0 ? 'error' : 'success'}\">
                <h3>控制台错误</h3>
                <div class=\"value\">\${summary.totalErrors}</div>
            </div>
            <div class=\"summary-item\">
                <h3>整体通过率</h3>
                <div class=\"value pass-rate \${summary.totalFailed === 0 ? 'good' : (summary.totalFailed < summary.totalTested * 0.3 ? 'warning' : 'danger')}\">
                    \${summary.totalTested > 0 ? ((summary.totalTested - summary.totalFailed) / summary.totalTested * 100).toFixed(1) : 0}%
                </div>
            </div>
        </div>

        <h2 style=\"margin-top: 40px; color: #333;\">📊 各模块详细报告</h2>
        <table>
            <thead>
                <tr>
                    <th>模块</th>
                    <th>链接数</th>
                    <th>测试数</th>
                    <th>失败数</th>
                    <th>空白页</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                \${summary.reports.map(report => \`
                <tr>
                    <td><strong>\${report.role.toUpperCase()}</strong></td>
                    <td>\${report.totalLinks}</td>
                    <td>\${report.linksTested}</td>
                    <td>\${report.failedLinks}</td>
                    <td>\${report.blankPages}</td>
                    <td>
                        <span class=\"status-badge status-\${report.status}\">
                            \${report.status === 'passed' ? '通过' : report.status === 'failed' ? '失败' : '警告'}
                        </span>
                    </td>
                </tr>
                \`).join('')}
            </tbody>
        </table>

        <div class=\"error-details\">
            <h2>🔍 问题分析</h2>
            \${summary.totalFailed === 0 ? '\n            <div style=\"background: #d4edda; border-left: 4px solid #28a745; padding: 20px; border-radius: 4px;\">
                <strong>✅ 所有测试通过！</strong><br>
                没有发现404错误、空白页面或控制台错误。
            </div>\n            ' : '\n            <div style=\"background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; border-radius: 4px;\">
                <strong>❌ 发现 ' + summary.totalFailed + ' 个问题需要修复</strong><br>
                请查看详细的JSON报告文件了解具体问题。
            </div>\n            '}
        </div>

        <div class=\"footer\">
            <p>📄 详细报告已保存到: ${reportDir}/</p>
            <p>💡 提示：运行测试后可以使用浏览器打开 HTML 报告查看详细信息</p>
        </div>
    </div>
</body>
</html>
\`;

fs.writeFileSync(htmlReport, htmlContent);

console.log('✓ 综合分析报告已生成:');
console.log('  - JSON: ' + summaryPath);
console.log('  - HTML: ' + htmlReport);
  "

  echo -e "${GREEN}✓ ${NC}综合分析报告生成完成"
  echo ""
}

# 显示使用说明
show_usage() {
  echo "使用方式:"
  echo "  ./run-mobile-debug-tests.sh [选项]"
  echo ""
  echo "选项:"
  echo "  --help      显示帮助信息"
  echo "  --centers   仅测试 Centers 页面"
  echo "  --teacher   仅测试教师中心"
  echo "  --parent    仅测试家长中心"
  echo "  --all       测试所有页面（默认）"
  echo ""
}

# 主执行流程
main() {
  local test_type="${1:-all}"

  case "${test_type}" in
    --help|-h)
      show_usage
      exit 0
      ;;
    --centers)
      TEST_SUITES=("admin")
      ;;
    --teacher)
      TEST_SUITES=("teacher")
      ;;
    --parent)
      TEST_SUITES=("parent")
      ;;
    --all|all)
      TEST_SUITES=("admin" "teacher" "parent")
      ;;
    *)
      echo -e "${YELLOW}未知选项: ${test_type}${NC}"
      show_usage
      exit 1
      ;;
  esac

  # 步骤1: 检查服务
  start_services

  # 步骤2: 运行测试
  local results=()

  for suite in "${TEST_SUITES[@]}"; do
    case "${suite}" in
      admin)
        run_test "Centers 管理中心" "mcp-centers-debug.spec.ts" "管理员"
        results+=("centers:$?")
        ;;
      teacher)
        run_test "教师中心" "mcp-teacher-center-debug.spec.ts" "教师"
        results+=("teacher:$?")
        ;;
      parent)
        run_test "家长中心" "mcp-parent-center-debug.spec.ts" "家长"
        results+=("parent:$?")
        ;;
    esac
  done

  # 步骤3: 生成汇总报告
  generate_summary_report

  # 步骤4: 结果显示
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}                    测试执行完成${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo ""

  local has_failures=false
  for result in "${results[@]}"; do
    local suite="${result%%:*}"
    local status="${result##*:}"

    case "${suite}" in
      centers) suite_name="Centers 管理中心" ;;
      teacher) suite_name="教师中心" ;;
      parent) suite_name="家长中心" ;;
    esac

    if [[ "${status}" -eq 0 ]]; then
      echo -e "${GREEN}✓ ${NC}${suite_name}: 测试完成（可能有错误需修复）"
    else
      echo -e "${YELLOW}⚠ ${NC}${suite_name}: 测试运行中断"
      has_failures=true
    fi
  done

  echo ""
  echo -e "${GREEN}📊 查看详细报告:${NC}"
  echo "   ${REPORT_DIR}/MOBILE_DEBUG_SUMMARY.html"
  echo ""
  echo -e "${GREEN}📁 各个模块详细报告:${NC}"
  for suite in "${TEST_SUITES[@]}"; do
    case "${suite}" in
      centers)
        echo "   - Centers: ${REPORT_DIR}/CENTERS_DEBUG_REPORT.json"
        ;;
      teacher)
        echo "   - 教师中心: ${REPORT_DIR}/TEACHER_DEBUG_REPORT.json"
        ;;
      parent)
        echo "   - 家长中心: ${REPORT_DIR}/PARENT_DEBUG_REPORT.json"
        ;;
    esac
  done

  echo ""
  if [[ "${has_failures}" == true ]]; then
    echo -e "${YELLOW}⚠  部分测试套件运行失败，请检查错误信息${NC}"
  else
    echo -e "${GREEN}✓ 所有测试套件已运行完成${NC}"
    echo -e "${BLUE}ℹ  请查看 HTML 报告了解详细的测试结果和错误${NC}"
  fi

  echo ""
}

# 执行主流程
main "$@"
