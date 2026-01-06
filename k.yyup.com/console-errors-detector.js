#!/usr/bin/env node

/**
 * 控制台错误检测脚本
 * 使用Puppeteer检测所有centers页面的JavaScript控制台错误
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

// 所有centers页面的路由配置
const centerPages = [
  // 主要中心页面
  '/centers/index',
  '/centers/enrollment',
  '/centers/personnel',
  '/centers/activity',
  '/centers/task',
  '/centers/task/form',
  '/centers/inspection',
  '/centers/business',
  '/centers/finance',
  '/centers/call-center',
  '/centers/customer',
  '/centers/teaching',
  '/centers/document-center',
  '/centers/document-collaboration',
  '/centers/document-editor',
  '/centers/document-template',
  '/centers/document-instances',
  '/centers/document-statistics',
  '/centers/media',
  '/centers/attendance',
  '/centers/assessment',

  // 其他相关中心
  '/centers/marketing',
  '/centers/ai',
  '/centers/system',
  '/centers/customer-pool',
  '/centers/analytics',
  '/centers/script'
];

// 基础URL配置
const BASE_URL = 'http://localhost:5173';

// 检测结果
const results = {
  success: [],
  errors: [],
  warnings: [],
  summary: {
    total: centerPages.length,
    success: 0,
    errors: 0,
    warnings: 0
  }
};

/**
 * 检测单个页面的控制台错误
 */
