#!/usr/bin/env node

/**
 * 中心页面错误检测脚本
 * 使用curl命令检测所有centers页面的HTTP状态码和基础错误
 */

import { execSync } from 'child_process';
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
 * 检测单个页面
 */
function checkPage(path) {
  console.log(`🔍 检测页面: ${path}`);

  try {
    // 使用curl检测HTTP状态码
    const stdout = execSync(`curl -s -o /dev/null -w "%{http_code}" -L "${BASE_URL}${path}"`, {
      encoding: 'utf8',
      timeout: 10000
    });

    const statusCode = parseInt(stdout.trim());

    if (statusCode === 200) {
      console.log(`✅ ${path} - 状态码: ${statusCode}`);
      results.success.push({ path, statusCode });
      results.summary.success++;
    } else if (statusCode === 404) {
      console.log(`❌ ${path} - 404 Not Found`);
      results.errors.push({ path, statusCode, error: '404 Not Found' });
      results.summary.errors++;
    } else if (statusCode >= 500) {
      console.log(`💥 ${path} - 服务器错误: ${statusCode}`);
      results.errors.push({ path, statusCode, error: `Server Error ${statusCode}` });
      results.summary.errors++;
    } else {
      console.log(`⚠️ ${path} - 异常状态码: ${statusCode}`);
      results.warnings.push({ path, statusCode, warning: `Unexpected status code ${statusCode}` });
      results.summary.warnings++;
    }

  } catch (error) {
    console.log(`💥 ${path} - 检测失败: ${error.message}`);
    results.errors.push({ path, error: error.message });
    results.summary.errors++;
  }
}

/**
 * 检测服务状态
 */
function checkServiceStatus() {
  console.log('🔍 检查前端服务状态...');

  try {
    const stdout = execSync(`curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}"`, {
      encoding: 'utf8',
      timeout: 5000
    });

    const statusCode = parseInt(stdout.trim());
    if (statusCode === 200) {
      console.log('✅ 前端服务正常运行');
      return true;
    } else {
      console.log(`❌ 前端服务异常: 状态码 ${statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 前端服务不可用: ${error.message}`);
    return false;
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
  const reportPath = './center-pages-error-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 生成Markdown报告
  const markdownReport = `
# 中心页面错误检测报告

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
  results.errors.map(e => `- **${e.path}** - ${e.error || `状态码: ${e.statusCode}`}`).join('\n') :
  '无错误页面 ✅'
}

## 警告页面详情
${results.warnings.length > 0 ?
  results.warnings.map(w => `- **${w.path}** - ${w.warning || `状态码: ${w.statusCode}`}`).join('\n') :
  '无警告页面 ✅'
}

## 成功页面列表
${results.success.map(s => `- **${s.path}**`).join('\n')}

## 修复建议
${results.summary.errors > 0 ?
  `1. 优先修复404错误页面，检查组件文件是否存在
2. 检查路由配置是否正确
3. 确认页面组件没有语法错误
4. 验证API接口是否正常响应` :
  '所有页面检测正常！建议继续进行功能完整性检测。'
}
`;

  fs.writeFileSync('./center-pages-error-report.md', markdownReport);

  console.log('\n📊 检测完成！报告已生成:');
  console.log(`   - JSON报告: ${reportPath}`);
  console.log(`   - Markdown报告: center-pages-error-report.md`);
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始检测中心页面错误...\n');

  // 检查服务状态
  const serviceOk = checkServiceStatus();
  if (!serviceOk) {
    console.log('❌ 前端服务不可用，请先启动服务后重试');
    process.exit(1);
  }

  console.log('\n📋 开始检测所有中心页面...\n');

  // 检测所有页面
  centerPages.forEach(page => {
    checkPage(page);
  });

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
    console.log('\n❌ 发现错误，请查看报告详情');
    process.exit(1);
  } else {
    console.log('\n✅ 所有页面检测通过！');
  }
}

// 运行主函数
main();