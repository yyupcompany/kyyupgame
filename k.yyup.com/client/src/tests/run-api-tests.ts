/**
 * API 测试运行器
 * 在浏览器或 Node.js 中运行 API 测试
 */

import ApiTestSuite from './api-test-generator';

/**
 * 在浏览器中运行测试
 */
export async function runApiTestsInBrowser(): Promise<void> {
  // 如果在浏览器中，确保 Mock Server 正在运行
  const mockServerUrl = 'http://localhost:4000';

  // 检查 Mock Server 是否可用
  try {
    const healthCheck = await fetch(`${mockServerUrl}/health`);
    if (!healthCheck.ok) {
      console.error('❌ Mock Server 不可用，请确保在 4000 端口启动了 Mock Server');
      return;
    }
  } catch (error) {
    console.error('❌ 无法连接到 Mock Server，请确保它正在运行在 http://localhost:4000');
    return;
  }

  // 创建测试套件
  const testSuite = new ApiTestSuite(mockServerUrl);

  // 执行测试
  const results = await testSuite.runAllTests();

  // 生成报告
  const report = testSuite.generateReport();
  console.log(report);

  // 保存结果到 localStorage（可选）
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('apiTestResults', JSON.stringify({
      results,
      report,
      timestamp: new Date().toISOString()
    }));
    console.log('💾 测试结果已保存到 localStorage');
  }
}

/**
 * 运行特定标签的测试
 */
export async function runTestsByTag(tag: string): Promise<void> {
  const mockServerUrl = 'http://localhost:4000';
  const testSuite = new ApiTestSuite(mockServerUrl);

  const testCases = testSuite.filterByTag(tag);
  console.log(`\n🏷️  运行标签为 "${tag}" 的测试 (共 ${testCases.length} 个)\n`);

  for (const testCase of testCases) {
    const result = await testSuite.runTestCase(testCase);
    console.log(
      `${result.passed ? '✅' : '❌'} [${result.method}] ${result.path} - ${result.status}`
    );
  }
}

/**
 * 获取测试用例列表
 */
export function getTestCases(): any[] {
  const testSuite = new ApiTestSuite();
  return testSuite.getTestCases();
}

/**
 * 导出测试结果为 JSON
 */
export function exportTestResults(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem('apiTestResults');
    if (data) {
      return data;
    }
  }
  return JSON.stringify({ error: '没有找到测试结果' });
}

/**
 * 导出测试结果为 CSV
 */
export function exportTestResultsAsCSV(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const data = localStorage.getItem('apiTestResults');
    if (data) {
      const { results } = JSON.parse(data);
      let csv = 'Test ID,Test Name,Method,Path,Status,Duration(ms),Passed,Error\n';
      results.forEach((r: any) => {
        csv += `"${r.testId}","${r.testName}","${r.method}","${r.path}",${r.status},${r.duration},${r.passed},"${r.error || ''}"\n`;
      });
      return csv;
    }
  }
  return 'No test results found';
}

// 如果在浏览器中，暴露到全局对象
if (typeof window !== 'undefined') {
  (window as any).__apiTests = {
    run: runApiTestsInBrowser,
    runByTag: runTestsByTag,
    getTests: getTestCases,
    export: exportTestResults,
    exportCSV: exportTestResultsAsCSV
  };
  console.log('💡 API 测试工具已加载，使用 window.__apiTests 来运行测试');
}

export default {
  runApiTestsInBrowser,
  runTestsByTag,
  getTestCases,
  exportTestResults,
  exportTestResultsAsCSV
};



