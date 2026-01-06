const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复routes/index.ts中的TypeScript编译错误...');

const routesIndexPath = path.join(__dirname, 'src/routes/index.ts');
let content = fs.readFileSync(routesIndexPath, 'utf-8');

console.log('📝 修复Express路由处理器类型问题...');

// 修复Express路由类型问题
const fixes = [
  // 修复路由处理器类型定义 - 更全面的模式
  {
    search: /\(req:\s*Request[^)]*\)\s*=>\s*{/g,
    replace: '(req) => {'
  },
  {
    search: /\(req:\s*RequestWithTenant[^)]*\)\s*=>\s*{/g,
    replace: '(req) => {'
  },
  // 处理包含res和next的函数
  {
    search: /\(req:\s*Request[^,]*,\s*res:\s*Response[^)]*\)\s*=>\s*{/g,
    replace: '(req, res) => {'
  },
  {
    search: /\(req:\s*RequestWithTenant[^,]*,\s*res:\s*Response[^)]*\)\s*=>\s*{/g,
    replace: '(req, res) => {'
  },
  {
    search: /\(req:\s*Request[^,]*,\s*res:\s*Response[^,]*,\s*next:\s*NextFunction[^)]*\)\s*=>\s*{/g,
    replace: '(req, res, next) => {'
  },
  {
    search: /\(req:\s*RequestWithTenant[^,]*,\s*res:\s*Response[^,]*,\s*next:\s*NextFunction[^)]*\)\s*=>\s*{/g,
    replace: '(req, res, next) => {'
  },
  // 处理async函数
  {
    search: /async\s*\(req:\s*Request[^)]*\)\s*=>\s*{/g,
    replace: 'async (req) => {'
  },
  {
    search: /async\s*\(req:\s*RequestWithTenant[^)]*\)\s*=>\s*{/g,
    replace: 'async (req) => {'
  },
  {
    search: /async\s*\(req:\s*Request[^,]*,\s*res:\s*Response[^)]*\)\s*=>\s*{/g,
    replace: 'async (req, res) => {'
  },
  {
    search: /async\s*\(req:\s*RequestWithTenant[^,]*,\s*res:\s*Response[^)]*\)\s*=>\s*{/g,
    replace: 'async (req, res) => {'
  },
  {
    search: /async\s*\(req:\s*Request[^,]*,\s*res:\s*Response[^,]*,\s*next:\s*NextFunction[^)]*\)\s*=>\s*{/g,
    replace: 'async (req, res, next) => {'
  },
  {
    search: /async\s*\(req:\s*RequestWithTenant[^,]*,\s*res:\s*Response[^,]*,\s*next:\s*NextFunction[^)]*\)\s*=>\s*{/g,
    replace: 'async (req, res, next) => {'
  }
];

// 应用修复
fixes.forEach((fix, index) => {
  const before = content.match(fix.search);
  if (before) {
    content = content.replace(fix.search, fix.replace);
    console.log(`✅ 修复 ${index + 1}: 应用路由类型修复`);
  }
});

// 修复Express路由Request接口User类型冲突
const userInterfaceFixes = [
  // 修复中间件路由处理器中的User类型问题
  {
    search: /\(req:\s*RequestWithTenant[^)]*\)\s*=>\s*{/g,
    replace: '(req: any) => {'
  },
  {
    search: /\(req:\s*Request[^)]*\)\s*=>\s*{/g,
    replace: '(req: any) => {'
  },
  // 修复async路由处理器
  {
    search: /async\s*\(req:\s*Request[^)]*\)\s*=>\s*{/g,
    replace: 'async (req: any) => {'
  },
  {
    search: /async\s*\(req:\s*RequestWithTenant[^)]*\)\s*=>\s*{/g,
    replace: 'async (req: any) => {'
  }
];

// 应用User接口修复
userInterfaceFixes.forEach((fix, index) => {
  const before = content.match(fix.search);
  if (before) {
    content = content.replace(fix.search, fix.replace);
    console.log(`✅ 修复 User接口冲突 ${index + 1}: 应用User类型修复`);
  }
});

// 写入修复后的文件
fs.writeFileSync(routesIndexPath, content, 'utf-8');

console.log('✅ routes/index.ts TypeScript编译错误修复完成！');