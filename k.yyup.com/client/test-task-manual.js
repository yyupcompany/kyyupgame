/**
 * 任务中心页面手动错误检测脚本
 */

const fs = require('fs');

console.log('═══════════════════════════════════════════════════════════');
console.log('📊 任务中心页面代码分析报告');
console.log('═══════════════════════════════════════════════════════════\n');

// 分析前端组件
console.log('📁 前端组件分析:\n');

const vueFilePath = '/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers/TaskCenter.vue';
if (fs.existsSync(vueFilePath)) {
  const content = fs.readFileSync(vueFilePath, 'utf-8');
  
  console.log('✅ TaskCenter.vue 文件存在\n');
  
  // 检查导入
  const imports = content.match(/import .+ from/g) || [];
  console.log(`📦 导入语句: ${imports.length}个`);
  
  // 检查API调用
  const apiCalls = content.match(/getTasks|getTask|createTask|updateTask|deleteTask|getTaskStatistics/g) || [];
  console.log(`📡 API调用: ${apiCalls.length}个`);
  
  // 检查组件使用
  const components = content.match(/<[A-Z][a-zA-Z]+/g) || [];
  console.log(`🧩 组件使用: ${components.length}个\n`);
} else {
  console.log('❌ TaskCenter.vue 文件不存在\n');
}

// 检查API文件
console.log('📡 API文件分析:\n');

const apiFilePath = '/home/zhgue/kyyupgame/k.yyup.com/client/src/api/task-center.ts';
if (fs.existsSync(apiFilePath)) {
  const apiContent = fs.readFileSync(apiFilePath, 'utf-8');
  console.log('✅ task-center.ts 文件存在\n');
  
  // 检查API端点
  const endpoints = apiContent.match(/request\.(get|post|put|del)\(/g) || [];
  console.log(`🌐 API端点定义: ${endpoints.length}个`);
  
  // 提取API路径
  const paths = apiContent.match(/'\/api\/[^']+'/g) || [];
  console.log(`📋 API路径: ${paths.length}个`);
  paths.forEach(path => console.log(`   - ${path.replace(/'/g, '')}`));
} else {
  console.log('❌ task-center.ts 文件不存在\n');
}

// 检查后端路由
console.log('\n🔧 后端路由分析:\n');

const routeFilePath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/task.routes.ts';
if (fs.existsSync(routeFilePath)) {
  const routeContent = fs.readFileSync(routeFilePath, 'utf-8');
  console.log('✅ task.routes.ts 文件存在\n');
  
  // 检查路由定义
  const routes = routeContent.match(/router\.(get|post|put|delete)\(/g) || [];
  console.log(`🛣️  路由定义: ${routes.length}个`);
  
  // 检查控制器方法
  const controllerMethods = routeContent.match(/taskController\.[a-zA-Z]+/g) || [];
  console.log(`🎮 控制器方法: ${controllerMethods.length}个`);
  controllerMethods.forEach(method => console.log(`   - ${method}`));
} else {
  console.log('❌ task.routes.ts 文件不存在\n');
}

// 检查路由注册
console.log('\n📋 路由注册分析:\n');

const otherIndexPath = '/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/other/index.ts';
if (fs.existsSync(otherIndexPath)) {
  const otherContent = fs.readFileSync(otherIndexPath, 'utf-8');
  
  if (otherContent.includes("router.use('/tasks'")) {
    console.log("✅ 任务路由已正确注册: /api/tasks");
  } else {
    console.log("❌ 任务路由未注册");
  }
}

// 潜在问题分析
console.log('\n⚠️  潜在问题分析:\n');

// 检查是否有硬编码的用户ID
if (fs.existsSync(apiFilePath)) {
  const apiContent = fs.readFileSync(apiFilePath, 'utf-8');
  if (apiContent.includes('121')) {
    console.log('❌ 发现硬编码的用户ID (121) 在 task-center.ts 中');
    console.log('   建议: 应该从用户store中获取当前登录用户ID\n');
  }
}

// 检查API路径一致性
if (fs.existsSync(apiFilePath) && fs.existsSync(routeFilePath)) {
  const apiContent = fs.readFileSync(apiFilePath, 'utf-8');
  const routeContent = fs.readFileSync(routeFilePath, 'utf-8');
  
  // 前端API路径
  const frontendPaths = apiContent.match(/'\/api\/[^']+'/g) || [];
  const frontendPathSet = new Set(frontendPaths.map(p => p.replace(/'/g, '')));
  
  // 后端路由路径
  const backendPaths = routeContent.match(/'\/[^']+'/g) || [];
  const backendPathSet = new Set(backendPaths.map(p => p.replace(/'/g, '')));
  
  console.log('📊 前后端路径对比:');
  console.log(`   前端定义: ${frontendPathSet.size}个`);
  console.log(`   后端定义: ${backendPathSet.size}个`);
  
  // 检查路径前缀
  const hasApiPrefix = Array.from(frontendPathSet).every(p => p.startsWith('/api/'));
  if (hasApiPrefix) {
    console.log('✅ 前端API路径都包含 /api 前缀');
  } else {
    console.log('⚠️  部分前端API路径缺少 /api 前缀');
  }
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ 代码分析完成');
console.log('═══════════════════════════════════════════════════════════\n');
