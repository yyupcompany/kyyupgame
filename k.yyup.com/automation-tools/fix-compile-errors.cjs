const fs = require('fs');
const path = require('path');

/**
 * 编译错误批量修复工具
 */

const serverDir = path.join(__dirname, '../server/src');

// 修复控制器导入路径
function fixControllerImports() {
  console.log('🔧 修复控制器导入路径问题...\n');

  const controllersDir = path.join(serverDir, 'controllers');
  const existingControllers = fs.readdirSync(controllersDir)
    .filter(file => file.endsWith('.controller.ts'))
    .map(file => file.replace('.controller.ts', ''));

  console.log(`📁 找到 ${existingControllers.length} 个控制器文件\n`);

  // 路由文件映射
  const routeControllerMap = {
    'ai-analysis': 'aiAnalysisController',
    'ai-bridge': 'aiBridgeController',
    'ai-performance': 'aiPerformanceController',
    'conversation': 'conversationController',
    'feedback': 'feedbackController',
    'message': 'messageController',
    'model': 'modelController',
    'quota': 'quotaController',
    'conversion-tracking': 'conversionTrackingController',
    'dashboard': 'dashboardController',
    'data-import': 'dataImportController',
    'enrollment-ai': 'enrollmentAIController',
    'enrollment-center': 'enrollmentCenterController',
    'enrollment-plan': 'enrollmentPlanController',
    'enrollment-statistics': 'enrollmentStatisticsController',
    'files': 'fileController',
    'marketing-campaign': 'marketingCampaignController',
    'marketing-center': 'marketingCenterController',
    'parent': 'parentController',
    'parent-student-relation': 'parentStudentRelationController',
    'poster-upload': 'posterUploadController',
    'principal': 'principalController',
    'setup-permissions': 'setupPermissionsController',
    'student': 'studentController',
    'task': 'taskController'
  };

  let fixCount = 0;

  for (const [routeFile, expectedController] of Object.entries(routeControllerMap)) {
    const routePath = path.join(serverDir, 'routes', `${routeFile}.routes.ts`);

    if (fs.existsSync(routePath)) {
      let content = fs.readFileSync(routePath, 'utf8');
      const originalContent = content;

      // 查找错误的导入路径
      const importPattern = new RegExp(`from ['"]\\.\\.\\/controllers\\/${expectedController}\\.controller['"]`, 'g');

      // 检查对应的控制器文件是否存在
      const controllerPath = path.join(controllersDir, `${expectedController}.controller.ts`);

      if (!fs.existsSync(controllerPath)) {
        console.log(`⚠️  ${routeFile}.routes.ts - 控制器文件不存在: ${expectedController}.controller.ts`);

        // 尝试查找相似的控制器文件
        const similarController = existingControllers.find(c =>
          c.toLowerCase().includes(expectedController.toLowerCase().replace('Controller', '').toLowerCase())
        );

        if (similarController) {
          console.log(`✅ ${routeFile}.routes.ts - 找到相似控制器: ${similarController}`);
          content = content.replace(importPattern, `from '../controllers/${similarController}.controller'`);
          fixCount++;
        }
      }

      if (content !== originalContent) {
        fs.writeFileSync(routePath, content, 'utf8');
        console.log(`✅ ${routeFile}.routes.ts - 导入路径已修复`);
      }
    }
  }

  return fixCount;
}

