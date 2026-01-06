const fs = require('fs');
const path = require('path');

/**
 * 日志格式标准化修复工具
 * 自动修复 console.log 和 console.error 的格式问题
 * 添加 [MODULE]: 前缀
 */

const routesDir = path.join(__dirname, '../server/src/routes');

// 从文件名提取模块名的规则
function getModuleName(fileName) {
  const baseName = fileName.replace('.routes.ts', '');

  // 转换规则
  const moduleName = baseName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // 特殊映射
  const specialMappings = {
    'Activities': 'ACTIVITY',
    'Auth': 'AUTH',
    'User': 'USER',
    'Role': 'ROLE',
    'Permission': 'PERMISSION',
    'Class': 'CLASS',
    'Teacher': 'TEACHER',
    'Student': 'STUDENT',
    'Parent': 'PARENT',
    'Enrollment': 'ENROLLMENT',
    'Activity': 'ACTIVITY',
    'Ai': 'AI',
    'System': 'SYSTEM',
    'Dashboard': 'DASHBOARD',
    'Notification': 'NOTIFICATION',
    'Task': 'TASK',
    'Crud': 'CRUD',
    'File': 'FILE',
    'Game': 'GAME',
    'Marketing': 'MARKETING',
    'Customer': 'CUSTOMER',
    'Performance': 'PERFORMANCE',
    'Report': 'REPORT',
    'Assessment': 'ASSESSMENT',
    'Inspection': 'INSPECTION',
    'Photo': 'PHOTO',
    'Poster': 'POSTER',
    'Progress': 'PROGRESS',
    'Referral': 'REFERRAL',
    'Reminder': 'REMINDER',
    'Schedule': 'SCHEDULE',
    'Script': 'SCRIPT',
    'Security': 'SECURITY',
    'Session': 'SESSION',
    'Setup': 'SETUP',
    'Statistic': 'STATISTIC',
    'Text': 'TEXT',
    'Todo': 'TODO',
    'Token': 'TOKEN',
    'Training': 'TRAINING',
    'Unified': 'UNIFIED',
    'Usage': 'USAGE',
    'Video': 'VIDEO',
    'Voice': 'VOICE'
  };

  return specialMappings[moduleName] || moduleName.toUpperCase();
}

