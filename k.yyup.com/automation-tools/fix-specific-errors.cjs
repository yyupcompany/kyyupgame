const fs = require('fs');
const path = require('path');

// 修复training.controller.ts的performanceData问题
function fixTrainingController() {
  const filePath = path.join(__dirname, 'server/src/controllers/training.controller.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 修复performanceData未定义的问题
    content = content.replace(/performanceData/g, 'performanceRating');

    // 修复重复属性问题
    content = content.replace(
      /performanceRating: performance[^,]*,\s*performanceRating:/g,
      'performanceRating:'
    );

    // 移除不存在的sessionId属性
    content = content.replace(/sessionId:[^,]*,\s*/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ training.controller.ts - 修复performanceData和重复属性问题');
    return true;
  }
  return false;
}

// 修复auth-middleware.ts的类型问题
function fixAuthMiddleware() {
  const filePath = path.join(__dirname, 'server/src/middleware/auth-middleware.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 修复返回类型问题
    content = content.replace(
      /const handleUnauthorized = \(res: Response\) => \{\s*return res\.status\(401\)\.json/g,
      'const handleUnauthorized = (res: Response): void => {\n    res.status(401).json'
    );

    content = content.replace(
      /const handleForbidden = \(res: Response\) => \{\s*return res\.status\(403\)\.json/g,
      'const handleForbidden = (res: Response): void => {\n    res.status(403).json'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ auth-middleware.ts - 修复返回类型问题');
    return true;
  }
  return false;
}

// 批量修复
batchFixSpecificErrors = () => {
  console.log('🚀 开始修复特定编译错误\n');

  const trainingFixed = fixTrainingController();
  const authFixed = fixAuthMiddleware();

  console.log('\n📊 修复统计:');
  console.log(`   - training.controller.ts: ${trainingFixed ? '已修复' : '无需修复'}`);
  console.log(`   - auth-middleware.ts: ${authFixed ? '已修复' : '无需修复'}`);
};

// 运行修复
batchFixSpecificErrors();