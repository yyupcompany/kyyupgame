const fs = require('fs');
const path = require('path');

console.log('🔧 修复 QueryTypes 问题...');

const authMiddlewarePath = path.join(__dirname, 'src/middlewares/auth.middleware.ts');
let content = fs.readFileSync(authMiddlewarePath, 'utf8');

// 导入 QueryTypes
if (!content.includes('import { QueryTypes }')) {
  content = content.replace(
    "import { Op, Sequelize } from 'sequelize';",
    "import { Op, Sequelize, QueryTypes } from 'sequelize';"
  );
}

// 替换 sequelize.QueryTypes 为 QueryTypes
content = content.replace(/sequelize\.QueryTypes/g, 'QueryTypes');

fs.writeFileSync(authMiddlewarePath, content);
console.log('✅ QueryTypes 问题修复完成');