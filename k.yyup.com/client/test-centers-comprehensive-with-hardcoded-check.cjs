// 测试 centers 目录所有中心页面的自动化脚本 - 包含硬编码检测
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 确保测试结果目录存在
const resultsDir = './test-results/centers';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// 硬编码值检测配置
const HARDCODED_PATTERNS = [
  // 硬编码的颜色值
  {
    pattern: /#[0-9a-fA-F]{6}/g,
    type: 'hardcoded_color',
    description: '硬编码的颜色值',
    severity: 'medium'
  },
  // 硬编码的像素值
  {
    pattern: /\d+px/g,
    type: 'hardcoded_pixel',
    description: '硬编码的像素值',
    severity: 'low'
  },
  // 硬编码的尺寸
  {
    pattern: /(width|height):\s*\d+px/g,
    type: 'hardcoded_size',
    description: '硬编码的宽高值',
    severity: 'medium'
  },
  // 硬编码的z-index
  {
    pattern: /z-index:\s*[0-9]+/g,
    type: 'hardcoded_zindex',
    description: '硬编码的z-index值',
    severity: 'high'
  },
  // 硬编码的时间值
  {
    pattern: /(setTimeout|setInterval)\(\s*\d+/g,
    type: 'hardcoded_timeout',
    description: '硬编码的超时值',
    severity: 'medium'
  },
  // 硬编码的URL
  {
    pattern: /https?:\/\/[^\s"']+/g,
    type: 'hardcoded_url',
    description: '硬编码的URL',
    severity: 'high'
  },
  // 硬编码的文本内容
  {
    pattern: /(title|placeholder|label)\s*=\s*["'][^"']+["']/g,
    type: 'hardcoded_text',
    description: '硬编码的文本内容',
    severity: 'medium'
  }
];

// 检测硬编码值的函数
function detectHardcodedValues(content, filePath) {
  const hardcodedIssues = [];

  HARDCODED_PATTERNS.forEach(patternConfig => {
    const matches = content.match(patternConfig.pattern);
    if (matches) {
      matches.forEach(match => {
        hardcodedIssues.push({
          type: patternConfig.type,
          value: match,
          description: patternConfig.description,
          severity: patternConfig.severity,
          file: filePath,
          line: getLineNumber(content, match)
        });
      });
    }
  });

  return hardcodedIssues;
}

// 获取匹配项在文件中的行号
function getLineNumber(content, match) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(match)) {
      return i + 1;
    }
  }
  return 1;
}

