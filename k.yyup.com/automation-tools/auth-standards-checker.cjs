const fs = require('fs');
const path = require('path');

/**
 * 认证标准化自动化检查工具
 * 整合所有认证相关的标准化检查功能
 */

const routesDir = path.join(__dirname, '/../server/src/routes');

// 检查配置
const checkConfig = {
  // 导入路径检查
  importPaths: {
    correct: '../middlewares/auth.middleware',
    incorrect: '../middleware/auth-middleware'
  },
  // 中间件命名标准
  middlewareNames: {
    standard: 'verifyToken',
    nonStandard: ['authMiddleware', 'authenticate']
  },
  // 全局认证检查
  globalAuth: {
    pattern: /router\.use\s*\(\s*verifyToken\s*\)(?!\s*\/\/)/,
    commentedPattern: /\/\/\s*router\.use\s*\(\s*verifyToken\s*\)/
  },
  // 重复认证检查
  duplicateAuth: {
    pattern: /verifyToken/,
    excludeLines: [/router\.use\s*\(\s*verifyToken/]
  },
  // 权限代码标准（部分示例）
  permissionCodes: {
    // 这些应该使用新格式
    legacyPatterns: [
      'PARENT_MANAGE',
      'TEACHER_MANAGE',
      'STUDENT_MANAGE',
      'USER_MANAGE',
      'SYSTEM_MANAGE'
    ]
  }
};

// 检查结果
const results = {
  importPathIssues: [],
  middlewareNamingIssues: [],
  globalAuthIssues: [],
  duplicateAuthIssues: [],
  permissionCodeIssues: [],
  publicEndpointIssues: [],
  errorResponseIssues: [],
  loggingIssues: [],
  summary: {
    totalFiles: 0,
    filesWithIssues: 0,
    totalIssues: 0
  }
};

// 1. 检查导入路径
function checkImportPaths(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(checkConfig.importPaths.incorrect)) {
    results.importPathIssues.push({
      file: path.basename(filePath),
      issue: '使用错误的导入路径',
      current: checkConfig.importPaths.incorrect,
      expected: checkConfig.importPaths.correct
    });
    return true;
  }
  return false;
}

// 2. 检查中间件命名
function checkMiddlewareNaming(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let hasIssues = false;

  for (const name of checkConfig.middlewareNames.nonStandard) {
    if (content.includes(name)) {
      // 查找具体行号
      const lineNumbers = [];
      lines.forEach((line, index) => {
        if (line.includes(name)) {
          lineNumbers.push(index + 1);
        }
      });

      results.middlewareNamingIssues.push({
        file: path.basename(filePath),
        issue: `使用非标准中间件命名: ${name}`,
        lines: lineNumbers,
        expected: checkConfig.middlewareNames.standard
      });
      hasIssues = true;
    }
  }
  return hasIssues;
}

// 3. 检查全局认证
function checkGlobalAuth(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const hasEnabled = checkConfig.globalAuth.pattern.test(content);
  const hasCommented = checkConfig.globalAuth.commentedPattern.test(content);

  if (hasCommented && !hasEnabled) {
    results.globalAuthIssues.push({
      file: path.basename(filePath),
      issue: '全局认证被注释掉',
      recommendation: '启用 router.use(verifyToken)'
    });
    return true;
  }
  return false;
}

// 4. 检查重复认证
function checkDuplicateAuth(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // 检查是否有全局认证
  const hasGlobalAuth = checkConfig.globalAuth.pattern.test(content);
  if (!hasGlobalAuth) return false;

  let duplicateCount = 0;
  const duplicateLines = [];

  lines.forEach((line, index) => {
    if (checkConfig.duplicateAuth.pattern.test(line)) {
      const isGlobalAuth = checkConfig.duplicateAuth.excludeLines.some(pattern =>
        pattern.test(line)
      );

      if (!isGlobalAuth) {
        duplicateCount++;
        duplicateLines.push(index + 1);
      }
    }
  });

  if (duplicateCount > 2) { // 允许少量特殊情况
    results.duplicateAuthIssues.push({
      file: path.basename(filePath),
      issue: '存在重复的verifyToken调用',
      count: duplicateCount,
      lines: duplicateLines,
      recommendation: '移除路由中的重复verifyToken，使用全局认证'
    });
    return true;
  }
  return false;
}

// 5. 检查权限代码
function checkPermissionCodes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasIssues = false;

  for (const pattern of checkConfig.permissionCodes.legacyPatterns) {
    if (content.includes(pattern)) {
      results.permissionCodeIssues.push({
        file: path.basename(filePath),
        issue: `使用过时的权限代码格式: ${pattern}`,
        recommendation: `转换为新的格式，如: ${pattern.toLowerCase().replace(/_/g, ':')}`
      });
      hasIssues = true;
    }
  }
  return hasIssues;
}

