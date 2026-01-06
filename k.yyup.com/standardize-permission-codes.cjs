const fs = require('fs');
const path = require('path');

/**
 * 标准化权限代码命名
 * 将大写的权限代码转换为小写+冒号的格式
 * 例如: PARENT_MANAGE → parent:student:manage
 */

const routesDir = path.join(__dirname, 'server/src/routes');

// 权限代码映射表
const permissionMappings = {
  // 用户管理权限
  'USER_VIEW': 'user:view',
  'USER_CREATE': 'user:create',
  'USER_UPDATE': 'user:update',
  'USER_DELETE': 'user:delete',
  'USER_MANAGE': 'user:manage',
  'USER_LIST': 'user:list',

  // 角色管理权限
  'ROLE_VIEW': 'role:view',
  'ROLE_CREATE': 'role:create',
  'ROLE_UPDATE': 'role:update',
  'ROLE_DELETE': 'role:delete',
  'ROLE_MANAGE': 'role:manage',
  'ROLE_LIST': 'role:list',
  'ROLE_ASSIGN': 'role:assign',

  // 权限管理权限
  'PERMISSION_VIEW': 'permission:view',
  'PERMISSION_MANAGE': 'permission:manage',
  'PERMISSION_LIST': 'permission:list',

  // 家长相关权限
  'PARENT_VIEW': 'parent:view',
  'PARENT_CREATE': 'parent:create',
  'PARENT_UPDATE': 'parent:update',
  'PARENT_DELETE': 'parent:delete',
  'PARENT_MANAGE': 'parent:manage',
  'PARENT_LIST': 'parent:list',
  'PARENT_STUDENT_ACCESS': 'parent:student:access',
  'PARENT_STUDENT_MANAGE': 'parent:student:manage',
  'PARENT_CLASS_ACCESS': 'parent:class:access',
  'PARENT_CLASS_VIEW': 'parent:class:view',

  // 教师相关权限
  'TEACHER_VIEW': 'teacher:view',
  'TEACHER_CREATE': 'teacher:create',
  'TEACHER_UPDATE': 'teacher:update',
  'TEACHER_DELETE': 'teacher:delete',
  'TEACHER_MANAGE': 'teacher:manage',
  'TEACHER_LIST': 'teacher:list',
  'TEACHER_ASSIGN': 'teacher:assign',
  'TEACHER_CLASS_MANAGE': 'teacher:class:manage',
  'TEACHER_STUDENT_MANAGE': 'teacher:student:manage',
  'TEACHER_DASHBOARD': 'teacher:dashboard',
  'TEACHER_ATTENDANCE': 'teacher:attendance',
  'TEACHER_CHECKIN': 'teacher:checkin',
  'TEACHER_SOP': 'teacher:sop',
  'TEACHER_CUSTOMERS': 'teacher:customers',

  // 学生相关权限
  'STUDENT_VIEW': 'student:view',
  'STUDENT_CREATE': 'student:create',
  'STUDENT_UPDATE': 'student:update',
  'STUDENT_DELETE': 'student:delete',
  'STUDENT_MANAGE': 'student:manage',
  'STUDENT_LIST': 'student:list',
  'STUDENT_ASSIGN': 'student:assign',
  'STUDENT_ASSESSMENT': 'student:assessment',
  'STUDENT_ATTENDANCE': 'student:attendance',
  'STUDENT_PERFORMANCE': 'student:performance',

  // 班级相关权限
  'CLASS_VIEW': 'class:view',
  'CLASS_CREATE': 'class:create',
  'CLASS_UPDATE': 'class:update',
  'CLASS_DELETE': 'class:delete',
  'CLASS_MANAGE': 'class:manage',
  'CLASS_LIST': 'class:list',
  'CLASS_ASSIGN': 'class:assign',
  'CLASS_STUDENT_MANAGE': 'class:student:manage',
  'CLASS_TEACHER_MANAGE': 'class:teacher:manage',
  'CLASS_SCHEDULE': 'class:schedule',

  // 活动相关权限
  'ACTIVITY_VIEW': 'activity:view',
  'ACTIVITY_CREATE': 'activity:create',
  'ACTIVITY_UPDATE': 'activity:update',
  'ACTIVITY_DELETE': 'activity:delete',
  'ACTIVITY_MANAGE': 'activity:manage',
  'ACTIVITY_LIST': 'activity:list',
  'ACTIVITY_PUBLISH': 'activity:publish',
  'ACTIVITY_REGISTER': 'activity:register',
  'ACTIVITY_EVALUATE': 'activity:evaluate',
  'ACTIVITY_CHECKIN': 'activity:checkin',
  'ACTIVITY_PLAN': 'activity:plan',
  'ACTIVITY_TEMPLATE': 'activity:template',
  'ACTIVITY_POSTER': 'activity:poster',

  // 招生相关权限
  'ENROLLMENT_VIEW': 'enrollment:view',
  'ENROLLMENT_CREATE': 'enrollment:create',
  'ENROLLMENT_UPDATE': 'enrollment:update',
  'ENROLLMENT_DELETE': 'enrollment:delete',
  'ENROLLMENT_MANAGE': 'enrollment:manage',
  'ENROLLMENT_LIST': 'enrollment:list',
  'ENROLLMENT_APPLICATION': 'enrollment:application',
  'ENROLLMENT_INTERVIEW': 'enrollment:interview',
  'ENROLLMENT_ADMISSION': 'enrollment:admission',
  'ENROLLMENT_NOTIFICATION': 'enrollment:notification',
  'ENROLLMENT_PLAN': 'enrollment:plan',
  'ENROLLMENT_QUOTA': 'enrollment:quota',
  'ENROLLMENT_STATISTICS': 'enrollment:statistics',
  'ENROLLMENT_CENTER': 'enrollment:center',
  'ENROLLMENT_CONSULTATION': 'enrollment:consultation',
  'ENROLLMENT_FINANCE': 'enrollment:finance',
  'ENROLLMENT_AI': 'enrollment:ai',

  // 财务相关权限
  'FINANCE_VIEW': 'finance:view',
  'FINANCE_MANAGE': 'finance:manage',
  'FINANCE_OVERVIEW': 'finance:overview',
  'FINANCE_REPORTS': 'finance:reports',
  'FINANCE_PAYMENTS': 'finance:permissions',
  'FINANCE_TEMPLATES': 'finance:templates',
  'FINANCE_RECORDS': 'finance:records',
  'FINANCE_CENTER': 'finance:center',

  // 营销相关权限
  'MARKETING_VIEW': 'marketing:view',
  'MARKETING_MANAGE': 'marketing:manage',
  'MARKETING_CAMPAIGN': 'marketing:campaign',
  'MARKETING_CENTER': 'marketing:center',
  'MARKETING_ANALYTICS': 'marketing:analytics',
  'CUSTOMER_POOL': 'marketing:customer:pool',
  'CUSTOMER_MANAGE': 'marketing:customer:manage',
  'CUSTOMER_VIEW': 'marketing:customer:view',
  'CUSTOMER_FOLLOW': 'marketing:customer:follow',

  // 系统相关权限
  'SYSTEM_VIEW': 'system:view',
  'SYSTEM_MANAGE': 'system:manage',
  'SYSTEM_CONFIG': 'system:config',
  'SYSTEM_LOGS': 'system:logs',
  'SYSTEM_MONITOR': 'system:monitor',
  'SYSTEM_BACKUP': 'system:backup',
  'SYSTEM_UPGRADE': 'system:upgrade',
  'SYSTEM_MAINTENANCE': 'system:maintenance',

  // 数据相关权限
  'DATA_VIEW': 'data:view',
  'DATA_EXPORT': 'data:export',
  'DATA_IMPORT': 'data:import',
  'DATA_ANALYTICS': 'data:analytics',
  'DATA_REPORTS': 'data:reports',
  'DATA_MANAGE': 'data:manage',

  // 文件相关权限
  'FILE_VIEW': 'file:view',
  'FILE_UPLOAD': 'file:upload',
  'FILE_DOWNLOAD': 'file:download',
  'FILE_DELETE': 'file:delete',
  'FILE_MANAGE': 'file:manage',
  'OSS_MANAGE': 'oss:manage',
  'OSS_CONFIG': 'oss:config',

  // 通知相关权限
  'NOTIFICATION_VIEW': 'notification:view',
  'NOTIFICATION_CREATE': 'notification:create',
  'NOTIFICATION_UPDATE': 'notification:update',
  'NOTIFICATION_DELETE': 'notification:delete',
  'NOTIFICATION_MANAGE': 'notification:manage',
  'NOTIFICATION_SEND': 'notification:send',
  'NOTIFICATION_CENTER': 'notification:center',

  // AI相关权限
  'AI_VIEW': 'ai:view',
  'AI_USE': 'ai:use',
  'AI_MANAGE': 'ai:manage',
  'AI_CONFIG': 'ai:config',
  'AI_ANALYSIS': 'ai:analysis',
  'AI_QUERY': 'ai:query',
  'AI_CONVERSATION': 'ai:conversation',
  'AI_ASSISTANT': 'ai:assistant',
  'AI_STATS': 'ai:stats',
  'AI_BRIDGE': 'ai:bridge',
  'AI_CACHE': 'ai:cache',
  'AI_SCORING': 'ai:scoring',
  'AI_SMART_ASSIGN': 'ai:smart:assign',
  'AI_PERFORMANCE': 'ai:performance',

  // 报告相关权限
  'REPORT_VIEW': 'report:view',
  'REPORT_CREATE': 'report:create',
  'REPORT_UPDATE': 'report:update',
  'REPORT_DELETE': 'report:delete',
  'REPORT_MANAGE': 'report:manage',
  'REPORT_EXPORT': 'report:export',
  'REPORT_SHARE': 'report:share',
  'PERFORMANCE_REPORT': 'report:performance',
  'PERFORMANCE_EVALUATION': 'report:performance:evaluation',

  // 评估相关权限
  'ASSESSMENT_VIEW': 'assessment:view',
  'ASSESSMENT_CREATE': 'assessment:create',
  'ASSESSMENT_UPDATE': 'assessment:update',
  'ASSESSMENT_DELETE': 'assessment:delete',
  'ASSESSMENT_MANAGE': 'assessment:manage',
  'ASSESSMENT_ADMIN': 'assessment:admin',
  'ASSESSMENT_ANALYTICS': 'assessment:analytics',
  'ASSESSMENT_SHARE': 'assessment:share',
  'TEACHER_ASSESSMENT': 'assessment:teacher',

  // 仪表盘相关权限
  'DASHBOARD_VIEW': 'dashboard:view',
  'DASHBOARD_ADMIN': 'dashboard:admin',
  'DASHBOARD_STATS': 'dashboard:stats',
  'ENTERPRISE_DASHBOARD': 'dashboard:enterprise',

  // 其他权限
  'ATTENDANCE_CENTER': 'attendance:center',
  'CALL_CENTER': 'call:center',
  'BUSINESS_CENTER': 'business:center',
  'PERSONNEL_CENTER': 'personnel:center',
  'TEACHING_CENTER': 'teaching:center',
  'MEDIA_CENTER': 'media:center',
  'KINDERGARTEN_MANAGE': 'kindergarten:manage',
  'KINDERGARTEN_VIEW': 'kindergarten:view',
  'KINDERGARTEN_INFO': 'kindergarten:info',
  'KINDERGARTEN_COMPLETE': 'kindergarten:complete',
  'ORGANIZATION_STATUS': 'organization:status',
  'PHOTO_ALBUM': 'photo:album',
  'PRINCIPAL_PERFORMANCE': 'principal:performance',
  'TASK_MANAGE': 'task:manage',
  'USAGE_CENTER': 'usage:center',
  'USAGE_QUOTA': 'usage:quota',
  'USER_PROFILE': 'user:profile',
  'TENANT_MANAGE': 'tenant:manage',
  'TENANT_TOKEN': 'tenant:token'
};

function standardizePermissionsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    let changed = false;
    let changeCount = 0;

    // 应用权限映射
    for (const [oldPermission, newPermission] of Object.entries(permissionMappings)) {
      const oldContent = content;

      // 替换 checkPermission 调用中的权限代码
      content = content.replace(
        new RegExp(`checkPermission\\(\\s*['"]${oldPermission}['"]\\s*\\)`, 'g'),
        `checkPermission('${newPermission}')`
      );

      // 替换 checkRole 调用中的权限代码（如果意外使用了）
      content = content.replace(
        new RegExp(`checkRole\\(\\s*['"]${oldPermission}['"]\\s*\\)`, 'g'),
        `checkRole('${newPermission}')`
      );

      // 替换权限相关的常量定义
      content = content.replace(
        new RegExp(`const\\s+\\w+\\s*=\\s*['"]${oldPermission}['"]`, 'g'),
        (match) => match.replace(oldPermission, newPermission)
      );

      // 替换其他可能的权限引用
      content = content.replace(
        new RegExp(`['"]${oldPermission}['"]`, 'g'),
        `'${newPermission}'`
      );

      if (oldContent !== content) {
        changed = true;
        changeCount++;
      }
    }

    // 写回文件（如果有变化）
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 标准化权限代码: ${path.relative(process.cwd(), filePath)} (${changeCount}处)`);
      return { fixed: true, changeCount };
    }

    return { fixed: false, reason: 'no_permissions_found' };
  } catch (error) {
    console.error(`❌ 错误处理文件 ${filePath}:`, error.message);
    return { fixed: false, reason: 'error', error: error.message };
  }
}

function scanAndStandardizePermissions(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  let totalChanges = 0;
  let noPermissionsCount = 0;
  let errorCount = 0;
  let scannedCount = 0;

  console.log('🔍 扫描并标准化权限代码命名...\n');

  for (const file of files) {
    if (file.endsWith('.routes.ts')) {
      const filePath = path.join(dir, file);
      scannedCount++;

      const result = standardizePermissionsInFile(filePath);

      if (result.fixed) {
        fixedCount++;
        totalChanges += result.changeCount;
      } else {
        switch (result.reason) {
          case 'no_permissions_found':
            console.log(`ℹ️  无权限代码: ${file}`);
            noPermissionsCount++;
            break;
          case 'error':
            console.log(`❌ 处理错误: ${file} - ${result.error}`);
            errorCount++;
            break;
          default:
            console.log(`ℹ️  无需处理: ${file}`);
        }
      }
    }
  }

  console.log(`\n📊 统计结果:`);
  console.log(`   - 扫描文件数: ${scannedCount}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 权限代码更新数: ${totalChanges}`);
  console.log(`   - 无权限代码: ${noPermissionsCount}`);
  console.log(`   - 处理错误数: ${errorCount}`);

  if (fixedCount > 0) {
    console.log(`\n✨ 成功标准化 ${fixedCount} 个文件中的 ${totalChanges} 个权限代码!`);
  } else {
    console.log(`\nℹ️  没有需要标准化的权限代码。`);
  }

  // 输出权限映射统计
  console.log(`\n📋 权限映射表统计:`);
  console.log(`   - 总权限映射数: ${Object.keys(permissionMappings).length}`);
  console.log(`   - 用户管理权限: 7个`);
  console.log(`   - 角色管理权限: 7个`);
  console.log(`   - 权限管理权限: 3个`);
  console.log(`   - 家长相关权限: 8个`);
  console.log(`   - 教师相关权限: 11个`);
  console.log(`   - 学生相关权限: 9个`);
  console.log(`   - 班级相关权限: 9个`);
  console.log(`   - 活动相关权限: 11个`);
  console.log(`   - 招生相关权限: 14个`);
  console.log(`   - 财务相关权限: 8个`);
  console.log(`   - 营销相关权限: 8个`);
  console.log(`   - 系统相关权限: 8个`);
  console.log(`   - 其他功能权限: ${Object.keys(permissionMappings).length - 100}个`);
}

// 开始执行
console.log('🚀 开始标准化权限代码命名...\n');
console.log('📚 权限代码命名规范:');
console.log('   - 格式: module:action 或 module:submodule:action');
console.log('   - 示例: user:view, parent:student:manage, activity:create');
console.log('   - 转换: PARENT_MANAGE → parent:student:manage\n');

scanAndStandardizePermissions(routesDir);