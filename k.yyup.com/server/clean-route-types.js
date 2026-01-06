const fs = require('fs');
const path = require('path');

console.log('🔧 彻底修复路由TypeScript类型错误...');

const routesIndexPath = path.join(__dirname, 'src/routes/index.ts');
let content = fs.readFileSync(routesIndexPath, 'utf-8');

console.log('📝 移除所有路由处理器中的显式类型...');

// 移除所有路由处理器函数参数中的显式类型
const typeFixes = [
  // 移除 (req: any, res: any) => 中的类型
  {
    search: /\(req: any, res: any\) =>/g,
    replace: '(req, res) =>'
  },
  // 移除 (req: any, res: any, next: any) => 中的类型
  {
    search: /\(req: any, res: any, next: any\) =>/g,
    replace: '(req, res, next) =>'
  },
  // 移除 async (req: any, res: any) => 中的类型
  {
    search: /async \(req: any, res: any\) =>/g,
    replace: 'async (req, res) =>'
  },
  // 移除 async (req: any, res: any, next: any) => 中的类型
  {
    search: /async \(req: any, res: any, next: any\) =>/g,
    replace: 'async (req, res, next) =>'
  },
  // 移除任何剩余的类型注解
  {
    search: /\(req:\s*[^,)]+,\s*res:\s*[^)]+\)\s*=>/g,
    replace: '(req, res) =>'
  },
  {
    search: /\(req:\s*[^,)]+,\s*res:\s*[^,]+,\s*next:\s*[^)]+\)\s*=>/g,
    replace: '(req, res, next) =>'
  },
  {
    search: /async\s*\(req:\s*[^,)]+,\s*res:\s*[^)]+\)\s*=>/g,
    replace: 'async (req, res) =>'
  },
  {
    search: /async\s*\(req:\s*[^,)]+,\s*res:\s*[^,]+,\s*next:\s*[^)]+\)\s*=>/g,
    replace: 'async (req, res, next) =>'
  }
];

// 应用所有修复
let appliedFixes = 0;
typeFixes.forEach((fix, index) => {
  const before = content.match(fix.search);
  if (before) {
    content = content.replace(fix.search, fix.replace);
    appliedFixes++;
    console.log(`✅ 修复 ${index + 1}: 应用路由类型修复`);
  }
});

// 额外的全局替换 - 确保没有遗漏
content = content.replace(/\(req:\s*any,\s*res:\s*any\)\s*=>/g, '(req, res) =>');
content = content.replace(/\(req:\s*any,\s*res:\s*any,\s*next:\s*any\)\s*=>/g, '(req, res, next) =>');
content = content.replace(/async\s*\(req:\s*any,\s*res:\s*any\)\s*=>/g, 'async (req, res) =>');
content = content.replace(/async\s*\(req:\s*any,\s*res:\s*any,\s*next:\s*any\)\s*=>/g, 'async (req, res, next) =>');

// 写入修复后的文件
fs.writeFileSync(routesIndexPath, content, 'utf-8');

console.log(`✅ 路由TypeScript类型错误修复完成！`);
console.log(`📊 应用了 ${appliedFixes} 个修复，并执行了全局类型替换`);
console.log('🎯 所有路由处理器现在都使用类型推断');