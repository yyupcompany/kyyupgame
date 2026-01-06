import mysql from 'mysql2/promise';

async function fixClassPermissions() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('=== 开始修复班级管理权限 ===\n');
    
    // 1. 启用被禁用的重要班级管理权限
    console.log('1. 启用重要的班级管理权限...');
    const importantPermissions = [
      1133, // 班级管理分类
      1134, // ClassAnalytics 班级分析
      1137, // ClassDetail 班级详情
      1140, // ClassOptimization 班级优化
      1141, // SmartManagement 智能管理
    ];
    
    for (const permissionId of importantPermissions) {
      const [result] = await connection.execute(
        'UPDATE permissions SET status = 1, updated_at = NOW() WHERE id = ? AND status = 0',
        [permissionId]
      );
      console.log(`  ✅ 启用权限 ID: ${permissionId} (影响行数: ${result.affectedRows})`);
    }

    // 2. 修复权限路径配置
    console.log('\n2. 修复权限路径配置...');
    
    // 修复班级管理主页面路径
    await connection.execute(`
      UPDATE permissions 
      SET path = '/class', component = 'pages/class/index.vue', updated_at = NOW() 
      WHERE code = 'user:class' AND path != '/class'
    `);
    console.log('  ✅ 修复班级管理主页面路径');

    // 修复班级管理分类路径
    await connection.execute(`
      UPDATE permissions 
      SET path = '/class', status = 1, updated_at = NOW() 
      WHERE code IN ('CLASS_CATEGORY', 'class-management') AND (path != '/class' OR status = 0)
    `);
    console.log('  ✅ 修复班级管理分类路径和状态');

    // 3. 修复组件路径不一致问题
    console.log('\n3. 修复组件路径不一致问题...');
    
    const componentFixes = [
      {
        id: 1139,
        component: 'pages/class/index.vue',
        description: '班级概览主页面'
      },
      {
        id: 1134,
        component: 'pages/class/analytics/ClassAnalytics.vue',
        description: '班级分析页面'
      },
      {
        id: 1137,
        component: 'pages/class/detail/ClassDetail.vue', 
        description: '班级详情页面'
      },
      {
        id: 1140,
        component: 'pages/class/optimization/ClassOptimization.vue',
        description: '班级优化页面'
      },
      {
        id: 1141,
        component: 'pages/class/smart-management/SmartManagement.vue',
        description: '智能管理页面'
      }
    ];
    
    for (const fix of componentFixes) {
      await connection.execute(`
        UPDATE permissions 
        SET component = ?, updated_at = NOW() 
        WHERE id = ?
      `, [fix.component, fix.id]);
      console.log(`  ✅ 修复组件路径: ${fix.description}`);
    }

    // 4. 修复路径规范化
    console.log('\n4. 修复路径规范化...');
    
    const pathFixes = [
      {
        code: 'CLASS_INDEX',
        path: '/class',
        description: '班级管理首页'
      },
      {
        code: 'CLASS_ANALYTICS_CLASSANALYTICS', 
        path: '/class/analytics',
        description: '班级分析'
      },
      {
        code: 'CLASS_DETAIL_CLASSDETAIL',
        path: '/class/detail',
        description: '班级详情'
      },
      {
        code: 'CLASS_OPTIMIZATION_CLASSOPTIMIZATION',
        path: '/class/optimization', 
        description: '班级优化'
      },
      {
        code: 'CLASS_SMART_MANAGEMENT_SMARTMANAGEMENT',
        path: '/class/smart-management',
        description: '智能管理'
      }
    ];
    
    for (const fix of pathFixes) {
      await connection.execute(`
        UPDATE permissions 
        SET path = ?, updated_at = NOW() 
        WHERE code = ?
      `, [fix.path, fix.code]);
      console.log(`  ✅ 修复路径: ${fix.description} -> ${fix.path}`);
    }

    // 5. 检查修复结果
    console.log('\n5. 检查修复结果...');
    
    const [enabledPermissions] = await connection.execute(`
      SELECT id, name, code, path, component, status
      FROM permissions 
      WHERE (name LIKE '%班级%' OR component LIKE '%class%' OR path LIKE '%class%') AND status = 1
      ORDER BY id
    `);
    
    console.log(`✅ 已启用的班级管理权限数量: ${enabledPermissions.length}`);
    
    const [disabledPermissions] = await connection.execute(`
      SELECT id, name, code, path, component, status
      FROM permissions 
      WHERE (name LIKE '%班级%' OR component LIKE '%class%' OR path LIKE '%class%') AND status = 0
      ORDER BY id
    `);
    
    console.log(`⚠️  仍然禁用的班级管理权限数量: ${disabledPermissions.length}`);
    
    if (disabledPermissions.length > 0) {
      console.log('仍然禁用的权限:');
      disabledPermissions.forEach(perm => {
        console.log(`  - ID: ${perm.id}, 名称: ${perm.name}, 路径: ${perm.path}`);
      });
    }

    console.log('\n=== 班级管理权限修复完成 ===');
    
  } catch (error) {
    console.error('修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

fixClassPermissions().catch(console.error);