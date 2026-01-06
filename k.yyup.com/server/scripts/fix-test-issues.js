#!/usr/bin/env node

/**
 * 批量修复后端测试文件中的常见问题
 */

const fs = require('fs');
const path = require('path');

// 获取所有测试文件
function getAllTestFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.test.ts') || item.endsWith('.test.js')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// 修复函数
function fixTestFile(filePath) {
  console.log(`修复文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 1. 修复 Sequelize.DataTypes -> DataTypes
  if (content.includes('Sequelize.DataTypes')) {
    // 确保导入了 DataTypes
    if (!content.includes('import { Sequelize, DataTypes }') && 
        !content.includes('import { DataTypes }')) {
      content = content.replace(
        /import { Sequelize } from 'sequelize';/g,
        "import { Sequelize, DataTypes } from 'sequelize';"
      );
    }
    
    // 替换所有 Sequelize.DataTypes 为 DataTypes
    content = content.replace(/Sequelize\.DataTypes/g, 'DataTypes');
    modified = true;
  }
  
  // 2. 修复 Array().fill() -> Array().fill(null)
  const arrayFillRegex = /Array\((\d+)\)\.fill\(\)/g;
  if (arrayFillRegex.test(content)) {
    content = content.replace(arrayFillRegex, 'Array($1).fill(null)');
    modified = true;
  }
  
  // 3. 修复 sequelize.Op -> Op (确保导入)
  if (content.includes('sequelize.Op')) {
    if (!content.includes('import { Op }')) {
      content = content.replace(
        /import { Sequelize } from 'sequelize';/g,
        "import { Sequelize, Op } from 'sequelize';"
      );
      content = content.replace(
        /import { Sequelize, DataTypes } from 'sequelize';/g,
        "import { Sequelize, DataTypes, Op } from 'sequelize';"
      );
    }
    content = content.replace(/sequelize\.Op/g, 'Op');
    modified = true;
  }
  
  // 4. 修复 const assertions 问题
  content = content.replace(
    /severity: severities\[i % 4\] as const,/g,
    "severity: severities[i % 4] as 'low' | 'medium' | 'high' | 'critical',"
  );
  content = content.replace(
    /status: statuses\[i % 4\] as const,/g,
    "status: statuses[i % 4] as 'active' | 'resolved' | 'ignored',"
  );
  content = content.replace(
    /severity: \['low', 'medium', 'high', 'critical'\]\[i % 4\] as const,/g,
    "severity: ['low', 'medium', 'high', 'critical'][i % 4] as 'low' | 'medium' | 'high' | 'critical',"
  );
  content = content.replace(
    /status: \['active', 'resolved', 'ignored'\]\[i % 3\] as const,/g,
    "status: ['active', 'resolved', 'ignored'][i % 3] as 'active' | 'resolved' | 'ignored',"
  );
  
  // 5. 修复 Mock 函数类型问题
  content = content.replace(
    /jest\.fn\(\)\.mockResolvedValue\(true\)/g,
    'jest.fn().mockResolvedValue(true as any)'
  );
  
  // 6. 修复 this 类型问题 - 使用箭头函数
  content = content.replace(
    /jest\.fn\(\)\.mockImplementation\(function\(/g,
    'jest.fn().mockImplementation(('
  );
  
  // 7. 修复 Error.statusCode 问题
  content = content.replace(
    /error\.statusCode = (\d+);/g,
    '(error as any).statusCode = $1;'
  );
  
  // 8. 修复 next() 调用问题
  content = content.replace(
    /const mockNext = \{\};/g,
    'const mockNext = jest.fn();'
  );

  // 9. 修复模块路径问题
  content = content.replace(
    /validation\.middleware/g,
    'validate.middleware'
  );

  // 10. 修复缺失的控制器引用 - 注释掉不存在的模块
  if (content.includes("'../../../../../src/controllers/statistics.controller'")) {
    content = content.replace(
      /jest\.unstable_mockModule\('\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/src\/controllers\/statistics\.controller'[^;]+;/g,
      "// jest.unstable_mockModule('../../../../../src/controllers/statistics.controller', () => mockStatisticsController);"
    );
    modified = true;
  }

  // 11. 修复缺失的中间件引用
  if (content.includes("'../../../src/middlewares/validation.middleware'")) {
    content = content.replace(
      /jest\.unstable_mockModule\('\.\.\/\.\.\/\.\.\/src\/middlewares\/validation\.middleware'[^;]+;/g,
      "jest.unstable_mockModule('../../../src/middlewares/validate.middleware', () => ({"
    );
    modified = true;
  }

  if (content.includes("'../../../../../src/middlewares/auth.middleware'")) {
    content = content.replace(
      /jest\.unstable_mockModule\('\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/src\/middlewares\/auth\.middleware'[^;]+;/g,
      "jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({"
    );
    modified = true;
  }

  // 12. 修复 sequelize.DataTypes -> DataTypes
  if (content.includes('sequelize.DataTypes')) {
    content = content.replace(/sequelize\.DataTypes/g, 'DataTypes');
    modified = true;
  }

  // 13. 修复 Op 导入问题
  if (content.includes('[Op.') && !content.includes('import { Op }')) {
    if (content.includes('import { Sequelize, DataTypes }')) {
      content = content.replace(
        /import { Sequelize, DataTypes } from 'sequelize';/g,
        "import { Sequelize, DataTypes, Op } from 'sequelize';"
      );
    } else if (content.includes('import { Sequelize }')) {
      content = content.replace(
        /import { Sequelize } from 'sequelize';/g,
        "import { Sequelize, Op } from 'sequelize';"
      );
    }
    modified = true;
  }

  // 14. 修复 const assertions 类型问题
  content = content.replace(
    /severity: severities\[i % 4\] as const,/g,
    "severity: severities[i % 4] as 'low' | 'medium' | 'high' | 'critical',"
  );
  content = content.replace(
    /status: statuses\[i % [345]\] as const,/g,
    "status: statuses[i % 3] as 'active' | 'resolved' | 'ignored',"
  );
  content = content.replace(
    /exploitability: \['none', 'low', 'medium', 'high'\]\[i % 4\] as const,/g,
    "exploitability: ['none', 'low', 'medium', 'high'][i % 4] as 'none' | 'low' | 'medium' | 'high',"
  );
  content = content.replace(
    /impact: \['none', 'low', 'medium', 'high'\]\[i % 4\] as const,/g,
    "impact: ['none', 'low', 'medium', 'high'][i % 4] as 'none' | 'low' | 'medium' | 'high',"
  );
  content = content.replace(
    /status: \['open', 'confirmed', 'fixed'\]\[i % 3\] as const,/g,
    "status: ['open', 'confirmed', 'fixed'][i % 3] as 'open' | 'confirmed' | 'fixed',"
  );

  // 修复更多的 const assertions 模式
  content = content.replace(
    /status: statuses\[i % 5\] as const,/g,
    "status: statuses[i % 5] as 'open' | 'confirmed' | 'fixed' | 'ignored' | 'false_positive',"
  );
  content = content.replace(
    /exploitability: \['none', 'low', 'medium', 'high'\]\[i % 4\] as const,/g,
    "exploitability: ['none', 'low', 'medium', 'high'][i % 4] as 'none' | 'low' | 'medium' | 'high',"
  );
  content = content.replace(
    /impact: \['none', 'low', 'medium', 'high'\]\[i % 4\] as const,/g,
    "impact: ['none', 'low', 'medium', 'high'][i % 4] as 'none' | 'low' | 'medium' | 'high',"
  );

  // 15. 修复 User 模型属性问题
  if (content.includes("role: 'admin'")) {
    content = content.replace(
      /role: 'admin',/g,
      "role: 'admin' as any,"
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
  } else {
    console.log(`⏭️  无需修复: ${filePath}`);
  }
}

// 主函数
function main() {
  const testsDir = path.join(__dirname, '../tests');
  
  if (!fs.existsSync(testsDir)) {
    console.error('测试目录不存在:', testsDir);
    process.exit(1);
  }
  
  console.log('🔧 开始批量修复测试文件...');
  
  const testFiles = getAllTestFiles(testsDir);
  console.log(`找到 ${testFiles.length} 个测试文件`);
  
  for (const file of testFiles) {
    try {
      fixTestFile(file);
    } catch (error) {
      console.error(`❌ 修复失败: ${file}`, error.message);
    }
  }
  
  console.log('🎉 批量修复完成!');
}

if (require.main === module) {
  main();
}

module.exports = { fixTestFile, getAllTestFiles };
