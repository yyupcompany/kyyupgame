#!/usr/bin/env node

/**
 * API测试覆盖率分析脚本
 * 比较实际API和测试用例的覆盖率
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始分析API测试覆盖率...');

// 配置
const ROUTES_DIR = path.join(__dirname, '../src/routes');
const TEST_DIR = path.join(__dirname, '../APItest');
const OUTPUT_FILE = path.join(__dirname, '../api-coverage-report.md');

// 存储分析结果
const coverageData = {
  totalApis: 0,
  testedApis: 0,
  untestedApis: 0,
  coverage: 0,
  categories: {},
  testFiles: 0,
  testCases: 0
};

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 扫描所有API接口
function scanAllApis(dir, category = 'root') {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const apis = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      apis.push(...scanAllApis(fullPath, file));
    } else if (file.endsWith('.routes.ts')) {
      apis.push(...extractApisFromFile(fullPath, category));
    }
  }

  return apis;
}

// 从文件中提取API接口
function extractApisFromFile(filePath, category) {
  const apis = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.routes.ts');

    // 提取路由定义
    const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = routeRegex.exec(content)) !== null) {
      const [, method, path] = match;

      apis.push({
        method: method.toUpperCase(),
        path,
        category,
        file: fileName,
        fullPath: `${method} ${path}`,
        identifier: `${method.toLowerCase()}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`
      });

      coverageData.totalApis++;
    }
  } catch (error) {
    console.log(colors.red(`提取API失败 ${filePath}: ${error.message}`));
  }

  return apis;
}

// 扫描测试文件
function scanTestFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const tests = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && (file.endsWith('.test.js') || file.endsWith('.spec.js'))) {
      tests.push(...extractTestsFromFile(fullPath));
      coverageData.testFiles++;
    }
  }

  return tests;
}

// 从测试文件中提取测试用例
function extractTestsFromFile(filePath) {
  const tests = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // 提取测试用例
    const testRegex = /(it|test)\s*\(\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = testRegex.exec(content)) !== null) {
      tests.push({
        file: fileName,
        description: match[2],
        methods: extractTestedMethods(content, match[2])
      });

      coverageData.testCases++;
    }

    // 提取HTTP请求调用
    const httpRequests = content.match(/(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g) || [];
    tests.push(...httpRequests.map(request => {
      const [, method, path] = request.match(/(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/);
      return {
        file: fileName,
        method: method.toUpperCase(),
        path,
        type: 'http_request'
      };
    }));

  } catch (error) {
    console.log(colors.red(`提取测试失败 ${filePath}: ${error.message}`));
  }

  return tests;
}

// 提取测试中使用的方法
function extractTestedMethods(content, testDescription) {
  const methods = [];
  const methodPatterns = [
    /axios\.(get|post|put|patch|delete)\s*\(/g,
    /request\.(get|post|put|patch|delete)\s*\(/g,
    /\.(get|post|put|patch|delete)\s*\(/g
  ];

  for (const pattern of methodPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      methods.push(match[1].toUpperCase());
    }
  }

  return [...new Set(methods)];
}

// 分析覆盖率
function analyzeCoverage(apis, tests) {
  console.log(colors.blue('📊 分析API测试覆盖率...'));

  // 创建测试用例映射
  const testMap = new Map();
  for (const test of tests) {
    if (test.method && test.path) {
      const key = `${test.method} ${test.path}`;
      testMap.set(key, test);
    }
  }

  // 分析每个API的测试覆盖情况
  for (const api of apis) {
    const testKey = `${api.method} ${api.path}`;
    const hasTest = testMap.has(testKey);

    if (hasTest) {
      api.tested = true;
      api.testInfo = testMap.get(testKey);
      coverageData.testedApis++;
    } else {
      api.tested = false;
      coverageData.untestedApis++;
    }

    // 按分类统计
    if (!coverageData.categories[api.category]) {
      coverageData.categories[api.category] = {
        total: 0,
        tested: 0,
        untested: 0
      };
    }

    coverageData.categories[api.category].total++;
    if (hasTest) {
      coverageData.categories[api.category].tested++;
    } else {
      coverageData.categories[api.category].untested++;
    }
  }

  // 计算总体覆盖率
  coverageData.coverage = coverageData.totalApis > 0
    ? ((coverageData.testedApis / coverageData.totalApis) * 100).toFixed(1)
    : 0;
}

// 生成覆盖率报告
function generateCoverageReport(apis, tests) {
  const report = `# API测试覆盖率报告

## 📊 概览

| 指标 | 数值 | 说明 |
|------|------|------|
| 总API数量 | ${coverageData.totalApis} | 所有需要测试的API接口 |
| 已测试API | ${coverageData.testedApis} | 有对应测试用例的API |
| 未测试API | ${coverageData.untestedApis} | 缺少测试用例的API |
| 覆盖率 | **${coverageData.coverage}%** | 测试覆盖率 |
| 测试文件 | ${coverageData.testFiles} | 测试文件数量 |
| 测试用例 | ${coverageData.testCases} | 测试用例总数 |

## 🎯 覆盖率评估

${getCoverageAssessment()}

## 📂 按分类统计

| 分类 | 总数 | 已测试 | 未测试 | 覆盖率 |
|------|------|--------|--------|--------|
${Object.entries(coverageData.categories).map(([category, data]) => {
  const categoryCoverage = data.total > 0 ? ((data.tested / data.total) * 100).toFixed(1) : '0.0';
  return `| ${category} | ${data.total} | ${data.tested} | ${data.untested} | ${categoryCoverage}% |`;
}).join('\n')}

## ✅ 已测试的API接口 (${coverageData.testedApis}个)

${getTestedApisList(apis)}

## ❌ 未测试的API接口 (${coverageData.untestedApis}个)

${getUntestedApisList(apis)}

## 🔧 改进建议

${getImprovementSuggestions()}

## 📝 测试指南

### 1. 添加新的测试用例

为每个未测试的API添加测试用例：

\`\`\`javascript
// 示例：测试用户列表API
describe('GET /api/users', () => {
  it('应该返回用户列表', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('items');
  });

  it('应该拒绝未授权的访问', async () => {
    await request(app)
      .get('/api/users')
      .expect(401);
  });
});
\`\`\`

### 2. 测试覆盖要求

每个API应该包含以下测试场景：

- ✅ **正常情况测试**: 验证API在正常情况下的功能
- ✅ **认证测试**: 验证需要认证的API的权限控制
- ✅ **参数验证测试**: 验证参数校验功能
- ✅ **错误处理测试**: 验证各种错误情况的处理
- ✅ **边界条件测试**: 验证边界值的处理

### 3. 测试数据管理

使用测试数据库和Mock数据：

\`\`\`javascript
// 测试前设置
beforeEach(async () => {
  await setupTestDatabase();
});

// 测试后清理
afterEach(async () => {
  await cleanupTestDatabase();
});
\`\`\`

### 4. 运行测试

\`\`\`bash
# 运行所有API测试
npm run test:api

# 运行覆盖率测试
npm run test:coverage

# 运行特定测试文件
npm test -- APItest/users.test.js
\`\`\`

## 📈 质量指标

### 覆盖率目标

- **当前覆盖率**: ${coverageData.coverage}%
- **目标覆盖率**: 85%
- **差距**: ${Math.max(0, 85 - parseFloat(coverageData.coverage)).toFixed(1)}%

### 测试质量检查

- [ ] 所有API都有对应的测试用例
- [ ] 测试覆盖正常和异常情况
- [ ] 测试数据独立且可重复
- [ ] 测试执行时间合理
- [ ] 测试覆盖率持续监控

---

*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
*脚本版本: 1.0.0*
`;

  return report;
}

// 获取覆盖率评估
function getCoverageAssessment() {
  const coverage = parseFloat(coverageData.coverage);

  if (coverage >= 85) {
    return `🟢 **优秀** - 测试覆盖率良好 (${coverage}%)\n\n继续维持当前的测试质量，定期检查测试用例的有效性。`;
  } else if (coverage >= 70) {
    return `🟡 **良好** - 测试覆盖率一般 (${coverage}%)\n\n建议优先为未测试的核心API添加测试用例。`;
  } else if (coverage >= 50) {
    return `🟠 **一般** - 测试覆盖率偏低 (${coverage}%)\n\n需要大幅增加测试用例，重点覆盖核心业务API。`;
  } else {
    return `🔴 **较差** - 测试覆盖率严重不足 (${coverage}%)\n\n急需补充测试用例，建立完整的测试体系。`;
  }
}

// 获取已测试API列表
function getTestedApisList(apis) {
  const testedApis = apis.filter(api => api.tested);

  if (testedApis.length === 0) {
    return '暂无已测试的API。';
  }

  return testedApis.slice(0, 50).map(api =>
    `- **${api.fullPath}** (${api.file}.routes.ts)`
  ).join('\n') + (testedApis.length > 50 ? '\n... (显示前50个)' : '');
}

// 获取未测试API列表
function getUntestedApisList(apis) {
  const untestedApis = apis.filter(api => !api.tested);

  if (untestedApis.length === 0) {
    return '🎉 所有API都已被测试！';
  }

  // 按重要性排序
  const priorityOrder = ['auth', 'users', 'teachers', 'students', 'classes'];
  const sortedApis = untestedApis.sort((a, b) => {
    const aPriority = priorityOrder.findIndex(cat => a.category.includes(cat));
    const bPriority = priorityOrder.findIndex(cat => b.category.includes(cat));

    if (aPriority === -1 && bPriority === -1) return 0;
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;
    return aPriority - bPriority;
  });

  return sortedApis.slice(0, 20).map(api =>
    `- **${api.fullPath}** (${api.file}.routes.ts) - *优先级: ${getPriority(api.category)}*`
  ).join('\n') + (untestedApis.length > 20 ? '\n... (显示前20个高优先级API)' : '');
}

// 获取优先级
function getPriority(category) {
  const highPriority = ['auth', 'users', 'teachers', 'students'];
  const mediumPriority = ['classes', 'activities', 'system'];

  if (highPriority.some(cat => category.includes(cat))) return '高';
  if (mediumPriority.some(cat => category.includes(cat))) return '中';
  return '低';
}

// 获取改进建议
function getImprovementSuggestions() {
  const suggestions = [];

  if (coverageData.untestedApis > 0) {
    suggestions.push(`1. **优先测试核心API**: 为${coverageData.untestedApis}个未测试API添加测试用例`);
  }

  if (coverageData.coverage < 85) {
    suggestions.push(`2. **提高覆盖率**: 当前覆盖率${coverageData.coverage}%，目标85%`);
  }

  if (coverageData.testFiles < 10) {
    suggestions.push(`3. **增加测试文件**: 当前只有${coverageData.testFiles}个测试文件`);
  }

  suggestions.push('4. **自动化测试**: 集成到CI/CD流程中');
  suggestions.push('5. **定期审查**: 定期检查测试用例的有效性');
  suggestions.push('6. **监控覆盖率**: 使用工具持续监控测试覆盖率');

  return suggestions.join('\n');
}

// 主执行函数
function main() {
  console.log(colors.blue('🔍 扫描API接口...'));

  // 扫描所有API
  const apis = scanAllApis(ROUTES_DIR);

  console.log(colors.blue('🔍 扫描测试文件...'));

  // 扫描测试文件
  const tests = scanTestFiles(TEST_DIR);

  console.log(colors.blue('📊 分析覆盖率...'));

  // 分析覆盖率
  analyzeCoverage(apis, tests);

  console.log(colors.blue('📝 生成报告...'));

  // 生成报告
  const report = generateCoverageReport(apis, tests);

  // 保存报告
  try {
    fs.writeFileSync(OUTPUT_FILE, report, 'utf8');
    console.log(colors.green(`✅ 覆盖率报告已保存: ${OUTPUT_FILE}`));

    // 显示摘要
    console.log(colors.cyan('\n📊 覆盖率摘要:'));
    console.log(`- 总API数量: ${coverageData.totalApis}`);
    console.log(`- 已测试API: ${coverageData.testedApis}`);
    console.log(`- 未测试API: ${coverageData.untestedApis}`);
    console.log(`- 覆盖率: ${coverageData.coverage}%`);
    console.log(`- 测试文件: ${coverageData.testFiles}`);

  } catch (error) {
    console.log(colors.red(`❌ 保存报告失败: ${error.message}`));
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main, coverageData };