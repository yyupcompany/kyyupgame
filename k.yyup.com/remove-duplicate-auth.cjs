const fs = require('fs');
const path = require('path');

/**
 * 移除重复的verifyToken调用
 * 当启用全局认证中间件后，移除路由中重复的verifyToken调用
 */

const routesDir = path.join(__dirname, 'server/src/routes');

// 需要移除的模式（注意：要避免移除包含权限检查的verifyToken调用）
const patterns = [
  // 移除简单的verifyToken调用（逗号后）
  {
    pattern: /,\s*verifyToken\s*,(?=[^)]*,(?![^)]*verifyToken))/g,
    replacement: ',',
    description: '移除逗号后的verifyToken'
  },
  // 移除开头的verifyToken调用（后面有逗号）
  {
    pattern: /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]+['"`]\s*,\s*verifyToken\s*,/g,
    replacement: (match, method) => {
      return `router.${method}(${match.match(/['"`][^'"`]+['"`]/)[0]}, `;
    },
    description: '移除路由开头的verifyToken'
  },
  // 移除开头的verifyToken调用（后面没有逗号，直接是控制器函数）
  {
    pattern: /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]+['"`]\s*,\s*verifyToken\s*,?\s*([a-zA-Z][a-zA-Z0-9_\.]*)\s*\)/g,
    replacement: (match, method, controller) => {
      const path = match.match(/['"`][^'"`]+['"`]/)[0];
      return `router.${method}(${path}, ${controller})`;
    },
    description: '移除路由中唯一的verifyToken'
  }
];

function removeDuplicateAuthInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 首先检查是否启用了全局认证
    const hasGlobalAuth = /router\.use\s*\(\s*verifyToken\s*\)(?!\s*\/\/)/.test(content);
    if (!hasGlobalAuth) {
      return { fixed: false, reason: 'no_global_auth' };
    }

    // 检查是否有需要移除的verifyToken
    const hasLocalAuth = /router\.(get|post|put|delete|patch)\s*\([^)]*verifyToken[^)]*\)/.test(content);
    if (!hasLocalAuth) {
      return { fixed: false, reason: 'no_local_auth' };
    }

    // 备份原始内容
    const backupContent = content;

    // 应用替换规则，但要小心不要破坏权限检查
    let changed = false;
    let removalCount = 0;

    // 逐行处理，更安全的方式
    const lines = content.split('\n');
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let newLine = line;

      // 检查是否是路由定义行
      const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(/);
      if (routeMatch) {
        // 查找完整的路由定义（可能跨多行）
        let routeEnd = i;
        let openParens = (line.match(/\(/g) || []).length;
        let closeParens = (line.match(/\)/g) || []).length;

        // 向下查找路由定义结束
        while (routeEnd + 1 < lines.length && openParens > closeParens) {
          routeEnd++;
          openParens += (lines[routeEnd].match(/\(/g) || []).length;
          closeParens += (lines[routeEnd].match(/\)/g) || []).length;
        }

        // 提取完整路由定义
        const routeLines = lines.slice(i, routeEnd + 1);
        const routeContent = routeLines.join('\n');

        // 检查是否包含verifyToken且不包含权限检查
        if (routeContent.includes('verifyToken') &&
            !routeContent.includes('checkPermission') &&
            !routeContent.includes('checkRole')) {

          // 尝试移除verifyToken
          let newRouteContent = routeContent;

          // 替换常见的verifyToken使用模式
          const routePatterns = [
            // router.get('/path', verifyToken, controller)
            /(router\.[^(]+\([^,]*),\s*verifyToken\s*,\s*([^)]+)\))/g,
            // router.get('/path', verifyToken)
            /(router\.[^(]+\([^,]*),\s*verifyToken\s*\))/g,
            // get('/path', verifyToken, controller)
            /([^,.]+\([^,]*),\s*verifyToken\s*,\s*([^)]+)\))/g,
            // get('/path', verifyToken)
            /([^,.]+\([^,]*),\s*verifyToken\s*\))/g
          ];

          let routeChanged = false;
          for (const pattern of routePatterns) {
            const before = newRouteContent;
            newRouteContent = newRouteContent.replace(pattern, (match, ...groups) => {
              if (groups.length >= 2) {
                return match.replace(/\s*verifyToken\s*,?\s*/, ', ');
              } else {
                return match.replace(/\s*,\s*verifyToken\s*/, '');
              }
            });
            if (before !== newRouteContent) {
              routeChanged = true;
            }
          }

          if (routeChanged) {
            // 更新行
            const newRouteLines = newRouteContent.split('\n');
            lines.splice(i, routeLines.length, ...newRouteLines);
            changed = true;
            removalCount++;
          }
        }
      }

      newLines.push(lines[i]);
    }

    // 写回文件（如果有变化）
    if (changed) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
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
  let noLocalAuthCount = 0;
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
          case 'no_local_auth':
            console.log(`ℹ️  无本地认证: ${file}`);
            noLocalAuthCount++;
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
  console.log(`   - 无本地认证: ${noLocalAuthCount}`);
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