async function checkPageConsoleErrors(page, path) {
  console.log(`🔍 检测页面控制台错误: ${path}`);

  const pageErrors = [];
  const pageWarnings = [];

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      pageErrors.push({
        type: 'error',
        text: text,
        location: msg.location()
      });
      console.log(`❌ ${path} - 控制台错误: ${text}`);
    } else if (type === 'warning') {
      pageWarnings.push({
        type: 'warning',
        text: text,
        location: msg.location()
      });
      console.log(`⚠️ ${path} - 控制台警告: ${text}`);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    pageErrors.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack
    });
    console.log(`💥 ${path} - 页面错误: ${error.message}`);
  });

  // 监听请求失败
  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure && failure.errorText !== 'net::ERR_ABORTED') {
      pageErrors.push({
        type: 'requestfailed',
        url: request.url(),
        error: failure.errorText
      });
      console.log(`🌐 ${path} - 请求失败: ${request.url()} - ${failure.errorText}`);
    }
  });

  try {
    // 导航到页面
    const response = await page.goto(`${BASE_URL}${path}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待页面加载完成
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 检查页面状态
    const statusCode = response.status();

    if (statusCode === 200) {
      // 检查页面是否有基本内容
      const hasContent = await page.evaluate(() => {
        return document.body && document.body.innerHTML.length > 100;
      });

      if (hasContent) {
        console.log(`✅ ${path} - 页面正常加载`);

        const pageResult = {
          path,
          statusCode,
          errors: pageErrors,
          warnings: pageWarnings,
          hasContent: true
        };

        if (pageErrors.length === 0 && pageWarnings.length === 0) {
          results.success.push(pageResult);
          results.summary.success++;
        } else {
          if (pageErrors.length > 0) {
            results.errors.push(pageResult);
            results.summary.errors++;
          }
          if (pageWarnings.length > 0) {
            results.warnings.push(pageResult);
            results.summary.warnings++;
          }
        }
      } else {
        console.log(`❌ ${path} - 页面内容为空`);
        results.errors.push({
          path,
          statusCode,
          errors: [{ type: 'empty_content', text: '页面内容为空' }],
          warnings: pageWarnings,
          hasContent: false
        });
        results.summary.errors++;
      }
    } else {
      console.log(`❌ ${path} - HTTP错误: ${statusCode}`);
      results.errors.push({
        path,
        statusCode,
        errors: [{ type: 'http_error', text: `HTTP ${statusCode}` }],
        warnings: pageWarnings,
        hasContent: false
      });
      results.summary.errors++;
    }

  } catch (error) {
    console.log(`💥 ${path} - 检测失败: ${error.message}`);
    results.errors.push({
      path,
      errors: [{ type: 'navigation_error', text: error.message }],
      warnings: pageWarnings
    });
    results.summary.errors++;
  }
}

/**
 * 生成检测报告
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: results.summary,
    details: {
      success: results.success,
      errors: results.errors,
      warnings: results.warnings
    }
  };

  // 生成报告文件
  const reportPath = './console-errors-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 生成Markdown报告
  const markdownReport = `
# 控制台错误检测报告

## 检测时间
${new Date().toLocaleString('zh-CN')}

## 检测概况
- **总计页面**: ${results.summary.total}
- **成功页面**: ${results.summary.success} ✅
- **错误页面**: ${results.summary.errors} ❌
- **警告页面**: ${results.summary.warnings} ⚠️
- **成功率**: ${((results.summary.success / results.summary.total) * 100).toFixed(2)}%

## 错误页面详情
${results.errors.length > 0 ?
  results.errors.map(e => `
### ${e.path}
- **HTTP状态**: ${e.statusCode || 'N/A'}
- **错误数量**: ${e.errors.length}
${e.errors.map(err => `- ${err.type}: ${err.text}`).join('\n')}
${e.warnings && e.warnings.length > 0 ?
  `**警告**:\n${e.warnings.map(w => `- ${w.text}`).join('\n')}` : ''
}
`).join('\n') :
  '无错误页面 ✅'
}

## 警告页面详情
${results.warnings.filter(w => w.errors.length === 0).length > 0 ?
  results.warnings.filter(w => w.errors.length === 0).map(w => `
### ${w.path}
- **警告数量**: ${w.warnings.length}
${w.warnings.map(warn => `- ${warn.text}`).join('\n')}
`).join('\n') :
  '无独立警告页面 ✅'
}

## 成功页面列表
${results.success.map(s => `- **${s.path}**`).join('\n')}

## 修复建议
${results.summary.errors > 0 ?
  `### 优先修复项
1. **JavaScript错误**: 修复控制台中的JavaScript语法和逻辑错误
2. **资源加载失败**: 检查缺失的组件文件和API接口
3. **HTTP错误**: 确认路由配置正确
4. **依赖问题**: 检查组件依赖关系

### 修复步骤
1. 查看具体的错误信息和堆栈跟踪
2. 检查对应组件文件的代码质量
3. 确认所有必要的依赖都已正确导入
4. 测试修复后的页面功能` :
  '所有页面检测正常！建议进行更深入的功能测试。'
}
`;

  fs.writeFileSync('./console-errors-report.md', markdownReport);

  console.log('\n📊 检测完成！报告已生成:');
  console.log(`   - JSON报告: ${reportPath}`);
  console.log(`   - Markdown报告: console-errors-report.md`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始检测控制台错误...\n');

  let browser;
  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // 设置视口
    await page.setViewport({
      width: 1366,
      height: 768
    });

    console.log('📋 开始检测所有页面的控制台错误...\n');

    // 检测所有页面
    for (const path of centerPages) {
      await checkPageConsoleErrors(page, path);
      // 清理监听器
      page.removeAllListeners('console');
      page.removeAllListeners('pageerror');
      page.removeAllListeners('requestfailed');
    }

    await browser.close();

  } catch (error) {
    console.error('❌ 浏览器启动失败:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }

  // 生成报告
  console.log('\n📊 生成检测报告...\n');
  generateReport();

  // 输出汇总
  console.log(`\n🎯 检测汇总:`);
  console.log(`   总计: ${results.summary.total} 页面`);
  console.log(`   成功: ${results.summary.success} ✅`);
  console.log(`   错误: ${results.summary.errors} ❌`);
  console.log(`   警告: ${results.summary.warnings} ⚠️`);
  console.log(`   成功率: ${((results.summary.success / results.summary.total) * 100).toFixed(2)}%`);

  // 如果有错误，退出码为1
  if (results.summary.errors > 0) {
    console.log('\n❌ 发现控制台错误，请查看报告详情');
    process.exit(1);
  } else {
    console.log('\n✅ 所有页面控制台检测通过！');
  }
}

// 运行主函数
main().catch(console.error);