// 分析页面的硬编码值
async function analyzeHardcodedValues(page, url) {
  try {
    // 获取页面内容
    const content = await page.content();

    // 检测硬编码值
    const hardcodedIssues = detectHardcodedValues(content, url);

    // 检查内联样式
    const inlineStyles = await page.$$eval('style, [style]', elements =>
      elements.map(el => el.textContent || el.getAttribute('style') || '')
    );

    inlineStyles.forEach((styleContent, index) => {
      const issues = detectHardcodedValues(styleContent, `${url} (inline style ${index + 1})`);
      hardcodedIssues.push(...issues);
    });

    return hardcodedIssues;
  } catch (error) {
    console.warn(`分析硬编码值失败: ${url} - ${error.message}`);
    return [];
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 收集控制台消息
  const allErrors = [];
  const allConsoleMsgs = [];
  const allHardcodedIssues = [];

  page.on('console', msg => {
    const text = msg.text();
    allConsoleMsgs.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });

    if (msg.type() === 'error') {
      allErrors.push({
        type: 'console',
        text: text,
        location: msg.location(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // 收集网络错误
  page.on('response', response => {
    if (!response.ok()) {
      allErrors.push({
        type: 'network',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // 收集页面错误
  page.on('pageerror', error => {
    allErrors.push({
      type: 'page',
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  // 要测试的页面列表
  const testPages = [
    { url: 'http://localhost:5173/centers/activity', name: 'Activity Center' },
    { url: 'http://localhost:5173/centers/analytics', name: 'Analytics Center' },
    { url: 'http://localhost:5173/centers/ai', name: 'AI Center' },
    { url: 'http://localhost:5173/centers/business', name: 'Business Center' },
    { url: 'http://localhost:5173/centers/call', name: 'Call Center' },
    { url: 'http: //localhost:5173/centers/document', name: 'Document Center' },
    { url: 'http://localhost:5173/centers/enrollment', name: 'Enrollment Center' },
    { url: 'http://localhost:5173/centers/finance', name: 'Finance Center' },
    { url: 'http://localhost:5173/centers/inspection', name: 'Inspection Center' },
    { url: 'http://localhost:5173/centers/marketing', name: 'Marketing Center' },
    { url: 'http://localhost:5173/centers/personnel', name: 'Personnel Center' },
    { url: 'http://localhost:5173/centers/script', name: 'Script Center' },
    { url: 'http://localhost:5173/centers/system', name: 'System Center' },
    { url: 'http://localhost:5173/centers/task', name: 'Task Center' },
    { url: 'http://localhost:5173/centers/teaching', name: 'Teaching Center' },
    { url: 'http://localhost:5173/centers/media', name: 'Media Center' },
    { url: 'http://localhost:5173/centers/attendance', name: 'Attendance Center' },
    { url: 'http://localhost:5173/centers/assessment', name: 'Assessment Center' },
    { url: 'http://localhost:5173/centers/customer-pool', name: 'Customer Pool Center' },
    { url: 'http://localhost:5173/centers', name: 'Centers Index' }
  ];

  const results = {
    summary: {
      total: testPages.length,
      tested: 0,
      successful: 0,
      failed: 0,
      totalErrors: 0,
      totalHardcodedIssues: 0,
      highSeverityHardcoded: 0,
      mediumSeverityHardcoded: 0,
      lowSeverityHardcoded: 0
    },
    pages: []
  };

  console.log('🔍 开始测试所有中心页面（包含硬编码检测）...');

  for (const pageInfo of testPages) {
    console.log(`\n📄 测试页面: ${pageInfo.name}`);

    const pageResult = {
      name: pageInfo.name,
      url: pageInfo.url,
      success: false,
      errors: [],
      consoleMessages: [],
      screenshot: null,
      hardcodedIssues: [],
      loadTime: null,
      performance: null
    };

    const startTime = Date.now();

    try {
      // 导航到页面
      const response = await page.goto(pageInfo.url, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      // 等待页面加载完成
      await page.waitForTimeout(2000);

      // 检测硬编码值
      const hardcodedIssues = await analyzeHardcodedValues(page, pageInfo.url);
      pageResult.hardcodedIssues = hardcodedIssues;
      allHardcodedIssues.push(...hardcodedIssues);

      // 获取性能指标
      try {
        const performance = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          return {
            loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
          };
        });
        pageResult.performance = performance;
      } catch (perfError) {
        console.warn(`无法获取性能指标: ${perfError.message}`);
      }

      pageResult.success = true;
      pageResult.loadTime = Date.now() - startTime;

      // 截图
      const screenshot = await page.screenshot({
        path: `${resultsDir}/${pageInfo.name.replace(/\s+/g, '_')}.png`,
        fullPage: true
      });
      pageResult.screenshot = screenshot;

      console.log(`✅ ${pageInfo.name} - 测试成功 (${pageResult.loadTime}ms)`);
      console.log(`   - 控制台消息: ${allConsoleMsgs.length}`);
      console.log(`   - 错误数量: ${allErrors.length}`);
      console.log(`   - 硬编码问题: ${hardcodedIssues.length}`);

    } catch (error) {
      console.log(`❌ ${pageInfo.name} - 测试失败: ${error.message}`);

      pageResult.errors.push({
        type: 'navigation',
        message: error.message,
        timestamp: new Date().toISOString()
      });

      // 尝试截图（即使页面加载失败）
      try {
        const screenshot = await page.screenshot({
          path: `${resultsDir}/${pageInfo.name.replace(/\s+/g, '_')}_error.png`,
          fullPage: true
        });
        pageResult.screenshot = screenshot;
      } catch (screenshotError) {
        console.warn(`无法截图: ${screenshotError.message}`);
      }
    }

    pageResult.consoleMessages = allConsoleMsgs.filter(msg =>
      msg.timestamp > (Date.now() - 30000) // 只保留最近30秒的消息
    );

    results.pages.push(pageResult);
    results.summary.tested++;

    if (pageResult.success) {
      results.summary.successful++;
    } else {
      results.summary.failed++;
    }

    // 短暂等待，避免请求过于频繁
    await page.waitForTimeout(500);
  }

  // 统计硬编码问题
  results.summary.totalHardcodedIssues = allHardcodedIssues.length;
  results.summary.highSeverityHardcoded = allHardcodedIssues.filter(issue => issue.severity === 'high').length;
  results.summary.mediumSeverityHardcoded = allHardcodedIssues.filter(issue => issue.severity === 'medium').length;
  results.summary.lowSeverityHardcoded = allHardcodedIssues.filter(issue => issue.severity === 'low').length;
  results.summary.totalErrors = allErrors.length;

  await browser.close();

  // 生成测试报告
  const reportPath = `${resultsDir}/comprehensive-test-report-with-hardcoded-check.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // 生成Markdown报告
  const markdownReport = generateMarkdownReport(results, allHardcodedIssues);
  const mdPath = `${resultsDir}/comprehensive-test-report-with-hardcoded-check.md`;
  fs.writeFileSync(mdPath, markdownReport);

  console.log('\n📊 测试完成！');
  console.log(`📄 详细报告: ${reportPath}`);
  console.log(`📝 Markdown报告: ${mdPath}`);
  console.log(`📈 测试统计:`);
  console.log(`   - 总页面数: ${results.summary.total}`);
  console.log(`   - 成功: ${results.summary.successful}`);
  console.log(`   - 失败: ${results.summary.failed}`);
  console.log(`   - 总错误数: ${results.summary.totalErrors}`);
  console.log(`   - 硬编码问题: ${results.summary.totalHardcodedIssues}`);
  console.log(`   - 高严重性: ${results.summary.highSeverityHardcoded}`);
  console.log(`   - 中等严重性: ${results.summary.mediumSeverityHardcoded}`);
  console.log(`   - 低严重性: ${results.summary.lowSeverityHardcoded}`);

  // 如果发现硬编码问题，生成专门的报告
  if (allHardcodedIssues.length > 0) {
    generateHardcodedReport(allHardcodedIssues, resultsDir);
  }

  process.exit(results.summary.failed > 0 ? 1 : 0);
})();

function generateMarkdownReport(results, hardcodedIssues) {
  let markdown = `# 中心页面综合测试报告（包含硬编码检测）

## 📊 测试概述

- **测试时间**: ${new Date().toISOString()}
- **测试页面数**: ${results.summary.total}
- **成功**: ${results.summary.successful}
- **失败**: ${results.summary.failed}
- **成功率**: ${((results.summary.successful / results.summary.total) * 100).toFixed(2)}%

## 🔍 错误统计

- **控制台错误**: ${results.summary.totalErrors}
- **硬编码问题**: ${results.summary.totalHardcodedIssues}
  - 高严重性: ${results.summary.highSeverityHardcoded}
  - 中等严重性: ${results.summary.mediumSeverityHardcoded}
  - 低严重性: ${results.lowSeverityHardcoded}

`;

  if (hardcodedIssues.length > 0) {
    markdown += `
## ⚠️ 硬编码问题详情

### 按严重性分类

#### 高严重性问题 (${results.summary.highSeverityHardcoded})
`;

    const highSeverityIssues = hardcodedIssues.filter(issue => issue.severity === 'high');
    highSeverityIssues.forEach(issue => {
      markdown += `
- **${issue.type}**: \`${issue.value}\` (${issue.file} L${issue.line})
  - 描述: ${issue.description}
`;
    });

    markdown += `
#### 中等严重性问题 (${results.summary.mediumSeverityHardcoded})
`;

    const mediumSeverityIssues = hardcodedIssues.filter(issue => issue.severity === 'medium');
    mediumSeverityIssues.forEach(issue => {
      markdown += `
- **${issue.type}**: \`${issue.value}\` (${issue.file} L${issue.line})
  - 描述: ${issue.description}
`;
    });

    markdown += `
#### 低严重性问题 (${results.summary.lowSeverityHardcoded})
`;

    const lowSeverityIssues = hardcodedIssues.filter(issue => issue.severity === 'low');
    lowSeverityIssues.forEach(issue => {
      markdown += `
- **${issue.type}**: \`${issue.value}\` (${issue.file} L${issue.line})
  - 描述: ${issue.description}
`;
    });
  }

  markdown += `
## 📄 页面详情

`;

  results.pages.forEach(page => {
    const status = page.success ? '✅' : '❌';
    markdown += `
### ${status} ${page.name}

- **URL**: ${page.url}
- **加载时间**: ${page.loadTime}ms
- **控制台消息**: ${page.consoleMessages.length}
- **错误数量**: ${page.errors.length}
- **硬编码问题**: ${page.hardcodedIssues.length}
`;

    if (page.errors.length > 0) {
      markdown += `
#### 错误详情
`;
      page.errors.forEach(error => {
        markdown += `
- **${error.type}**: ${error.message}
  - 时间: ${error.timestamp}
`;
      });
    }

    if (page.hardcodedIssues.length > 0) {
      markdown += `
#### 硬编码问题
`;
      page.hardcodedIssues.forEach(issue => {
        markdown += `
- **${issue.type}**: \`${issue.value}\`
  - 描述: ${issue.description}
  - 严重性: ${issue.severity}
`;
      });
    }
  });

  markdown += `
## 📈 建议

### 硬编码值优化建议

1. **高优先级修复**
   - 将硬编码的z-index值替换为CSS变量
   - 将硬编码的URL替换为配置文件引用
   - 优化硬编码的超时值，使用统一的常量

2. **中等优先级修复**
   - 将硬编码的颜色值替换为设计令牌
   - 将硬编码的文本内容提取为国际化文件
   - 优化硬编码的尺寸值，使用响应式设计

3. **低优先级优化**
   - 评估硬编码的像素值是否需要统一
   - 考虑使用CSS Grid/Flexbox替换固定尺寸

### 通用优化建议

1. 使用CSS变量管理主题色彩和尺寸
2. 将硬编码值提取到配置文件
3. 实现响应式设计，避免固定尺寸
4. 使用设计系统组件替代自定义样式

---

*报告生成时间: ${new Date().toISOString()}*
`;

  return markdown;
}

function generateHardcodedReport(hardcodedIssues, resultsDir) {
  const groupedIssues = {};

  // 按类型分组
  hardcodedIssues.forEach(issue => {
    if (!groupedIssues[issue.type]) {
      groupedIssues[issue.type] = [];
    }
    groupedIssues[issue.type].push(issue);
  });

  let report = `# 硬编码值检测报告

## 📊 检测统计

- **总问题数**: ${hardcodedIssues.length}
- **问题类型数**: ${Object.keys(groupedIssues).length}
- **检测时间**: ${new Date().toISOString()}

## 🔧 修复建议

`;

  Object.entries(groupedIssues).forEach(([type, issues]) => {
    report += `
### ${type}

**问题数量**: ${issues.length}

**示例**:
`;

    // 显示前5个示例
    issues.slice(0, 5).forEach(issue => {
      report += `
- \`${issue.value}\` (${issue.file} L${issue.line}) - ${issue.description}
`;
    });

    if (issues.length > 5) {
      report += `
- ... 还有 ${issues.length - 5} 个类似问题`;
    }

    // 添加类型特定的修复建议
    switch (type) {
      case 'hardcoded_color':
        report += `
**修复建议**:
- 将颜色值提取到CSS变量中
- 使用设计令牌统一管理色彩
- 考虑使用主题色彩系统`;
        break;
      case 'hardcoded_zindex':
        report += `
**修复建议**:
- 定义z-index的层级常量
- 使用语义化的z-index值
- 避免使用过大的z-index值`;
        break;
      case 'hardcoded_timeout':
        report += `
**修复建议**:
- 将超时值提取为常量
- 使用配置文件管理超时设置
- 提供用户可配置的选项`;
        break;
      case 'hardcoded_url':
        report += `
**修复建议**:
- 将URL提取到配置文件
- 使用环境变量管理不同环境的URL
- 考虑使用相对路径`;
        break;
    }

    report += '\n';
  });

  const reportPath = `${resultsDir}/hardcoded-detection-report.md`;
  fs.writeFileSync(reportPath, report);

  console.log(`📄 硬编码检测报告: ${reportPath}`);
}