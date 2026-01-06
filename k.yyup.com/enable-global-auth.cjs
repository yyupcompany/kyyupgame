const fs = require('fs');
const path = require('path');

/**
 * 启用全局认证中间件
 * 将注释掉的 router.use(verifyToken) 启用
 */

const routesDir = path.join(__dirname, 'server/src/routes');

// 需要匹配的模式
const patterns = [
  // 匹配注释的全局认证（// router.use(verifyToken)）
  {
    pattern: /\/\/\s*router\.use\s*\(\s*verifyToken\s*\)/g,
    replacement: 'router.use(verifyToken)'
  },
  {
    pattern: /\/\/\s*router\.use\s*\(\s*verifyToken\s*\);\s*\/\/\s*已注释：全局认证中间件已移除，每个路由单独应用认证/g,
    replacement: 'router.use(verifyToken);'
  },
  {
    pattern: /\/\/\s*router\.use\s*\(\s*verifyToken\s*\);\s*\/\/\s*Global\s+authentication\s+middleware\s+-\s+all\s+routes\s+require\s+verification/g,
    replacement: 'router.use(verifyToken);'
  }
];

function enableGlobalAuthInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 检查是否已经有启用的全局认证
    const hasEnabledAuth = /router\.use\s*\(\s*verifyToken\s*\)(?!\s*\/\/)/.test(content);
    if (hasEnabledAuth) {
      return { fixed: false, reason: 'already_enabled' };
    }

    // 检查是否有注释的全局认证
    const hasCommentedAuth = /\/\/\s*router\.use\s*\(\s*verifyToken\s*\)/.test(content);
    if (!hasCommentedAuth) {
      return { fixed: false, reason: 'no_commented_auth' };
    }

    // 应用替换规则
    let changed = false;
    for (const { pattern, replacement } of patterns) {
      const before = content;
      content = content.replace(pattern, replacement);
      if (before !== content) {
        changed = true;
      }
    }

    // 如果内容有变化，写回文件
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { fixed: true, reason: 'enabled' };
    }

    return { fixed: false, reason: 'no_match' };
  } catch (error) {
    console.error(`❌ 错误处理文件 ${filePath}:`, error.message);
    return { fixed: false, reason: 'error', error: error.message };
  }
}

function scanAndEnableGlobalAuth(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let enabledCount = 0;
  let alreadyEnabledCount = 0;
  let noAuthCount = 0;
  let errorCount = 0;
  let scannedCount = 0;

  console.log('🔍 扫描并启用全局认证中间件...\n');

  for (const file of files) {
    if (file.endsWith('.routes.ts')) {
      const filePath = path.join(dir, file);
      scannedCount++;

      const result = enableGlobalAuthInFile(filePath);

      if (result.fixed) {
        console.log(`✅ 启用全局认证: ${file}`);
        enabledCount++;
      } else {
        switch (result.reason) {
          case 'already_enabled':
            console.log(`ℹ️  已启用全局认证: ${file}`);
            alreadyEnabledCount++;
            break;
          case 'no_commented_auth':
            console.log(`⚠️  无全局认证配置: ${file}`);
            noAuthCount++;
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
  console.log(`   - 启用认证数: ${enabledCount}`);
  console.log(`   - 已启用认证: ${alreadyEnabledCount}`);
  console.log(`   - 无认证配置: ${noAuthCount}`);
  console.log(`   - 处理错误数: ${errorCount}`);
  console.log(`   - 需要认证文件: ${enabledCount + alreadyEnabledCount}`);

  if (enabledCount > 0) {
    console.log(`\n✨ 成功启用 ${enabledCount} 个文件的全局认证中间件!`);
  } else {
    console.log(`\nℹ️  没有需要启用全局认证的文件。`);
  }
}

// 开始执行
console.log('🚀 开始启用全局认证中间件...\n');
scanAndEnableGlobalAuth(routesDir);