// 6. 检查公开接口（简化版）
function checkPublicEndpoints(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // 公开接口模式
  const publicPatterns = [
    /\/health/i,
    /\/ping/i,
    /\/status/i,
    /\/version/i,
    /\/auth\/login/i,
    /\/auth\/register/i
  ];

  let hasIssues = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 查找路由定义
    const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (routeMatch) {
      const path = routeMatch[2];

      // 检查是否是公开接口但有security部分
      if (publicPatterns.some(pattern => pattern.test(path))) {
        // 向上查找Swagger注释
        let hasSecurity = false;
        for (let j = i - 1; j >= 0; j--) {
          if (lines[j].includes('security:') && lines[j].includes('bearerAuth')) {
            hasSecurity = true;
            break;
          }
          if (lines[j].includes('/**')) {
            break;
          }
        }

        if (hasSecurity) {
          results.publicEndpointIssues.push({
            file: path.basename(filePath),
            path: path,
            issue: '公开接口包含security部分',
            line: i + 1
          });
          hasIssues = true;
        }
      }
    }
  }

  return hasIssues;
}

// 7. 检查错误响应（简化版）
function checkErrorResponses(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasIssues = false;

  // 查找401/403/500响应定义
  const errorCodes = ['401', '403', '500'];

  for (const code of errorCodes) {
    const regex = new RegExp(`^\\s*${code}:\\s*$`, 'gm');
    const matches = content.match(regex);

    if (matches) {
      // 简单检查是否有标准字段
      const responseBlock = content.substring(content.indexOf(matches[0]));
      if (!responseBlock.includes('success:') ||
          !responseBlock.includes('message:') ||
          !responseBlock.includes('code:')) {
        results.errorResponseIssues.push({
          file: path.basename(filePath),
          code: code,
          issue: `${code}响应缺少标准字段`
        });
        hasIssues = true;
      }
    }
  }

  return hasIssues;
}

