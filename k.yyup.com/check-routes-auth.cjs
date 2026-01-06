#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 路由文件目录
const ROUTES_DIR = '/home/zhgue/kyyupgame/k.yyup.com/server/src/routes';

// 统计数据
const stats = {
  totalFiles: 0,
  withGlobalAuth: 0,
  withoutGlobalAuth: 0,
  withIndividualAuth: 0,
  noAuth: 0,
  withPermissionCheck: 0,
  standardizedAuth: 0,
  nonStandardAuth: 0,
  issues: []
};

// 分析单个路由文件
function analyzeRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  const analysis = {
    file: fileName,
    path: filePath,
    hasGlobalAuth: false,
    hasIndividualAuth: false,
    hasNoAuth: false,
    hasPermissionCheck: false,
    authMiddleware: null,
    permissionMiddleware: null,
    importPath: null,
    issues: []
  };

  // 检查认证中间件导入
  const importMatches = content.match(/import.*from.*['"]\.\.\/middlewares\/(auth\.middleware|middleware|auth)['"]/g);
  if (importMatches) {
    analysis.importPath = importMatches[0];
  }

  // 检查全局认证中间件使用
  if (content.includes('router.use(verifyToken)') ||
      content.includes('router.use(authMiddleware.verifyToken)')) {
    analysis.hasGlobalAuth = true;
  }

  // 检查是否注释掉了全局认证
  if (content.includes('// router.use(verifyToken)') ||
      content.includes('// router.use(authMiddleware.verifyToken)')) {
    analysis.hasNoAuth = true;
  }

  // 检查单独的认证中间件使用
  const individualAuthMatches = content.match(/router\.(get|post|put|delete|patch)\([^,]*,\s*([^,]*verifyToken[^,]*|[^,]*authMiddleware[^,]*)/g);
  if (individualAuthMatches && individualAuthMatches.length > 0) {
    analysis.hasIndividualAuth = true;
  }

  // 检查权限检查中间件
  const permissionMatches = content.match(/checkPermission|hasPermission|requirePermission/g);
  if (permissionMatches) {
    analysis.hasPermissionCheck = true;
    analysis.permissionMiddleware = permissionMatches[0];
  }

  // 检查认证中间件的具体使用方式
  const authMiddlewareMatches = content.match(/(verifyToken|authMiddleware\.verifyToken|middleware\.verifyToken)/g);
  if (authMiddlewareMatches) {
    analysis.authMiddleware = authMiddlewareMatches[0];
  }

  // 识别问题
  if (!analysis.hasGlobalAuth && !analysis.hasIndividualAuth && !analysis.hasNoAuth) {
    analysis.issues.push('完全没有认证保护');
  }

  if (analysis.hasIndividualAuth && !analysis.hasGlobalAuth) {
    analysis.issues.push('使用单独认证而非全局认证');
  }

  if (analysis.hasNoAuth) {
    analysis.issues.push('全局认证被注释掉');
  }

  if (!analysis.importPath) {
    analysis.issues.push('缺少认证中间件导入');
  }

  if (importMatches && importMatches.length > 1) {
    analysis.issues.push('存在多个不同的认证中间件导入');
  }

  // 检查不标准的导入路径
  if (content.includes("from '../middleware/auth'") ||
      content.includes("from '../middleware/authMiddleware'") ||
      content.includes("from './middleware/auth'")) {
    analysis.issues.push('使用了不标准的认证中间件导入路径');
  }

  return analysis;
}

// 主函数
function main() {
  console.log('🔍 开始分析路由文件权限配置统一性...\n');

  // 读取所有路由文件
  const files = fs.readdirSync(ROUTES_DIR)
    .filter(file => file.endsWith('.routes.ts') || file.endsWith('.routes.js'))
    .filter(file => !file.includes('.backup') && !file.includes('.bak'))
    .filter(file => !['index.ts', 'add-permission.ts', 'fix-permissions.ts', 'api.ts', 'ai.ts'].includes(file));

  stats.totalFiles = files.length;

  console.log(`📊 共发现 ${files.length} 个路由文件\n`);

  // 分析每个文件
  const results = [];
  for (const file of files) {
    const filePath = path.join(ROUTES_DIR, file);
    const analysis = analyzeRouteFile(filePath);
    results.push(analysis);

    // 更新统计
    if (analysis.hasGlobalAuth) stats.withGlobalAuth++;
    if (analysis.hasNoAuth) stats.withoutGlobalAuth++;
    if (analysis.hasIndividualAuth) stats.withIndividualAuth++;
    if (!analysis.hasGlobalAuth && !analysis.hasIndividualAuth && !analysis.hasNoAuth) stats.noAuth++;
    if (analysis.hasPermissionCheck) stats.withPermissionCheck++;

    // 判断是否标准化
    const isStandard = analysis.hasGlobalAuth &&
                      !analysis.hasNoAuth &&
                      !analysis.hasIndividualAuth &&
                      analysis.importPath &&
                      analysis.importPath.includes('auth.middleware') &&
                      !analysis.issues.some(issue => issue.includes('不标准'));

    if (isStandard) {
      stats.standardizedAuth++;
    } else {
      stats.nonStandardAuth++;
    }

    if (analysis.issues.length > 0) {
      stats.issues.push(...analysis.issues.map(issue => `${file}: ${issue}`));
    }
  }

  // 输出报告
  console.log('📈 统计数据：');
  console.log(`├── 总路由文件数: ${stats.totalFiles}`);
  console.log(`├── 使用全局认证: ${stats.withGlobalAuth}`);
  console.log(`├── 全局认证被注释: ${stats.withoutGlobalAuth}`);
  console.log(`├── 使用单独认证: ${stats.withIndividualAuth}`);
  console.log(`├── 完全没有认证: ${stats.noAuth}`);
  console.log(`├── 有权限检查: ${stats.withPermissionCheck}`);
  console.log(`├── 已标准化认证: ${stats.standardizedAuth}`);
  console.log(`└── 需要修复: ${stats.nonStandardAuth}\n`);

  // 输出详细结果
  console.log('📋 详细分析结果：\n');

  // 1. 已标准化文件
  console.log('✅ 已标准化认证的文件：');
  results
    .filter(r => r.hasGlobalAuth && !r.hasNoAuth && !r.hasIndividualAuth && !r.issues.length)
    .forEach(r => console.log(`   ${r.file}`));
  console.log(`\n   共 ${stats.standardizedAuth} 个文件\n`);

  // 2. 需要修复的文件
  console.log('⚠️  需要修复的文件：');
  results
    .filter(r => r.issues.length > 0)
    .forEach(r => {
      console.log(`\n   📁 ${r.file}`);
      r.issues.forEach(issue => console.log(`      - ${issue}`));
      if (r.hasGlobalAuth) console.log(`      ✓ 使用全局认证`);
      if (r.hasNoAuth) console.log(`      ✗ 全局认证被注释`);
      if (r.hasIndividualAuth) console.log(`      ✗ 使用单独认证`);
      if (r.importPath) console.log(`      导入: ${r.importPath}`);
    });

  // 3. 问题汇总
  if (stats.issues.length > 0) {
    console.log('\n\n❌ 发现的问题汇总：');
    stats.issues.forEach(issue => console.log(`   - ${issue}`));
  }

  // 生成标准化模板
  console.log('\n\n📝 标准化路由文件模板：');
  console.log('```typescript');
  console.log('import { Router } from \'express\';');
  console.log('import { verifyToken, checkPermission } from \'../middlewares/auth.middleware\';');
  console.log('');
  console.log('const router = Router();');
  console.log('');
  console.log('// 全局认证中间件 - 所有路由都需要认证');
  console.log('router.use(verifyToken);');
  console.log('');
  console.log('// 示例路由 - 需要特定权限');
  console.log('router.get(\'/\', checkPermission(\'resource:read\'), (req, res) => {');
  console.log('  // 路由处理逻辑');
  console.log('});');
  console.log('');
  console.log('// 示例路由 - 仅需认证');
  console.log('router.post(\'/\', (req, res) => {');
  console.log('  // 路由处理逻辑');
  console.log('});');
  console.log('');
  console.log('// 公开路由（如需要）应该在单独的文件中定义');
  console.log('export default router;');
  console.log('```');

  // 修复建议
  console.log('\n🔧 修复建议：');
  console.log('1. 所有路由文件应该使用全局认证中间件');
  console.log('2. 统一使用 ../middlewares/auth.middleware 导入路径');
  console.log('3. 需要特定权限的路由使用 checkPermission 中间件');
  console.log('4. 公开路由应该定义在单独的路由文件中');
  console.log('5. 避免在每个路由中单独添加认证中间件');

  // 优先级分类
  console.log('\n🚨 修复优先级：');
  console.log('\n   高优先级（立即修复）：');
  console.log('   - 完全没有认证的文件');
  console.log('   - 全局认证被注释的文件');

  console.log('\n   中优先级（本周修复）：');
  console.log('   - 使用单独认证的文件');
  console.log('   - 导入路径不标准的文件');

  console.log('\n   低优先级（下个迭代）：');
  console.log('   - 添加权限检查中间件');
  console.log('   - 代码风格统一');

  return { stats, results };
}

// 运行分析
if (require.main === module) {
  main();
}

module.exports = { analyzeRouteFile, main };