// 修复单个文件的日志格式
function fixFileLogging(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const moduleName = getModuleName(fileName);

    let modified = false;
    let fixCount = 0;
    const fixes = [];

    // 需要跳过的行模式
    const skipPatterns = [
      /\/\//,  // 注释行
      /\/\*/,  // 多行注释开始
      /\*\/,   // 多行注释结束
      /^\s*\*/,  // 多行注释中间行
      /console\.(log|error|warn)\s*\(\s*['\"`]\[.*?\]:/, // 已经有模块前缀的
      /console\.(log|error|warn)\s*\(\s*['\"`]\w+\s*:/, // 已经有其他前缀的
      /logger\./, // 使用专业日志库的
      /winston\./ // 使用winston的
    ];

    const newLines = lines.map((line, index) => {
      // 检查是否需要跳过
      if (skipPatterns.some(pattern => pattern.test(line))) {
        return line;
      }

      // 查找 console.log, console.error, console.warn 调用
      const consoleMatch = line.match(/console\.(log|error|warn)\s*\(([^)]*)\)/);
      if (consoleMatch) {
        const [fullMatch, logType, args] = consoleMatch;

        // 检查是否已经有模块前缀
        if (args.includes('[') && args.includes(']:')) {
          return line;
        }

        // 提取第一个参数（通常是消息）
        const argsTrimmed = args.trim();
        let newArgs = argsTrimmed;

        // 如果第一个参数是字符串，添加模块前缀
        const firstQuoteMatch = argsTrimmed.match(/^(['\"`])(.*?)\1/);
        if (firstQuoteMatch) {
          const [quoteMatch, quote, message] = firstQuoteMatch;
          const restOfArgs = argsTrimmed.substring(quoteMatch.length).trim();

          // 检查消息是否已经包含前缀
          if (!message.includes('[') && !message.includes(']:')) {
            const newMessage = `[${moduleName}]: ${message}`;
            newArgs = `${quote}${newMessage}${quote}`;
            if (restOfArgs) {
              newArgs += ', ' + restOfArgs;
            }

            modified = true;
            fixCount++;

            return line.replace(fullMatch, `console.${logType}(${newArgs})`);
          }
        } else {
          // 如果第一个参数不是字符串，在开头添加模块前缀
          newArgs = `'${moduleName}:', ${argsTrimmed}`;
          modified = true;
          fixCount++;

          return line.replace(fullMatch, `console.${logType}(${newArgs})`);
        }
      }

      return line;
    });

    if (modified) {
      const newContent = newLines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${fileName} - 修复完成 (${fixCount}处日志格式化)`);
      return { fixed: true, fixCount };
    } else {
      console.log(`ℹ️  ${fileName} - 日志格式已符合标准`);
      return { fixed: false, fixCount: 0 };
    }
  } catch (error) {
    console.error(`❌ ${fileName} - 修复失败: ${error.message}`);
    return { fixed: false, error: error.message };
  }
}

// 批量修复所有文件
function batchFixLogging() {
  console.log('🚀 开始批量修复日志格式问题\n');

  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.routes.ts'));

  let fixedCount = 0;
  let totalFixes = 0;
  let errorCount = 0;

  console.log(`📁 找到 ${files.length} 个路由文件\n`);

  // 获取需要修复的文件列表（从检查报告中提取）
  const problemFiles = [
    'SequelizeMeta.routes.ts',
    'activity-checkin.routes.ts',
    'activity-evaluation.routes.ts',
    'activity-evaluations.routes.ts',
    'activity-plans.routes.ts',
    'activity-registration.routes.ts',
    'activity-registrations.routes.ts',
    'admin.routes.ts',
    'admission-notifications.routes.ts',
    'admission-results.routes.ts',
    'advertisements.routes.ts',
    'ai-analysis.routes.ts',
    'ai-billing.routes.ts',
    'ai-curriculum.routes.ts',
    'ai-knowledge.routes.ts',
    'ai-mock.routes.ts',
    'api-list.routes.ts',
    'assessment-analytics.routes.ts',
    'avatar-upload.routes.ts',
    'base.routes.ts',
    'change-log.routes.ts',
    'channel-trackings.routes.ts',
    'channels.routes.ts',
    'classes.routes.ts',
    'conversion-tracking.routes.ts',
    'conversion-trackings.routes.ts',
    'coupons.routes.ts',
    'crud.routes.ts',
    'customer-pool.routes.ts',
    'customers.routes.ts',
    'dashboard.routes.ts',
    'debug-env.routes.ts',
    'debug-oss.routes.ts',
    'enrollment-applications.routes.ts',
    'enrollment-consultations.routes.ts',
    'enrollment-interviews.routes.ts',
    'enrollment-plans.routes.ts',
    'enrollment-quotas.routes.ts',
    'enrollment.routes.ts',
    'followup.routes.ts',
    'game-background.routes.ts',
    'interactive-curriculum.routes.ts',
    'kindergartens.routes.ts',
    'like-collect-config.routes.ts',
    'like-collect-records.routes.ts',
    'marketing-campaign.routes.ts',
    'marketing-campaigns.routes.ts',
    'parent-student-relations.routes.ts',
    'parents.routes.ts',
    'performance-rules.routes.ts',
    'permission.routes.ts',
    'permissions-backup.routes.ts',
    'personal-posters.routes.ts',
    'poster-generations.routes.ts',
    'poster-templates.routes.ts',
    'principal.routes.ts',
    'progress.routes.ts',
    'referral-codes.routes.ts',
    'referral-relationships.routes.ts',
    'referral-rewards.routes.ts',
    'referral-statistics.routes.ts',
    'role-permission.routes.ts',
    'role-permissions.routes.ts',
    'role.routes.ts',
    'roles-backup.routes.ts',
    'roles.routes.ts',
    'sequelize-meta.routes.ts',
    'student.routes.ts',
    'students.routes.ts',
    'system-ai-models.routes.ts',
    'system-backup.routes.ts',
    'system.routes.ts',
    'task-attachments.routes.ts',
    'task-comment.routes.ts',
    'task.routes.ts',
    'tasks.routes.ts',
    'teacher-assessment.routes.ts',
    'teachers.routes.ts',
    'temp-create-users.routes.ts',
    'tenant-token.routes.ts',
    'token-blacklist.routes.ts',
    'unified-statistics.routes.ts',
    'upload.routes.ts',
    'usage-center.routes.ts',
    'user-profile.routes.ts',
    'user-role.routes.ts',
    'user-roles.routes.ts',
    'users.routes.ts'
  ];

  // 只修复有问题的文件
  for (const file of problemFiles) {
    if (files.includes(file)) {
      const filePath = path.join(routesDir, file);
      const result = fixFileLogging(filePath, file);

      if (result.fixed) {
        fixedCount++;
        totalFixes += result.fixCount;
      } else if (result.error) {
        errorCount++;
      }
    }
  }

  // 统计结果
  console.log('\n📊 修复统计:');
  console.log(`   - 问题文件数: ${problemFiles.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 总修复数: ${totalFixes}`);
  console.log(`   - 错误文件数: ${errorCount}`);
  console.log(`   - 修复率: ${Math.round(fixedCount / problemFiles.length * 100)}%`);

  if (fixedCount > 0) {
    console.log('\n🎉 日志格式修复完成！');
    console.log('\n💡 建议:');
    console.log('   1. 运行自动化检查工具验证修复结果');
    console.log('   2. 检查修复后的文件是否正常工作');
    console.log('   3. 运行测试确保功能正常');
  } else {
    console.log('\nℹ️  所有文件的日志格式都已符合标准');
  }
}

// 验证修复结果
function verifyFixes() {
  console.log('\n🔍 验证日志格式修复结果...\n');

  const { spawn } = require('child_process');
  const checkerPath = path.join(__dirname, 'auth-standards-checker.cjs');

  return new Promise((resolve, reject) => {
    const process = spawn('node', [checkerPath], {
      cwd: path.dirname(__dirname),
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(output);
        resolve(output);
      } else {
        reject(new Error(`检查工具执行失败，退出码: ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

// 主函数
async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.includes('--verify-only')) {
      console.log('🔍 仅运行验证模式\n');
      const output = await verifyFixes();

      // 提取通过率
      const passRateMatch = output.match(/通过率: (\d+)%/);
      if (passRateMatch) {
        const passRate = parseInt(passRateMatch[1]);
        console.log(`\n📈 当前通过率: ${passRate}%`);

        if (passRate >= 95) {
          console.log('🎉 优秀！通过率达到95%以上');
        } else if (passRate >= 90) {
          console.log('👍 良好！通过率超过90%');
        } else if (passRate >= 80) {
          console.log('⚠️  一般，建议继续优化');
        } else {
          console.log('❌ 需要进一步改进');
        }
      }
      return;
    }

    // 默认运行修复
    batchFixLogging();

    // 询问是否验证
    console.log('\n❓ 是否运行验证检查？(y/n)');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
      if (key.toString().toLowerCase() === 'y') {
        console.log('\n');
        try {
          await verifyFixes();
        } catch (error) {
          console.error('\n❌ 验证失败:', error.message);
        }
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ 执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  batchFixLogging,
  verifyFixes
};