// 8. 检查日志记录（简化版）
function checkLogging(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // 统计console使用
  const consoleLogCount = (content.match(/console\.log\(/g) || []).length;
  const consoleErrorCount = (content.match(/console\.error\(/g) || []).length;

  // 检查是否有模块前缀
  const goodFormatCount = (content.match(/console\.(log|error)\(\s*['"`]\[[\w\s]+\]['"`]/g) || []).length;

  const totalLogs = consoleLogCount + consoleErrorCount;

  if (totalLogs > 0 && goodFormatCount < totalLogs * 0.5) {
    results.loggingIssues.push({
      file: path.basename(filePath),
      issue: '日志格式不标准',
      stats: {
        total: totalLogs,
        goodFormat: goodFormatCount,
        needsImprovement: totalLogs - goodFormatCount
      },
      recommendation: '使用 [MODULE]: 前缀格式化日志'
    });
    return true;
  }

  return false;
}

// 运行所有检查
function runAllChecks() {
  console.log('🚀 认证标准化自动化检查工具\n');
  console.log('📋 检查项目:');
  console.log('   1. 导入路径标准化');
  console.log('   2. 中间件命名统一');
  console.log('   3. 全局认证配置');
  console.log('   4. 重复认证检测');
  console.log('   5. 权限代码格式');
  console.log('   6. 公开接口标注');
  console.log('   7. 错误响应格式');
  console.log('   8. 日志记录规范\n');

  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.routes.ts'));
  results.summary.totalFiles = files.length;

  console.log('🔍 开始检查文件...\n');

  files.forEach(file => {
    const filePath = path.join(routesDir, file);
    const fileName = path.basename(file);

    process.stdout.write(`检查: ${fileName.padEnd(35)} `);

    let fileHasIssues = false;

    // 运行各项检查
    if (checkImportPaths(filePath)) fileHasIssues = true;
    if (checkMiddlewareNaming(filePath)) fileHasIssues = true;
    if (checkGlobalAuth(filePath)) fileHasIssues = true;
    if (checkDuplicateAuth(filePath)) fileHasIssues = true;
    if (checkPermissionCodes(filePath)) fileHasIssues = true;
    if (checkPublicEndpoints(filePath)) fileHasIssues = true;
    if (checkErrorResponses(filePath)) fileHasIssues = true;
    if (checkLogging(filePath)) fileHasIssues = true;

    if (fileHasIssues) {
      results.summary.filesWithIssues++;
      process.stdout.write('❌ 发现问题\n');
    } else {
      process.stdout.write('✅ 通过\n');
    }
  });

  // 统计总问题数
  results.summary.totalIssues =
    results.importPathIssues.length +
    results.middlewareNamingIssues.length +
    results.globalAuthIssues.length +
    results.duplicateAuthIssues.length +
    results.permissionCodeIssues.length +
    results.publicEndpointIssues.length +
    results.errorResponseIssues.length +
    results.loggingIssues.length;

  // 生成报告
  generateReport();
}

// 生成检查报告
function generateReport() {
  const reportPath = path.join(process.cwd(), 'auth-standards-check-report.md');

  const report = `# 认证标准化检查报告

## 概览
- 检查时间: ${new Date().toISOString()}
- 检查文件数: ${results.summary.totalFiles}
- 有问题的文件: ${results.summary.filesWithIssues}
- 总问题数: ${results.summary.totalIssues}
- 通过率: ${Math.round((1 - results.summary.filesWithIssues / results.summary.totalFiles) * 100)}%

## 问题分类统计

### 1. 导入路径问题 (${results.importPathIssues.length}个)
${results.importPathIssues.length > 0 ?
  results.importPathIssues.map(issue => `- ${issue.file}: ${issue.issue}`).join('\n') :
  '无问题'
}

### 2. 中间件命名问题 (${results.middlewareNamingIssues.length}个)
${results.middlewareNamingIssues.length > 0 ?
  results.middlewareNamingIssues.map(issue => `- ${issue.file}: ${issue.issue}`).join('\n') :
  '无问题'
}

### 3. 全局认证问题 (${results.globalAuthIssues.length}个)
${results.globalAuthIssues.length > 0 ?
  results.globalAuthIssues.map(issue => `- ${issue.file}: ${issue.issue}`).join('\n') :
  '无问题'
}

### 4. 重复认证问题 (${results.duplicateAuthIssues.length}个)
${results.duplicateAuthIssues.length > 0 ?
  results.duplicateAuthIssues.map(issue => `- ${issue.file}: ${issue.issue} (${issue.count}处)`).join('\n') :
  '无问题'
}

### 5. 权限代码问题 (${results.permissionCodeIssues.length}个)
${results.permissionCodeIssues.length > 0 ?
  results.permissionCodeIssues.map(issue => `- ${issue.file}: ${issue.issue}`).join('\n') :
  '无问题'
}

### 6. 公开接口问题 (${results.publicEndpointIssues.length}个)
${results.publicEndpointIssues.length > 0 ?
  results.publicEndpointIssues.map(issue => `- ${issue.file}: ${issue.path} ${issue.issue}`).join('\n') :
  '无问题'
}

### 7. 错误响应问题 (${results.errorResponseIssues.length}个)
${results.errorResponseIssues.length > 0 ?
  results.errorResponseIssues.map(issue => `- ${issue.file}: ${issue.code} ${issue.issue}`).join('\n') :
  '无问题'
}

### 8. 日志记录问题 (${results.loggingIssues.length}个)
${results.loggingIssues.length > 0 ?
  results.loggingIssues.map(issue => `- ${issue.file}: ${issue.issue} (需要改进: ${issue.stats.needsImprovement}处)`).join('\n') :
  '无问题'
}

## 修复建议

### 立即修复（高优先级）
1. **导入路径**: 将 \`middleware/auth-middleware\` 改为 \`middlewares/auth.middleware\`
2. **全局认证**: 启用被注释的 \`router.use(verifyToken)\`
3. **重复认证**: 移除路由中重复的verifyToken调用

### 标准化改进（中优先级）
1. **中间件命名**: 统一使用 \`verifyToken\`
2. **权限代码**: 将大写格式改为小写+冒号格式
3. **公开接口**: 移除不必要的security部分

### 质量提升（低优先级）
1. **错误响应**: 确保包含success, message, code字段
2. **日志记录**: 使用[MODULE]:前缀格式

## 自动化修复工具

以下脚本可以帮助自动修复大部分问题：

1. \`fix-middleware-naming.cjs\` - 修复中间件命名
2. \`enable-global-auth.cjs\` - 启用全局认证
3. \`remove-duplicate-auth.cjs\` - 移除重复认证
4. \`standardize-permission-codes.cjs\` - 标准化权限代码
5. \`fix-public-endpoints.cjs\` - 修复公开接口标注

## 定期检查

建议将此检查工具集成到CI/CD流程中：
\`\`\bash
# 开发环境
node automation-tools/auth-standards-checker.cjs

# CI/CD环境
node automation-tools/auth-standards-checker.cjs --exit-on-error
\`\`\

## 质量门控

建议设置以下质量门控：
- 通过率 ≥ 95%
- 导入路径问题 = 0
- 全局认证启用率 ≥ 90%
- 无严重安全问题
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📊 检查完成！`);
  console.log(`   - 总文件数: ${results.summary.totalFiles}`);
  console.log(`   - 问题文件: ${results.summary.filesWithIssues}`);
  console.log(`   - 总问题数: ${results.summary.totalIssues}`);
  console.log(`   - 通过率: ${Math.round((1 - results.summary.filesWithIssues / results.summary.totalFiles) * 100)}%`);
  console.log(`\n📄 详细报告: ${reportPath}`);

  // 如果有严重问题，返回非零退出码
  if (results.importPathIssues.length > 0 || results.globalAuthIssues.length > 0) {
    process.exit(1);
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const exitOnError = args.includes('--exit-on-error');

  try {
    runAllChecks();
  } catch (error) {
    console.error('\n❌ 检查过程中发生错误:', error.message);
    if (exitOnError) {
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  runAllChecks,
  results
};