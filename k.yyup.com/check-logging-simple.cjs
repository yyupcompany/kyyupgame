const fs = require('fs');
const path = require('path');

/**
 * 检查日志记录标准和格式（简化版）
 */

const routesDir = path.join(__dirname, 'server/src/routes');

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
      needsImprovement: 0
    };

    for (const line of lines) {
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

      // 检查格式
      if (line.includes('console.') && line.includes('[') && line.includes(']:')) {
        loggingUsage.goodFormat++;
      } else if (line.includes('console.') && !line.includes('//')) {
        loggingUsage.needsImprovement++;
      }
    }

    // 计算质量得分
    const totalLogging = loggingUsage.consoleLog + loggingUsage.consoleError +
                        loggingUsage.logger + loggingUsage.winston;
    const qualityScore = totalLogging > 0 ?
      Math.round((loggingUsage.goodFormat / totalLogging) * 100) : 100;

    return {
      loggingUsage,
      qualityScore,
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

  const totalUsage = {
    consoleLog: 0,
    consoleError: 0,
    consoleWarn: 0,
    logger: 0,
    winston: 0
  };

  console.log('🔍 扫描并检查日志记录标准...\n');

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
        qualityScores.push(result.qualityScore);

        // 累计统计
        totalUsage.consoleLog += result.loggingUsage.consoleLog;
        totalUsage.consoleError += result.loggingUsage.consoleError;
        totalUsage.consoleWarn += result.loggingUsage.consoleWarn;
        totalUsage.logger += result.loggingUsage.logger;
        totalUsage.winston += result.loggingUsage.winston;

        if (result.qualityScore < 80) {
          filesNeedingImprovement++;
          totalIssues += result.loggingUsage.needsImprovement;

          console.log(`⚠️  需要改进: ${file} (质量得分: ${result.qualityScore}%)`);
          console.log(`   - 日志使用: console.log(${result.loggingUsage.consoleLog}), ` +
                     `console.error(${result.loggingUsage.consoleError}), ` +
                     `logger(${result.loggingUsage.logger})`);
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

  console.log(`\n📈 日志类型分布:`);
  console.log(`   - console.log: ${totalUsage.consoleLog}次`);
  console.log(`   - console.error: ${totalUsage.consoleError}次`);
  console.log(`   - console.warn: ${totalUsage.consoleWarn}次`);
  console.log(`   - logger.*: ${totalUsage.logger}次`);
  console.log(`   - winston.*: ${totalUsage.winston}次`);

  // 质量评级
  let grade = 'A';
  if (averageQualityScore < 90) grade = 'B';
  if (averageQualityScore < 80) grade = 'C';
  if (averageQualityScore < 70) grade = 'D';
  if (averageQualityScore < 60) grade = 'F';

  console.log(`\n🏆 日志记录质量评级: ${grade} (${averageQualityScore}%)`);

  // 提供改进建议
  if (filesNeedingImprovement > 0) {
    console.log(`\n💡 主要改进建议:`);
    console.log(`   1. 统一日志格式，使用 [MODULE]: 前缀`);
    console.log(`   2. 将简单的 console.log 改为带模块前缀的格式`);
    console.log(`   3. 在错误处理中使用 console.error`);
    console.log(`   4. 考虑使用专业的日志库（如winston）`);
    console.log(`   5. 添加结构化日志记录`);

    // 生成简单的报告
    const reportPath = path.join(process.cwd(), 'logging-summary.txt');
    const reportContent = generateSimpleReport(totalFiles, filesWithLogging, filesNeedingImprovement, averageQualityScore, totalUsage);
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`\n📄 简要报告已生成: ${reportPath}`);
  }
}

function generateSimpleReport(totalFiles, filesWithLogging, filesNeedingImprovement, averageQualityScore, totalUsage) {
  return `日志记录标准检查报告
=====================

检查时间: ${new Date().toISOString()}

总体统计
--------
- 扫描文件数: ${totalFiles}
- 有日志记录的文件: ${filesWithLogging}
- 需要改进的文件: ${filesNeedingImprovement}
- 平均质量得分: ${averageQualityScore}%

日志类型分布
----------
- console.log: ${totalUsage.consoleLog}次
- console.error: ${totalUsage.consoleError}次
- console.warn: ${totalUsage.consoleWarn}次
- logger.*: ${totalUsage.logger}次
- winston.*: ${totalUsage.winston}次

质量评级
--------
${averageQualityScore >= 90 ? 'A (优秀)' : averageQualityScore >= 80 ? 'B (良好)' : averageQualityScore >= 70 ? 'C (一般)' : 'D (需要改进)'}

改进建议
--------
1. 统一日志格式，使用 [MODULE]: 前缀
2. 将简单的 console.log 改为带模块前缀的格式
3. 在错误处理中使用 console.error
4. 考虑使用专业的日志库（如winston）
5. 添加结构化日志记录

标准格式示例
----------
// 好的格式
console.log('[AUTH]: User login successful', { userId: 123 });
console.error('[DATABASE]: Query failed', error);

// 需要改进的格式
console.log('User login');
console.log('Query failed');
`;
}

// 开始执行
console.log('🚀 开始检查日志记录标准...\n');
scanLoggingStandards(routesDir);