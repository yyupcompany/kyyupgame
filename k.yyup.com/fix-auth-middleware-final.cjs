const fs = require('fs');
const path = require('path');

function findAndFixAuthMiddleware(dir) {
  const files = [];

  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'node_modules') {
        scanDir(fullPath);
      } else if (item.endsWith('.routes.ts')) {
        files.push(fullPath);
      }
    }
  }

  scanDir(dir);

  console.log('检查路由文件中的认证中间件问题...');

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 检查是否有 verifyToken 使用但没有导入
    if (content.includes('verifyToken') && !content.includes('import.*verifyToken.*from.*auth.middleware')) {
      console.log(`❌ ${file} 使用 verifyToken 但缺少导入`);

      // 查找现有导入语句并添加 verifyToken
      if (content.includes('from \'../middlewares/auth.middleware\'')) {
        content = content.replace(
          /from '\.\.\/middlewares\/auth\.middleware'/,
          "from '../middlewares/auth.middleware'"
        );
        // 在现有的 auth.middleware 导入中添加 verifyToken
        content = content.replace(
          /import {([^}]*)} from '\.\.\/middlewares\/auth\.middleware'/,
          (match, imports) => {
            const importList = imports.split(',').map(imp => imp.trim());
            if (!importList.includes('verifyToken')) {
              importList.push('verifyToken');
            }
            return `import { ${importList.join(', ')} } from '../middlewares/auth.middleware'`;
          }
        );
        changed = true;
      }
    }

    // 检查是否有 authMiddleware 使用但导入了 verifyToken
    if (content.includes('authMiddleware') && content.includes('verifyToken')) {
      console.log(`⚠️  ${file} 使用 authMiddleware 但导入了 verifyToken`);
      content = content.replace(/authMiddleware/g, 'verifyToken');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log(`✅ 修复: ${file}`);
    }
  }

  console.log('检查完成');
}

findAndFixAuthMiddleware('./server/src/routes');