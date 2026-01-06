const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function comprehensiveDashboardCheck() {
  console.log('='.repeat(80));
  console.log('🔍 仪表板模块完整三方对齐检查开始');
  console.log('='.repeat(80));
  
  const report = {
    frontendFiles: [],
    permissions: [],
    apiRoutes: [],
    issues: [],
    fixes: []
  };

  // 1. 检查前端页面文件
  console.log('\n📁 1. 检查前端仪表板页面文件...');
  const frontendBasePath = '/home/devbox/project/client/src/pages/dashboard';
  
  const expectedFiles = [
    'index.vue',           // 主仪表板
    'DataStatistics.vue',  // 数据统计
    'CampusOverview.vue',  // 园区概览
    'ClassList.vue',       // 班级列表
    'Schedule.vue',        // 日程管理
    'Analytics.vue',       // 分析
    'ImportantNotices.vue',// 重要通知
    'Performance.vue'      // 绩效管理
  ];

  for (const file of expectedFiles) {
    const filePath = path.join(frontendBasePath, file);
    try {
      const stats = fs.statSync(filePath);
      const size = stats.size;
      report.frontendFiles.push({
        name: file,
        path: filePath,
        exists: true,
        size: size,
        status: size > 100 ? '✅ 正常' : '⚠️ 文件过小',
        lastModified: stats.mtime
      });
      
      // 简单检查文件内容
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!content.includes('<template>') || !content.includes('<script')) {
        report.issues.push(`❌ ${file}: Vue组件结构不完整`);
      } else if (content.length < 500) {
        report.issues.push(`⚠️ ${file}: 文件内容可能不完整 (${content.length} chars)`);
      } else {
        console.log(`✅ ${file}: 存在且结构完整 (${Math.round(size/1024)}KB)`);
      }
    } catch (error) {
      report.frontendFiles.push({
        name: file,
        path: filePath,
        exists: false,
        status: '❌ 缺失',
        error: error.message
      });
      report.issues.push(`❌ ${file}: 文件缺失`);
    }
  }

  // 2. 检查数据库权限配置
  console.log('\n🔐 2. 检查数据库权限配置...');
  try {
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      database: 'kargerdensales',
      user: 'root',
      password: 'pwk5ls7j'
    });

    const [permissions] = await connection.execute(`
      SELECT id, name, path, component, type, status, created_at 
      FROM permissions 
      WHERE name LIKE '%仪表%' OR name LIKE '%dashboard%' OR path LIKE '%dashboard%'
      OR name IN ('数据统计', '园区概览', '园长仪表盘', '主仪表板', '重要通知', '日程管理')
      ORDER BY id
    `);

    let enabledCount = 0;
    let disabledCount = 0;

    permissions.forEach(perm => {
      const status = perm.status === 1 ? 'enabled' : 'disabled';
      if (status === 'enabled') enabledCount++;
      else disabledCount++;
      
      report.permissions.push({
        id: perm.id,
        name: perm.name,
        path: perm.path,
        component: perm.component,
        type: perm.type,
        status: status,
        statusDisplay: perm.status === 1 ? '✅ 启用' : '❌ 禁用'
      });

      console.log(`${perm.status === 1 ? '✅' : '❌'} ${perm.name} (${perm.path})`);
      
      // 检查路径匹配
      if (perm.path && perm.component && perm.component.includes('dashboard')) {
        const expectedPath = perm.component
          .replace('pages/', '/')
          .replace('.vue', '')
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace('/-', '/');
        
        if (perm.path !== expectedPath && !perm.path.startsWith('/dashboard')) {
          report.issues.push(`⚠️ 权限路径可能不匹配: ${perm.name} - ${perm.path} vs ${expectedPath}`);
        }
      }
    });

    console.log(`📊 权限统计: 启用 ${enabledCount}, 禁用 ${disabledCount}, 总计 ${permissions.length}`);
    await connection.end();

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    report.issues.push(`❌ 数据库权限检查失败: ${error.message}`);
  }

  // 3. 检查后端API路由
  console.log('\n🔧 3. 检查后端API路由配置...');
  const routeFilePath = '/home/devbox/project/server/src/routes/dashboard.routes.ts';
  
  try {
    const routeContent = fs.readFileSync(routeFilePath, 'utf-8');
    
    const requiredEndpoints = [
      { path: '/overview', description: '仪表板概览' },
      { path: '/stats', description: '统计数据' },
      { path: '/data-statistics', description: '数据统计' },
      { path: '/campus-overview', description: '校园概览' },
      { path: '/todos', description: '待办事项' },
      { path: '/schedules', description: '日程安排' },
      { path: '/charts', description: '图表数据' },
      { path: '/activities', description: '活动数据' }
    ];

    for (const endpoint of requiredEndpoints) {
      if (routeContent.includes(`router.get('${endpoint.path}'`)) {
        report.apiRoutes.push({
          path: endpoint.path,
          description: endpoint.description,
          exists: true,
          status: '✅ 存在'
        });
        console.log(`✅ API路由: ${endpoint.path} - ${endpoint.description}`);
      } else {
        report.apiRoutes.push({
          path: endpoint.path,
          description: endpoint.description,
          exists: false,
          status: '❌ 缺失'
        });
        report.issues.push(`❌ API路由缺失: ${endpoint.path} - ${endpoint.description}`);
      }
    }

  } catch (error) {
    console.error('❌ 读取路由文件失败:', error.message);
    report.issues.push(`❌ 路由文件检查失败: ${error.message}`);
  }

  // 4. 检查控制器文件
  console.log('\n🎮 4. 检查控制器文件...');
  const controllerFilePath = '/home/devbox/project/server/src/controllers/dashboard.controller.ts';
  
  try {
    const controllerContent = fs.readFileSync(controllerFilePath, 'utf-8');
    
    const requiredMethods = [
      'getDashboardStats',
      'getTodos',
      'getSchedules',
      'getDataStatistics',
      'getCampusOverview',
      'getActivityData'
    ];

    for (const method of requiredMethods) {
      if (controllerContent.includes(`${method} = async`) || controllerContent.includes(`${method}(`)) {
        console.log(`✅ 控制器方法: ${method}`);
      } else {
        report.issues.push(`❌ 控制器方法缺失: ${method}`);
      }
    }

  } catch (error) {
    console.error('❌ 读取控制器文件失败:', error.message);
    report.issues.push(`❌ 控制器文件检查失败: ${error.message}`);
  }

  // 5. 生成检查报告
  console.log('\n' + '='.repeat(80));
  console.log('📋 仪表板模块检查报告');
  console.log('='.repeat(80));
  
  console.log('\n📁 前端页面文件检查结果:');
  report.frontendFiles.forEach(file => {
    console.log(`   ${file.status} ${file.name}`);
  });

  console.log(`\n🔐 数据库权限检查结果: ${report.permissions.length} 项`);
  const enabledPerms = report.permissions.filter(p => p.status === 'enabled').length;
  const disabledPerms = report.permissions.filter(p => p.status === 'disabled').length;
  console.log(`   ✅ 启用: ${enabledPerms} 项`);
  console.log(`   ❌ 禁用: ${disabledPerms} 项`);

  console.log(`\n🔧 API路由检查结果: ${report.apiRoutes.length} 个端点`);
  const existingRoutes = report.apiRoutes.filter(r => r.exists).length;
  const missingRoutes = report.apiRoutes.filter(r => !r.exists).length;
  console.log(`   ✅ 存在: ${existingRoutes} 个`);
  console.log(`   ❌ 缺失: ${missingRoutes} 个`);

  console.log(`\n❌ 发现的问题 (${report.issues.length} 项):`);
  if (report.issues.length === 0) {
    console.log('   🎉 未发现问题！');
  } else {
    report.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }

  // 6. 评估整体状态
  const totalChecks = report.frontendFiles.length + report.permissions.length + report.apiRoutes.length;
  const passedChecks = report.frontendFiles.filter(f => f.exists).length + 
                      report.permissions.filter(p => p.status === 'enabled').length + 
                      report.apiRoutes.filter(r => r.exists).length;
  
  const completionRate = Math.round((passedChecks / totalChecks) * 100);
  
  let grade = 'C';
  if (completionRate >= 95) grade = 'A+';
  else if (completionRate >= 90) grade = 'A';
  else if (completionRate >= 85) grade = 'B+';
  else if (completionRate >= 80) grade = 'B';
  else if (completionRate >= 75) grade = 'B-';

  console.log('\n' + '='.repeat(80));
  console.log('🏆 仪表板模块整体评估');
  console.log('='.repeat(80));
  console.log(`📊 完成度: ${completionRate}%`);
  console.log(`🎯 评级: ${grade}`);
  console.log(`✅ 通过检查: ${passedChecks}/${totalChecks}`);
  console.log(`❌ 存在问题: ${report.issues.length} 项`);
  
  if (completionRate >= 90) {
    console.log('🎉 仪表板模块状态良好！');
  } else if (completionRate >= 75) {
    console.log('⚠️ 仪表板模块基本可用，建议修复发现的问题。');
  } else {
    console.log('❌ 仪表板模块存在重要问题，需要立即修复。');
  }

  console.log('\n📝 检查完成时间:', new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(80));

  return {
    completionRate,
    grade,
    totalChecks,
    passedChecks,
    issues: report.issues,
    report
  };
}

// 执行检查
comprehensiveDashboardCheck().catch(console.error);