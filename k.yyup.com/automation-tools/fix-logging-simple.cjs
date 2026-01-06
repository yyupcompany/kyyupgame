const fs = require('fs');
const path = require('path');

/**
 * 简化的日志格式修复工具
 */

const routesDir = path.join(__dirname, '../server/src/routes');

// 从文件名提取模块名
function getModuleName(fileName) {
  const baseName = fileName.replace('.routes.ts', '');

  // 特殊映射
  const mappings = {
    'activities': 'ACTIVITY',
    'auth': 'AUTH',
    'user': 'USER',
    'users': 'USER',
    'role': 'ROLE',
    'roles': 'ROLE',
    'permission': 'PERMISSION',
    'permissions': 'PERMISSION',
    'class': 'CLASS',
    'classes': 'CLASS',
    'teacher': 'TEACHER',
    'teachers': 'TEACHER',
    'student': 'STUDENT',
    'students': 'STUDENT',
    'parent': 'PARENT',
    'parents': 'PARENT',
    'enrollment': 'ENROLLMENT',
    'activity': 'ACTIVITY',
    'ai': 'AI',
    'system': 'SYSTEM',
    'dashboard': 'DASHBOARD',
    'notification': 'NOTIFICATION',
    'notifications': 'NOTIFICATION',
    'task': 'TASK',
    'tasks': 'TASK',
    'crud': 'CRUD',
    'file': 'FILE',
    'files': 'FILE',
    'game': 'GAME',
    'marketing': 'MARKETING',
    'customer': 'CUSTOMER',
    'customers': 'CUSTOMER',
    'performance': 'PERFORMANCE',
    'report': 'REPORT',
    'reports': 'REPORT',
    'assessment': 'ASSESSMENT',
    'assessments': 'ASSESSMENT',
    'inspection': 'INSPECTION',
    'photo': 'PHOTO',
    'poster': 'POSTER',
    'progress': 'PROGRESS',
    'referral': 'REFERRAL',
    'reminder': 'REMINDER',
    'schedule': 'SCHEDULE',
    'script': 'SCRIPT',
    'security': 'SECURITY',
    'session': 'SESSION',
    'setup': 'SETUP',
    'statistic': 'STATISTIC',
    'statistics': 'STATISTIC',
    'text': 'TEXT',
    'todo': 'TODO',
    'token': 'TOKEN',
    'training': 'TRAINING',
    'unified': 'UNIFIED',
    'usage': 'USAGE',
    'video': 'VIDEO',
    'voice': 'VOICE'
  };

  for (const [key, value] of Object.entries(mappings)) {
    if (baseName.toLowerCase().includes(key)) {
      return value;
    }
  }

  return baseName.toUpperCase().replace(/[-_]/g, '');
}

// 修复单个文件
function fixFileLogging(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const moduleName = getModuleName(fileName);

    let modified = false;
    let fixCount = 0;

    const newLines = lines.map((line, index) => {
      // 跳过注释行
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return line;
      }

      // 查找 console 调用
      const consoleMatch = line.match(/console\.(log|error|warn)\s*\(([^)]*)\)/);
      if (consoleMatch) {
        const [fullMatch, logType, args] = consoleMatch;

        // 如果已经有模块前缀，跳过
        if (args.includes('[') && args.includes(']:')) {
          return line;
        }

        // 如果使用了 logger 或 winston，跳过
        if (line.includes('logger.') || line.includes('winston.')) {
          return line;
        }

        const argsTrimmed = args.trim();
        let newArgs = argsTrimmed;

        // 检查第一个参数是否是字符串
        const firstQuoteMatch = argsTrimmed.match(/^(['"`])(.*?)\1/);
        if (firstQuoteMatch) {
          const quote = firstQuoteMatch[1];
          let message = firstQuoteMatch[2];
          const restOfArgs = argsTrimmed.substring(firstQuoteMatch[0].length).trim();

          // 检查消息是否已经包含前缀
          if (!message.includes('[') && !message.includes(']:')) {
            message = `[${moduleName}]: ${message}`;
            newArgs = `${quote}${message}${quote}`;
            if (restOfArgs) {
              newArgs += ', ' + restOfArgs;
            }

            modified = true;
            fixCount++;
            return line.replace(fullMatch, `console.${logType}(${newArgs})`);
          }
        } else {
          // 如果第一个参数不是字符串，添加模块前缀
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
      console.log(`✅ ${fileName} - 修复完成 (${fixCount}处)`);
      return { fixed: true, fixCount };
    } else {
      console.log(`ℹ️  ${fileName} - 无需修复`);
      return { fixed: false, fixCount: 0 };
    }
  } catch (error) {
    console.error(`❌ ${fileName} - 修复失败: ${error.message}`);
    return { fixed: false, error: error.message };
  }
}

// 批量修复
function batchFix() {
  console.log('🚀 开始修复日志格式问题\n');

  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.routes.ts'));

  // 需要修复的文件列表（基于之前的检查报告）
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

  let fixedCount = 0;
  let totalFixes = 0;
  let errorCount = 0;

  console.log(`📁 需要修复的文件: ${problemFiles.length}个\n`);

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

  return { fixedCount, totalFixes, errorCount };
}

// 运行修复
console.log('🚀 开始修复日志格式问题\n');
const result = batchFix();

// 自动运行验证检查
console.log('\n🔍 运行验证检查...\n');

const { spawn } = require('child_process');
const checkerPath = path.join(__dirname, 'auth-standards-checker.cjs');

const verifyProcess = spawn('node', [checkerPath], {
  cwd: path.dirname(__dirname),
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
verifyProcess.stdout.on('data', (data) => {
  output += data.toString();
});

verifyProcess.on('close', (code) => {
  // 提取通过率
  const passRateMatch = output.match(/通过率: (\d+)%/);
  if (passRateMatch) {
    const passRate = parseInt(passRateMatch[1]);
    console.log(`\n📈 最终通过率: ${passRate}%`);

    if (passRate >= 95) {
      console.log('🎉 优秀！认证标准化通过率达到95%以上');
    } else if (passRate >= 90) {
      console.log('👍 良好！认证标准化通过率超过90%');
    } else if (passRate >= 80) {
      console.log('⚠️  一般，建议继续优化');
    } else {
      console.log('❌ 需要进一步改进');
    }
  }
});

verifyProcess.on('error', (error) => {
  console.error('\n❌ 验证失败:', error.message);
});

module.exports = {
  batchFix
};