// 修复verifyToken导入问题
function fixVerifyTokenImports() {
  console.log('\n🔧 修复verifyToken导入问题...\n');

  const routesDir = path.join(serverDir, 'routes');
  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.routes.ts'));

  let fixCount = 0;

  for (const file of files) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('verifyToken') && !content.includes('import.*verifyToken')) {
      // 查找是否有其他中间件导入
      const authMiddlewareImport = content.match(/import\s*\{[^}]*\}\s*from\s*['"]\.\.\/middlewares\/auth\.middleware['"]/);

      if (authMiddlewareImport) {
        // 在现有导入中添加verifyToken
        const importStatement = authMiddlewareImport[0];
        const newImportStatement = importStatement.replace(
          /import\s*\{([^}]*)\}/,
          (match, imports) => {
            if (imports.includes('verifyToken')) return match;
            return `import { ${imports.trim()}, verifyToken }`;
          }
        );

        content = content.replace(importStatement, newImportStatement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file} - 添加verifyToken导入`);
        fixCount++;
      }
    }
  }

  return fixCount;
}

// 修复类型声明问题
function fixTypeIssues() {
  console.log('\n🔧 修复常见类型问题...\n');

  let fixCount = 0;

  // 修复Express扩展类型冲突
  const expressExtensionsPath = path.join(serverDir, 'types/express-extensions.ts');
  if (fs.existsSync(expressExtensionsPath)) {
    let content = fs.readFileSync(expressExtensionsPath, 'utf8');

    // 重复声明问题
    if (content.includes('user: User') && content.includes('user: any')) {
      content = content.replace(/user:\s*any/g, 'user: User');
      fs.writeFileSync(expressExtensionsPath, content, 'utf8');
      console.log('✅ express-extensions.ts - 修复user类型声明');
      fixCount++;
    }
  }

  // 修复game-background的混合导入
  const gameBackgroundPath = path.join(serverDir, 'routes/game-background.routes.ts');
  if (fs.existsSync(gameBackgroundPath)) {
    let content = fs.readFileSync(gameBackgroundPath, 'utf8');

    // 修复CommonJS和ES6混合导入
    content = content.replace(/const\s*\{\s*Router\s*\}\s*=\s*require\(['"]express['"]\);/, 'import { Router } from \'express\';');
    content = content.replace(/const\s*\{\s*tenantOSS\s*\}\s*=\s*require\(['"][^'"]+['"]\);/, 'import { tenantOSS } from \'../services/tenant-oss-router.service\';');

    fs.writeFileSync(gameBackgroundPath, content, 'utf8');
    console.log('✅ game-background.routes.ts - 修复混合导入问题');
    fixCount++;
  }

  return fixCount;
}

// 修复其他常见问题
function fixCommonIssues() {
  console.log('\n🔧 修复其他常见问题...\n');

  let fixCount = 0;

  // 修复upload路由的类型问题
  const uploadPath = path.join(serverDir, 'routes/upload.routes.ts');
  if (fs.existsSync(uploadPath)) {
    let content = fs.readFileSync(uploadPath, 'utf8');

    // 修复uploadType类型问题
    content = content.replace(/uploadType\s*=\s*req\.body\.uploadType/g, 'uploadType = req.body.uploadType as "documents" | "logos" | "user-uploads"');

    fs.writeFileSync(uploadPath, content, 'utf8');
    console.log('✅ upload.routes.ts - 修复uploadType类型问题');
    fixCount++;
  }

  return fixCount;
}

// 批量修复所有问题
function batchFixCompileErrors() {
  console.log('🚀 开始批量修复编译错误\n');

  const controllerFixes = fixControllerImports();
  const verifyTokenFixes = fixVerifyTokenImports();
  const typeFixes = fixTypeIssues();
  const commonFixes = fixCommonIssues();

  console.log('\n📊 修复统计:');
  console.log(`   - 控制器导入路径修复: ${controllerFixes}个`);
  console.log(`   - verifyToken导入修复: ${verifyTokenFixes}个`);
  console.log(`   - 类型问题修复: ${typeFixes}个`);
  console.log(`   - 其他问题修复: ${commonFixes}个`);
  console.log(`   - 总修复数: ${controllerFixes + verifyTokenFixes + typeFixes + commonFixes}个`);

  return {
    controllerFixes,
    verifyTokenFixes,
    typeFixes,
    commonFixes,
    totalFixes: controllerFixes + verifyTokenFixes + typeFixes + commonFixes
  };
}

// 运行修复
console.log('🚀 开始修复编译错误...\n');
const result = batchFixCompileErrors();

console.log('\n🔍 尝试重新编译...\n');

// 尝试编译验证
const { spawn } = require('child_process');
const compileProcess = spawn('npm', ['run', 'build'], {
  cwd: path.join(__dirname, '../server'),
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

compileProcess.stdout.on('data', (data) => {
  output += data.toString();
});

compileProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

compileProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ 编译成功！');
    console.log(output);
  } else {
    console.log('⚠️  编译仍有错误:');

    // 统计剩余错误
    const errorMatches = errorOutput.match(/error TS\d+:/g);
    if (errorMatches) {
      console.log(`\n📊 剩余错误数: ${errorMatches.length}个`);

      // 显示前10个错误类型
      const errorTypes = {};
      errorOutput.split('\n').forEach(line => {
        const match = line.match(/error TS(\d+):/);
        if (match) {
          errorTypes[match[1]] = (errorTypes[match[1]] || 0) + 1;
        }
      });

      console.log('\n📋 错误类型分布:');
      Object.entries(errorTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([code, count]) => {
          console.log(`   TS${code}: ${count}个`);
        });
    }
  }
});

compileProcess.on('error', (error) => {
  console.error('\n❌ 编译过程出错:', error.message);
});

module.exports = {
  batchFixCompileErrors
};