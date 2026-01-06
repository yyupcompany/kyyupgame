const fs = require('fs');
const path = require('path');

/**
 * 批量修复认证标准问题
 * 自动修复检查工具发现的问题
 */

const routesDir = path.join(__dirname, '../server/src/routes');

// 修复规则
const fixRules = [
  {
    name: '修复导入路径',
    pattern: /import\s*\{\s*[^}]*middleware\/auth-middleware[^}]*\}/g,
    replacement: (match) => {
      return match.replace('middleware/auth-middleware', 'middlewares/auth.middleware');
    },
    files: []
  },
  {
    name: '修复中间件命名',
    patterns: [
      {
        pattern: /\bauthMiddleware\b/g,
        replacement: 'verifyToken'
      },
      {
        pattern: /\bauthenticate(?!\w)/g,
        replacement: 'verifyToken'
      }
    ],
    files: []
  },
  {
    name: '启用全局认证',
    pattern: /\/\/\s*router\.use\s*\(\s*verifyToken\s*\);?/g,
    replacement: 'router.use(verifyToken);',
    files: []
  },
  {
    name: '修复权限代码',
    replacements: {
      'PARENT_MANAGE': 'parent:student:manage',
      'TEACHER_MANAGE': 'teacher:manage',
      'STUDENT_MANAGE': 'student:manage',
      'USER_MANAGE': 'user:manage',
      'SYSTEM_MANAGE': 'system:manage',
      'CLASS_MANAGE': 'class:manage',
      'ACTIVITY_MANAGE': 'activity:manage',
      'FINANCE_MANAGE': 'finance:manage'
    },
    files: []
  }
];

function fixFile(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;
    const fixes = [];

    // 1. 修复导入路径
    const originalContent = content;
    const fixedImport = fixRules[0].pattern.test(content);
    if (fixedImport) {
      content = content.replace(fixRules[0].pattern, fixRules[0].replacement);
      modified = true;
      fixCount++;
      fixes.push('导入路径');
    }

    // 2. 修复中间件命名
    for (const rule of fixRules[1].patterns) {
      if (rule.pattern.test(content)) {
        const before = content;
        content = content.replace(rule.pattern, rule.replacement);
        if (before !== content) {
          modified = true;
          fixes.push('中间件命名');
        }
      }
    }

    // 3. 启用全局认证
    if (fixRules[2].pattern.test(content)) {
      const before = content;
      content = content.replace(fixRules[2].pattern, fixRules[2].replacement);
      if (before !== content) {
        modified = true;
        fixes.push('全局认证');
      }
    }

    // 4. 修复权限代码
    let hasPermissionFixes = false;
    for (const [oldCode, newCode] of Object.entries(fixRules[3].replacements)) {
      if (content.includes(oldCode)) {
        const before = content;
        const regex = new RegExp(`checkPermission\\\\s*\\\\(\\\\s*['"]${oldCode}['"]`, 'g');
        content = content.replace(regex, `checkPermission('${newCode}')`);
        if (before !== content) {
          modified = true;
          hasPermissionFixes = true;
        }
      }
    }
    if (hasPermissionFixes) {
      fixes.push('权限代码');
    }

    // 写回文件
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${fileName} - 修复完成 (${fixes.join(', ')})`);
      return { fixed: true, fixes };
    } else {
      console.log(`ℹ️  ${fileName} - 无需修复`);
      return { fixed: false, fixes: [] };
    }
  } catch (error) {
    console.error(`❌ ${fileName} - 修复失败: ${error.message}`);
    return { fixed: false, error: error.message };
  }
}

function batchFix() {
  console.log('🚀 开始批量修复认证标准问题\n');

  // 获取所有路由文件
  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.routes.ts'));

  let fixedCount = 0;
  let totalFixes = 0;
  let errorCount = 0;

  console.log(`📁 找到 ${files.length} 个路由文件\n`);

  // 修复每个文件
  for (const file of files) {
    const filePath = path.join(routesDir, file);
    const result = fixFile(filePath, file);

    if (result.fixed) {
      fixedCount++;
      totalFixes += result.fixes.length;
    } else if (result.error) {
      errorCount++;
    }
  }

  // 统计结果
  console.log('\n📊 修复统计:');
  console.log(`   - 总文件数: ${files.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 总修复数: ${totalFixes}`);
  console.log(`   - 错误文件数: ${errorCount}`);
  console.log(`   - 修复率: ${Math.round(fixedCount / files.length * 100)}%`);

  if (fixedCount > 0) {
    console.log('\n🎉 批量修复完成！');
    console.log('\n💡 建议:');
    console.log('   1. 运行自动化检查工具验证修复结果');
    console.log('   2. 检查修复后的文件是否正常工作');
    console.log('   3. 提交代码变更前进行充分测试');
  } else {
    console.log('\nℹ️  所有文件都符合标准，无需修复');
  }
}

// 检查修复结果
function verifyFixes() {
  console.log('\n🔍 验证修复结果...\n');

  // 运行检查工具
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
      return;
    }

    // 默认运行修复
    batchFix();

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
  batchFix,
  verifyFixes
};