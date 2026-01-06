#!/usr/bin/env node

/**
 * 前端API调用扫描工具
 * 扫描 /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src 目录下的所有前端 API 调用
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const SRC_DIR = '/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src';
const OUTPUT_FILE = '/persistent/home/zhgue/kyyupgame/frontend-api-scan-report.json';

// 存储结果
const results = {
  scanDate: new Date().toISOString(),
  scanDirectory: SRC_DIR,
  summary: {
    totalFiles: 0,
    totalApiCalls: 0,
    uniqueEndpoints: 0,
    absoluteUrls: 0,
    relativeUrls: 0,
    missingApiPrefix: 0
  },
  endpoints: {},
  files: [],
  issues: []
};

// HTTP方法模式
const httpMethodPatterns = [
  // request.get/post/put/delete/del/patch
  {
    pattern: /request\.(get|post|put|delete|del|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractMethod: (match) => match[1].toUpperCase(),
    extractUrl: (match) => match[2]
  },
  // axios methods
  {
    pattern: /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractMethod: (match) => match[1].toUpperCase(),
    extractUrl: (match) => match[2]
  },
  // request({ method: ..., url: ... })
  {
    pattern: /request\s*\(\s*\{\s*method\s*:\s*['"`]([^'"`]+)['"`]\s*,\s*url\s*:\s*['"`]([^'"`]+)['"`]/g,
    extractMethod: (match) => match[1].toUpperCase(),
    extractUrl: (match) => match[2]
  },
  // fetch(url, { method: ... })
  {
    pattern: /fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*method\s*:\s*['"`]([^'"`]+)['"`]/g,
    extractMethod: (match) => match[2].toUpperCase(),
    extractUrl: (match) => match[1]
  },
  // fetch(url) - default GET
  {
    pattern: /fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*(?!\s*,\s*\{)/g,
    extractMethod: () => 'GET',
    extractUrl: (match) => match[1]
  },
  // aiService.get/post/put/delete
  {
    pattern: /aiService\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractMethod: (match) => match[1].toUpperCase(),
    extractUrl: (match) => match[2]
  },
  // videoCreationRequest.get/post/put/delete
  {
    pattern: /videoCreationRequest\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractMethod: (match) => match[1].toUpperCase(),
    extractUrl: (match) => match[2]
  }
];

// 递归扫描目录
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 跳过 node_modules 和隐藏目录
      if (!file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath, fileList);
      }
    } else if (stat.isFile()) {
      // 只扫描 .ts, .js, .vue 文件
      if (/\.(ts|js|vue)$/.test(file)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// 检查URL类型
function getUrlType(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'absolute';
  } else if (url.startsWith('/api/')) {
    return 'relative-with-prefix';
  } else if (url.startsWith('/')) {
    return 'relative-no-prefix';
  } else {
    return 'relative';
  }
}

// 提取endpoint（去掉查询参数）
function extractEndpoint(url) {
  // 移除查询参数
  const endpoint = url.split('?')[0];
  // 替换路径参数为占位符 (如 :id)
  return endpoint.replace(/\/\d+/g, '/:id');
}

// 扫描单个文件
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileApiCalls = [];

  httpMethodPatterns.forEach(({ pattern, extractMethod, extractUrl }) => {
    let match;
    // 重置正则表达式的lastIndex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
      const method = extractMethod(match);
      const url = extractUrl(match);
      const urlType = getUrlType(url);
      const endpoint = extractEndpoint(url);

      fileApiCalls.push({
        method,
        url,
        urlType,
        endpoint,
        lineNumber: content.substring(0, match.index).split('\n').length
      });

      // 统计endpoint
      if (!results.endpoints[endpoint]) {
        results.endpoints[endpoint] = {
          endpoint,
          urlType,
          methods: {},
          callCount: 0,
          files: []
        };
      }

      if (!results.endpoints[endpoint].methods[method]) {
        results.endpoints[endpoint].methods[method] = 0;
      }
      results.endpoints[endpoint].methods[method]++;
      results.endpoints[endpoint].callCount++;

      // 避免重复添加文件
      if (!results.endpoints[endpoint].files.includes(filePath)) {
        results.endpoints[endpoint].files.push(filePath);
      }
    }
  });

  if (fileApiCalls.length > 0) {
    results.files.push({
      filePath: filePath.replace(SRC_DIR + '/', ''),
      apiCalls: fileApiCalls,
      callCount: fileApiCalls.length
    });
    results.summary.totalApiCalls += fileApiCalls.length;
  }

  return fileApiCalls.length;
}

// 检查问题
function checkIssues() {
  Object.values(results.endpoints).forEach(endpoint => {
    // 检查绝对URL
    if (endpoint.urlType === 'absolute') {
      const url = endpoint.endpoint;
      if (url.includes('localhost:3000') || url.includes('127.0.0.1:3000')) {
        results.issues.push({
          type: 'absolute-localhost-url',
          severity: 'high',
          endpoint: url,
          message: `检测到硬编码的localhost URL: ${url}`
        });
        results.summary.absoluteUrls++;
      }
    }

    // 检查缺失 /api 前缀
    if (endpoint.urlType === 'relative-no-prefix') {
      results.issues.push({
        type: 'missing-api-prefix',
        severity: 'medium',
        endpoint: endpoint.endpoint,
        message: `可能缺失 /api 前缀: ${endpoint.endpoint}`
      });
      results.summary.missingApiPrefix++;
    }

    // 统计相对路径
    if (endpoint.urlType.startsWith('relative')) {
      results.summary.relativeUrls++;
    }
  });

  results.summary.uniqueEndpoints = Object.keys(results.endpoints).length;
}

// 主函数
function main() {
  console.log('开始扫描前端API调用...');
  console.log(`扫描目录: ${SRC_DIR}`);
  console.log('');

  // 扫描目录
  console.log('正在扫描文件...');
  const files = scanDirectory(SRC_DIR);
  results.summary.totalFiles = files.length;
  console.log(`找到 ${files.length} 个源文件`);

  // 扫描API调用
  console.log('正在分析API调用...');
  let fileCount = 0;
  files.forEach(file => {
    const count = scanFile(file);
    if (count > 0) fileCount++;
  });
  console.log(`在 ${fileCount} 个文件中找到 ${results.summary.totalApiCalls} 个API调用`);

  // 检查问题
  console.log('正在检查潜在问题...');
  checkIssues();
  console.log(`发现 ${results.issues.length} 个潜在问题`);

  // 生成报告
  console.log('正在生成报告...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

  // 打印摘要
  console.log('');
  console.log('=== 扫描摘要 ===');
  console.log(`扫描时间: ${results.scanDate}`);
  console.log(`总文件数: ${results.summary.totalFiles}`);
  console.log(`包含API调用的文件: ${results.files.length}`);
  console.log(`总API调用次数: ${results.summary.totalApiCalls}`);
  console.log(`唯一API端点数: ${results.summary.uniqueEndpoints}`);
  console.log(`绝对URL数量: ${results.summary.absoluteUrls}`);
  console.log(`相对URL数量: ${results.summary.relativeUrls}`);
  console.log(`可能缺失/api前缀: ${results.summary.missingApiPrefix}`);
  console.log('');
  console.log(`报告已保存到: ${OUTPUT_FILE}`);

  // 打印问题摘要
  if (results.issues.length > 0) {
    console.log('');
    console.log('=== 发现的问题 ===');
    results.issues.forEach(issue => {
      console.log(`[${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}`);
    });
  }

  // 打印最常用的API端点
  console.log('');
  console.log('=== 最常用的API端点 (Top 20) ===');
  const sortedEndpoints = Object.values(results.endpoints)
    .sort((a, b) => b.callCount - a.callCount)
    .slice(0, 20);

  sortedEndpoints.forEach((endpoint, index) => {
    console.log(`${index + 1}. ${endpoint.endpoint} (${endpoint.callCount} 次调用)`);
  });

  return results;
}

// 运行扫描
try {
  main();
} catch (error) {
  console.error('扫描出错:', error);
  process.exit(1);
}
