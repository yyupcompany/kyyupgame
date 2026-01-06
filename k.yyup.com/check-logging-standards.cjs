const fs = require('fs');
const path = require('path');

/**
 * 检查日志记录标准和格式
 * 分析现有日志记录的使用情况，识别需要标准化的地方
 */

const routesDir = path.join(__dirname, 'server/src/routes');

// 日志记录模式
const loggingPatterns = {
  // 好的日志记录模式
  good: [
    /console\.log\(['"]\[\w+\]\s*[:：]/,  // [MODULE]: message
    /console\.error\(['"]\[\w+\]\s*[:：]/, // [MODULE]: error message
    /logger\.(info|error|warn|debug)\(['"]\[\w+\]\s*[:：]/, // 使用logger
    /winston\.(info|error|warn|debug)\(['"]\[\w+\]\s*[:：]/ // 使用winston
  ],
  // 需要改进的模式
  needsImprovement: [
    /console\.log\([^,)]*\)/, // 简单的console.log
    /console\.error\([^,)]*\)/, // 简单的console.error
    /console\.warn\([^,)]*\)/, // 使用console.warn而非console.error
  ]
};

function checkLoggingInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let loggingUsage = {
      consoleLog: 0,
      consoleError: 0,
      consoleWarn: 0,
      logger: 0,
      winston: 0,
      goodFormat: 0,
      needsImprovement: 0,
      structuredLogging: 0
    };

    let issues = [];
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;

      // 统计各种日志类型
      if (line.includes('console.log')) {
        loggingUsage.consoleLog++;
      }
      if (line.includes('console.error')) {
        loggingUsage.consoleError++;
      }
      if (line.includes('console.warn')) {
        loggingUsage.consoleWarn++;
      }
      if (line.includes('logger.')) {
        loggingUsage.logger++;
      }
      if (line.includes('winston.')) {
        loggingUsage.winston++;
      }

      // 检查格式是否良好
      const hasGoodFormat = loggingPatterns.good.some(pattern => pattern.test(line));
      if (hasGoodFormat) {
        loggingUsage.goodFormat++;
      }

      // 检查是否需要改进
      const needsImprovement = loggingPatterns.needsImprovement.some(pattern => {
        const match = line.match(pattern);
        // 排除已经格式良好的日志
        if (match && !hasGoodFormat) {
          return true;
        }
        return false;
      });

      if (needsImprovement) {
        loggingUsage.needsImprovement++;
        issues.push({
          line: lineNumber,
          content: line.trim(),
          issue: 'format_needs_improvement'
        });
      }

      // 检查结构化日志
      if (line.includes('JSON.stringify') &&
          (line.includes('console') || line.includes('logger') || line.includes('winston'))) {
        loggingUsage.structuredLogging++;
      }

      // 检查错误处理中的日志
      if (line.includes('catch') &&
          (line.includes('console') || line.includes('logger') || line.includes('winston'))) {
        // 这是一个好的实践，在catch块中记录错误
      }
    }

    // 计算日志质量得分
    const totalLogging = loggingUsage.consoleLog + loggingUsage.consoleError +
                        loggingUsage.logger + loggingUsage.winston;
    const qualityScore = totalLogging > 0 ?
      (loggingUsage.goodFormat + loggingUsage.structuredLogging) / totalLogging * 100 : 100;

    return {
      loggingUsage,
      issues,
      qualityScore: Math.round(qualityScore),
      totalLogging
    };
  } catch (error) {
    console.error(`❌ 错误处理文件 ${filePath}:`, error.message);
    return { error: error.message };
  }
}

function scanLoggingStandards(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let totalFiles = 0;
  let filesWithLogging = 0;
  let filesNeedingImprovement = 0;
  let totalIssues = 0;
  let averageQualityScore = 0;
  let qualityScores = [];

  const fileDetails = [];

  console.log('🔍 扫描并检查日志记录标准...\n');
  console.log('📋 日志记录标准建议:');
  console.log('   - 使用模块前缀: [MODULE]: message');
  console.log('   - 错误日志使用 console.error 或 logger.error');
  console.log('   - 包含上下文信息（用户ID、请求ID等）');
  console.log('   - 使用结构化日志格式（JSON）');
  console.log('   - 避免在生产环境使用 console.log\n');

  for (const file of files) {
    if (file.endsWith('.routes.ts')) {
      const filePath = path.join(dir, file);
      totalFiles++;

      const result = checkLoggingInFile(filePath);

      if (result.error) {
        console.log(`❌ 处理错误: ${file} - ${result.error}`);
        continue;
      }

      if (result.totalLogging > 0) {
        filesWithLogging++;

        // 存储详细信息
        fileDetails.push({
          file,
          ...result
        });

        qualityScores.push(result.qualityScore);

        if (result.issues.length > 0 || result.qualityScore < 80) {
          filesNeedingImprovement++;
          totalIssues += result.issues.length;

          console.log(`⚠️  需要改进: ${file} (质量得分: ${result.qualityScore}%)`);
          console.log(`   - 日志使用: console.log(${result.loggingUsage.consoleLog}), ` +
                     `console.error(${result.loggingUsage.consoleError}), ` +
                     `logger(${result.loggingUsage.logger})`);

          if (result.issues.length > 0) {
            console.log(`   - 主要问题: ${result.issues.length}个格式需要改进`);
          }
        } else {
          console.log(`✅ 日志格式良好: ${file} (质量得分: ${result.qualityScore}%)`);
        }
      } else {
        console.log(`ℹ️  无日志记录: ${file}`);
      }
    }
  }

  // 计算平均质量得分
  if (qualityScores.length > 0) {
    averageQualityScore = Math.round(
      qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    );
  }

  console.log(`\n📊 日志记录统计:`);
  console.log(`   - 扫描文件数: ${totalFiles}`);
  console.log(`   - 有日志记录的文件: ${filesWithLogging}`);
  console.log(`   - 需要改进的文件: ${filesNeedingImprovement}`);
  console.log(`   - 平均质量得分: ${averageQualityScore}%`);
  console.log(`   - 格式问题总数: ${totalIssues}`);

  // 分析日志使用情况
  const totalUsage = fileDetails.reduce((sum, file) => ({
    consoleLog: sum.consoleLog + file.loggingUsage.consoleLog,
    consoleError: sum.consoleError + file.loggingUsage.consoleError,
    consoleWarn: sum.consoleWarn + file.loggingUsage.consoleWarn,
    logger: sum.logger + file.loggingUsage.logger,
    winston: sum.winston + file.loggingUsage.winston,
    structuredLogging: sum.structuredLogging + file.loggingUsage.structuredLogging
  }), { consoleLog: 0, consoleError: 0, consoleWarn: 0, logger: 0, winston: 0, structuredLogging: 0 });

  console.log(`\n📈 日志类型分布:`);
  console.log(`   - console.log: ${totalUsage.consoleLog}次`);
  console.log(`   - console.error: ${totalUsage.consoleError}次`);
  console.log(`   - console.warn: ${totalUsage.consoleWarn}次`);
  console.log(`   - logger.*: ${totalUsage.logger}次`);
  console.log(`   - winston.*: ${totalUsage.winston}次`);
  console.log(`   - 结构化日志: ${totalUsage.structuredLogging}次`);

  // 生成改进建议报告
  const reportPath = path.join(process.cwd(), 'logging-standards-report.md');
  const reportContent = generateLoggingReport(fileDetails, totalUsage, averageQualityScore);
  fs.writeFileSync(reportPath, reportContent, 'utf8');

  console.log(`\n📄 详细报告已生成: ${reportPath}`);

  // 提供改进建议
  if (filesNeedingImprovement > 0) {
    console.log(`\n💡 主要改进建议:`);
    console.log(`   1. 统一日志格式，使用 [MODULE]: 前缀`);
    console.log(`   2. 将 console.log 替换为适当的日志级别`);
    console.log(`   3. 在关键操作处添加结构化日志`);
    console.log(`   4. 包含请求上下文信息`);
    console.log(`   5. 使用专业的日志库（如winston）`);
  }

  // 质量评级
  let grade = 'A';
  if (averageQualityScore < 90) grade = 'B';
  if (averageQualityScore < 80) grade = 'C';
  if (averageQualityScore < 70) grade = 'D';
  if (averageQualityScore < 60) grade = 'F';

  console.log(`\n🏆 日志记录质量评级: ${grade} (${averageQualityScore}%)`);
}

function generateLoggingReport(fileDetails, totalUsage, averageQualityScore) {
  // 按质量得分排序
  const sortedFiles = fileDetails.sort((a, b) => a.qualityScore - b.qualityScore);

  return `# 日志记录标准检查报告

## 概述
- 检查时间: ${new Date().toISOString()}
- 检查文件数: ${fileDetails.length}
- 平均质量得分: ${averageQualityScore}%

## 总体统计

### 日志类型使用情况
- console.log: ${totalUsage.consoleLog}次
- console.error: ${totalUsage.consoleError}次
- console.warn: ${totalUsage.consoleWarn}次
- logger.*: ${totalUsage.logger}次
- winston.*: ${totalUsage.winston}次
- 结构化日志: ${totalUsage.structuredLogging}次

### 质量分布
- 优秀 (90-100%): ${fileDetails.filter(f => f.qualityScore >= 90).length}个文件
- 良好 (80-89%): ${fileDetails.filter(f => f.qualityScore >= 80 && f.qualityScore < 90).length}个文件
- 一般 (70-79%): ${fileDetails.filter(f => f.qualityScore >= 70 && f.qualityScore < 80).length}个文件
- 需要改进 (<70%): ${fileDetails.filter(f => f.qualityScore < 70).length}个文件

## 文件详细分析

### 质量得分最低的文件

${sortedFiles.slice(0, 10).map(file => `
#### ${file.file}
- 质量得分: ${file.qualityScore}%
- 日志使用: console.log(${file.loggingUsage.consoleLog}), console.error(${file.loggingUsage.consoleError}), logger(${file.loggingUsage.logger})
- 问题数量: ${file.issues.length}
- 主要问题: ${file.issues.slice(0, 3).map(i => \`第\${i.line}行 - \${i.content}\`).join('; ')}
`).join('')}

## 改进建议

### 1. 日志格式标准化
推荐格式：
\`\`\`typescript
// 使用模块前缀
console.log('[AUTH]: User login attempt', { userId, ip });
console.error('[DATABASE]: Connection failed', error);

// 结构化日志
logger.info('[ACTIVITY]: Activity created', {
  activityId,
  createdBy: req.user.id,
  timestamp: new Date()
});
\`\`\`

### 2. 日志级别指南
- **error**: 错误和异常情况
- **warn**: 警告信息（如性能问题）
- **info**: 重要的业务操作
- **debug**: 调试信息（仅开发环境）

### 3. 必须包含的信息
- 模块名称（前缀）
- 操作类型
- 相关ID（用户ID、请求ID等）
- 时间戳
- 错误详情（如果是错误日志）

### 4. 性能考虑
- 避免在生产环境使用过多debug日志
- 使用异步日志记录
- 实现日志轮转和归档

### 5. 安全考虑
- 不要记录敏感信息（密码、token等）
- 对个人信息进行脱敏处理
- 实现日志访问控制

## 下一步行动计划

1. **立即行动**（1-2周）
   - 修复质量得分最低的10个文件
   - 建立日志格式标准文档
   - 团队培训最佳实践

2. **短期目标**（1个月）
   - 实现统一的日志记录工具类
   - 添加请求ID追踪
   - 配置生产环境日志级别

3. **长期目标**（3个月）
   - 集成专业的日志管理系统
   - 实现日志分析和监控
   - 建立日志告警机制

## 最佳实践示例

### 错误处理日志
\`\`\`typescript
try {
  // 业务逻辑
} catch (error) {
  console.error('[SERVICE]: Operation failed', {
    operation: 'createUser',
    userId: req.user.id,
    error: error.message,
    stack: error.stack
  });
  return next(error);
}
\`\`\`

### 业务操作日志
\`\`\`typescript
// 记录重要业务操作
logger.info('[ENROLLMENT]: Application submitted', {
  applicationId: application.id,
  applicantId: req.user.id,
  kindergartenId: application.kindergartenId,
  status: application.status
});
\`\`\`

### 性能监控日志
\`\`\`typescript
const startTime = Date.now();
// ... 执行操作
const duration = Date.now() - startTime;

if (duration > 1000) {
  console.warn('[PERFORMANCE]: Slow operation detected', {
    operation: 'databaseQuery',
    duration: \`\${duration}ms\`,
    threshold: '1000ms'
  });
}
\`\`\`
`;
}

// 开始执行
console.log('🚀 开始检查日志记录标准...\n');
scanLoggingStandards(routesDir);