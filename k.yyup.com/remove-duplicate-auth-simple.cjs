const fs = require('fs');
const path = require('path');

/**
 * 移除重复的verifyToken调用 - 简化版本
 */

const routesDir = path.join(__dirname, 'server/src/routes');

function removeDuplicateAuthInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 检查是否启用了全局认证
    const hasGlobalAuth = /router\.use\s*\(\s*verifyToken\s*\)(?!\s*\/\/)/.test(content);
    if (!hasGlobalAuth) {
      return { fixed: false, reason: 'no_global_auth' };
    }

    let changed = false;
    let removalCount = 0;

    // 简单的替换模式
    const patterns = [
      // 移除路由中的verifyToken（保留权限检查）
      {
        regex: /,\s*verifyToken\s*,\s*(checkPermission|checkRole)/g,
        replacement: ', $1',
        description: '保留权限检查，移除verifyToken'
      },
      // 移除简单的verifyToken（逗号后）
      {
        regex: /,\s*verifyToken\s*,/g,
        replacement: ',',
        description: '移除逗号后的verifyToken'
      },
      // 移除开头的verifyToken（后面是控制器）
      {
        regex: /router\.(get|post|put|delete|patch)\s*\(\s*['"][^'"]*['"]\s*,\s*verifyToken\s*,\s*([a-zA-Z][a-zA-Z0-9_.]*)\s*\)/g,
        replacement: (match, method, controller) => {
          const pathMatch = match.match(/'[^']*'|"[^"]*"/)[0];
          return `router.${method}(${pathMatch}, ${controller})`;
        },
        description: '移除路由中唯一的verifyToken'
      },
      // 移除开头的verifyToken（没有逗号）
      {
        regex: /router\.(get|post|put|delete|patch)\s*\(\s*['"][^'"]*['"]\s*,\s*verifyToken\s*\)/g,
        replacement: (match, method) => {
          const pathMatch = match.match(/'[^']*'|"[^"]*"/)[0];
          return `router.${method}(${pathMatch}`;
        },
        description: '移除路由结尾的verifyToken'
      }
    ];

    for (const pattern of patterns) {
      const before = content;
      content = content.replace(pattern.regex, pattern.replacement);
      if (before !== content) {
        changed = true;
        console.log(`  - ${pattern.description}`);
      }
    }

    // 修复可能的语法错误（缺少的括号）
    content = content.replace(/router\.(get|post|put|delete|patch)\s*\(\s*['"][^'"]*['"]\s*$/, '$&);');
    content = content.replace(/router\.(get|post|put|delete|patch)\s*\(\s*['"][^'"]*['"]\s*,\s*([a-zA-Z][a-zA-Z0-9_.]*)\s*$/, '$1);');

    // 计算移除数量
    if (changed) {
      const originalMatches = (originalContent.match(/verifyToken/g) || []).length;
      const newMatches = (content.match(/verifyToken/g) || []).length;
      removalCount = originalMatches - newMatches;

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 移除重复认证: ${path.relative(process.cwd(), filePath)} (${removalCount}处)`);
      return { fixed: true, removalCount };
    }

    return { fixed: false, reason: 'no_changes_needed' };
  } catch (error) {
    console.error(`❌ 错误处理文件 ${filePath}:`, error.message);
    return { fixed: false, reason: 'error', error: error.message };
  }
}

function scanAndRemoveDuplicateAuth(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  let totalRemovals = 0;
  let noGlobalAuthCount = 0;
  let errorCount = 0;
  let scannedCount = 0;

  console.log('🔍 扫描并移除重复的认证中间件...\n');

  for (const file of files) {
    if (file.endsWith('.routes.ts')) {
      const filePath = path.join(dir, file);
      scannedCount++;

      const result = removeDuplicateAuthInFile(filePath);

      if (result.fixed) {
        fixedCount++;
        totalRemovals += result.removalCount;
      } else {
        switch (result.reason) {
          case 'no_global_auth':
            console.log(`⚠️  无全局认证: ${file}`);
            noGlobalAuthCount++;
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
  console.log(`   - 移除重复认证数: ${totalRemovals}`);
  console.log(`   - 无全局认证: ${noGlobalAuthCount}`);
  console.log(`   - 处理错误数: ${errorCount}`);

  if (fixedCount > 0) {
    console.log(`\n✨ 成功移除 ${fixedCount} 个文件中的 ${totalRemovals} 处重复认证!`);
  } else {
    console.log(`\nℹ️  没有需要移除的重复认证。`);
  }
}

// 开始执行
console.log('🚀 开始移除重复的认证中间件...\n');
scanAndRemoveDuplicateAuth(routesDir);