const fs = require('fs');
const path = require('path');

/**
 * 批量修复中间件命名规范
 * 将 authMiddleware 和 authenticate 统一为 verifyToken
 */

const routesDir = path.join(__dirname, 'server/src/routes');

// 需要替换的模式
const replacements = [
  // 导入语句中的替换
  {
    pattern: /\{[^}]*authMiddleware[^}]*\}/g,
    replacement: (match) => {
      // 提取所有导入的名称
      const imports = match.match(/\b[^,\s}]+\b/g);
      if (!imports) return '{ verifyToken }';

      // 移除 authMiddleware 和 authenticate，保留其他
      const filtered = imports.filter(name =>
        name !== 'authMiddleware' && name !== 'authenticate'
      );

      // 如果 verifyToken 不在其中，添加它
      if (!filtered.includes('verifyToken')) {
        filtered.push('verifyToken');
      }

      return `{ ${filtered.join(', ')} }`;
    }
  },
  // 简单的导入替换
  {
    pattern: /import\s*\{\s*authMiddleware\s*\}/g,
    replacement: 'import { verifyToken }'
  },
  {
    pattern: /import\s*\{\s*authenticate\s*\}/g,
    replacement: 'import { verifyToken }'
  },
  {
    pattern: /import\s*\{\s*authenticate,\s*verifyToken\s*\}/g,
    replacement: 'import { verifyToken }'
  },
  {
    pattern: /import\s*\{\s*verifyToken,\s*authenticate\s*\}/g,
    replacement: 'import { verifyToken }'
  },
  // 使用中的替换
  {
    pattern: /\.use\s*\(\s*authMiddleware\s*\)/g,
    replacement: '.use(verifyToken)'
  },
  {
    pattern: /\.use\s*\(\s*authenticate\s*\)/g,
    replacement: '.use(verifyToken)'
  },
  // 路由中的替换（逗号后或开头的）
  {
    pattern: /,\s*authMiddleware\s*(?=[,)])/g,
    replacement: ', verifyToken'
  },
  {
    pattern: /,\s*authenticate\s*(?=[,)])/g,
    replacement: ', verifyToken'
  },
  {
    pattern: /router\.\w+\(\s*authMiddleware\s*,/g,
    replacement: (match) => match.replace('authMiddleware', 'verifyToken')
  },
  {
    pattern: /router\.\w+\(\s*authenticate\s*,/g,
    replacement: (match) => match.replace('authenticate', 'verifyToken')
  },
  {
    pattern: /router\.\w+\(\s*[^,]*,\s*authMiddleware\s*,/g,
    replacement: (match) => match.replace('authMiddleware', 'verifyToken')
  },
  {
    pattern: /router\.\w+\(\s*[^,]*,\s*authenticate\s*,/g,
    replacement: (match) => match.replace('authenticate', 'verifyToken')
  },
  // 任何其他地方的替换（谨慎使用）
  {
    pattern: /\bauthMiddleware\b/g,
    replacement: 'verifyToken'
  },
  {
    pattern: /\bauthenticate\b(?!.*\b\.authenticate\b)/g,
    replacement: 'verifyToken'
  }
];

function fixMiddlewareInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 应用所有替换规则
    for (const { pattern, replacement } of replacements) {
      if (typeof replacement === 'function') {
        content = content.replace(pattern, replacement);
      } else {
        content = content.replace(pattern, replacement);
      }
    }

    // 如果内容有变化，写回文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ 错误处理文件 ${filePath}:`, error.message);
    return false;
  }
}

function scanAndFixFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  let scannedCount = 0;

  console.log('🔍 扫描路由文件中的中间件命名问题...\n');

  for (const file of files) {
    if (file.endsWith('.routes.ts')) {
      const filePath = path.join(dir, file);
      scannedCount++;

      // 检查文件是否包含需要修复的内容
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('authMiddleware') || content.includes('authenticate')) {
        console.log(`📝 发现问题: ${file}`);
        if (fixMiddlewareInFile(filePath)) {
          fixedCount++;
        }
      }
    }
  }

  console.log(`\n📊 统计结果:`);
  console.log(`   - 扫描文件数: ${scannedCount}`);
  console.log(`   - 修复文件数: ${fixedCount}`);

  if (fixedCount > 0) {
    console.log(`\n✨ 中间件命名标准化完成!`);
  } else {
    console.log(`\n✅ 所有文件已符合标准!`);
  }
}

// 开始执行
console.log('🚀 开始中间件命名标准化...\n');
scanAndFixFiles(routesDir);