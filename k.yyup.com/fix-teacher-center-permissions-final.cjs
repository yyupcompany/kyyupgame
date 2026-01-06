const { Sequelize, QueryTypes } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function fixTeacherCenterPermissions() {
  try {
    console.log('🔧 开始修复教师中心权限问题...');
    
    // 1. 查找教师角色
    const teacherRole = await sequelize.query(`
      SELECT id, name, code FROM roles WHERE code = 'teacher' LIMIT 1
    `, { type: QueryTypes.SELECT });
    
    if (teacherRole.length === 0) {
      console.log('❌ 未找到教师角色');
      return;
    }
    
    const teacherRoleId = teacherRole[0].id;
    console.log(`✅ 找到教师角色: ${teacherRole[0].name} (ID: ${teacherRoleId})`);
    
    // 2. 定义需要添加的教师中心权限
    const teacherCenterPermissions = [
      // 教师中心主页面
      {
        name: '教师中心',
        code: 'TEACHER_CENTER_MAIN',
        type: 'menu',
        path: '/teacher-center',
        component: 'teacher-center/index',
        permission: 'teacher:center:view',
        icon: 'User',
        sort: 100,
        status: 1
      },
      
      // 教师工作台
      {
        name: '教师工作台',
        code: 'TEACHER_CENTER_DASHBOARD',
        type: 'menu',
        path: '/teacher-center/dashboard',
        component: 'teacher-center/dashboard/index',
        permission: 'teacher:dashboard:view',
        icon: 'Monitor',
        sort: 101,
        status: 1
      },
      
      // 任务中心
      {
        name: '任务中心',
        code: 'TEACHER_CENTER_TASKS',
        type: 'menu',
        path: '/teacher-center/tasks',
        component: 'teacher-center/tasks/index',
        permission: 'teacher:tasks:view',
        icon: 'List',
        sort: 102,
        status: 1
      },
      
      // 通知中心
      {
        name: '通知中心',
        code: 'TEACHER_CENTER_NOTIFICATIONS',
        type: 'menu',
        path: '/teacher-center/notifications',
        component: 'teacher-center/notifications/index',
        permission: 'teacher:notifications:view',
        icon: 'Bell',
        sort: 103,
        status: 1
      },
      
      // 活动中心
      {
        name: '活动中心',
        code: 'TEACHER_CENTER_ACTIVITIES',
        type: 'menu',
        path: '/teacher-center/activities',
        component: 'teacher-center/activities/index',
        permission: 'teacher:activities:view',
        icon: 'Calendar',
        sort: 104,
        status: 1
      },
      
      // 招生中心
      {
        name: '招生中心',
        code: 'TEACHER_CENTER_ENROLLMENT',
        type: 'menu',
        path: '/teacher-center/enrollment',
        component: 'teacher-center/enrollment/index',
        permission: 'teacher:enrollment:view',
        icon: 'UserPlus',
        sort: 105,
        status: 1
      },
      
      // 教学中心
      {
        name: '教学中心',
        code: 'TEACHER_CENTER_TEACHING',
        type: 'menu',
        path: '/teacher-center/teaching',
        component: 'teacher-center/teaching/index',
        permission: 'teacher:teaching:view',
        icon: 'Reading',
        sort: 106,
        status: 1
      },
      
      // 客户跟踪
      {
        name: '客户跟踪',
        code: 'TEACHER_CENTER_CUSTOMER_TRACKING',
        type: 'menu',
        path: '/teacher-center/customer-tracking',
        component: 'teacher-center/customer-tracking/index',
        permission: 'teacher:customer-tracking:view',
        icon: 'Connection',
        sort: 107,
        status: 1
      }
    ];
    
    console.log(`\n📝 准备添加 ${teacherCenterPermissions.length} 个教师中心权限...`);
    
    let addedCount = 0;
    let existingCount = 0;
    
    // 3. 添加权限到数据库
    for (const perm of teacherCenterPermissions) {
      // 检查权限是否已存在
      const existingPerm = await sequelize.query(`
        SELECT id FROM permissions WHERE code = ? OR path = ?
      `, { 
        replacements: [perm.code, perm.path],
        type: QueryTypes.SELECT 
      });
      
      let permissionId;
      
      if (existingPerm.length > 0) {
        permissionId = existingPerm[0].id;
        console.log(`⚠️  权限已存在: ${perm.name} (ID: ${permissionId})`);
        existingCount++;
      } else {
        // 插入新权限
        const [result] = await sequelize.query(`
          INSERT INTO permissions (name, code, type, path, component, permission, icon, sort, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, { 
          replacements: [
            perm.name, perm.code, perm.type, perm.path, 
            perm.component, perm.permission, perm.icon, 
            perm.sort, perm.status
          ]
        });
        
        permissionId = result.insertId;
        console.log(`✅ 新增权限: ${perm.name} (ID: ${permissionId})`);
        addedCount++;
      }
      
      // 4. 分配权限给教师角色
      const existingRolePermission = await sequelize.query(`
        SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?
      `, { 
        replacements: [teacherRoleId, permissionId],
        type: QueryTypes.SELECT 
      });
      
      if (existingRolePermission.length === 0) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, { 
          replacements: [teacherRoleId, permissionId]
        });
        console.log(`🔗 分配权限给教师角色: ${perm.name}`);
      } else {
        console.log(`⚠️  权限已分配给教师角色: ${perm.name}`);
      }
    }
    
    console.log(`\n📊 权限修复统计:`);
    console.log(`- 新增权限: ${addedCount}`);
    console.log(`- 已存在权限: ${existingCount}`);
    console.log(`- 总计权限: ${addedCount + existingCount}`);
    
    // 5. 验证修复结果
    console.log('\n🔍 验证修复结果...');
    const teacherCenterPerms = await sequelize.query(`
      SELECT p.id, p.name, p.code, p.path, p.permission, p.status
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ? AND (
        p.path LIKE '/teacher-center%' OR 
        p.code LIKE 'TEACHER_CENTER%'
      )
      ORDER BY p.sort, p.id
    `, { 
      replacements: [teacherRoleId],
      type: QueryTypes.SELECT 
    });
    
    console.log('\n📋 教师角色的教师中心权限:');
    console.table(teacherCenterPerms);
    
    console.log('\n🎉 教师中心权限修复完成！');
    console.log('📝 请刷新前端页面测试权限是否正常');
    
  } catch (error) {
    console.error('❌ 修复权限失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 运行修复
fixTeacherCenterPermissions();
