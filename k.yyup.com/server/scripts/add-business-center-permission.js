/**
 * 添加业务中心权限脚本
 * 为管理员和园长角色添加业务中心访问权限
 */

const { Sequelize, QueryTypes } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'kindergarten_management',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function addBusinessCenterPermission() {
  try {
    console.log('🚀 开始添加业务中心权限...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 1. 添加业务中心权限（如果不存在）
    console.log('📋 添加业务中心权限...');
    
    const [insertResult] = await sequelize.query(`
      INSERT IGNORE INTO permissions (
        name, 
        chinese_name, 
        code, 
        type, 
        parent_id, 
        path, 
        component, 
        permission, 
        icon, 
        sort, 
        status, 
        created_at, 
        updated_at
      ) VALUES (
        'Business Center', 
        '业务中心', 
        'BUSINESS_CENTER_VIEW', 
        'menu', 
        NULL, 
        '/centers/business', 
        'pages/centers/BusinessCenter.vue', 
        'business:center:view', 
        'Briefcase', 
        15, 
        1, 
        NOW(), 
        NOW()
      )
    `, { type: QueryTypes.INSERT });

    console.log('✅ 业务中心权限添加完成');

    // 2. 获取权限ID
    const [permissions] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'BUSINESS_CENTER_VIEW' LIMIT 1
    `, { type: QueryTypes.SELECT });

    if (!permissions || permissions.length === 0) {
      throw new Error('❌ 未找到业务中心权限');
    }

    const permissionId = permissions[0].id;
    console.log(`📋 业务中心权限ID: ${permissionId}`);

    // 3. 获取管理员和园长角色ID
    const [roles] = await sequelize.query(`
      SELECT id, code, name FROM roles 
      WHERE code IN ('admin', 'principal') 
      OR name IN ('admin', 'principal', '管理员', '园长')
    `, { type: QueryTypes.SELECT });

    console.log(`👥 找到角色: ${roles.length}个`);
    roles.forEach(role => {
      console.log(`  - ${role.name} (${role.code}): ID ${role.id}`);
    });

    // 4. 为每个角色分配权限
    let assignedCount = 0;
    for (const role of roles) {
      try {
        await sequelize.query(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, {
          replacements: [role.id, permissionId],
          type: QueryTypes.INSERT
        });

        console.log(`✅ 为角色 ${role.name} 分配业务中心权限`);
        assignedCount++;
      } catch (error) {
        console.log(`⚠️ 角色 ${role.name} 权限分配失败或已存在:`, error.message);
      }
    }

    // 5. 验证权限分配结果
    console.log('\n📊 验证权限分配结果...');
    const [rolePermissions] = await sequelize.query(`
      SELECT 
        r.name as role_name,
        r.code as role_code,
        p.name as permission_name,
        p.code as permission_code,
        p.path as permission_path,
        rp.created_at
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.code = 'BUSINESS_CENTER_VIEW'
      ORDER BY r.name
    `, { type: QueryTypes.SELECT });

    console.log('\n🎯 权限分配结果:');
    if (rolePermissions && rolePermissions.length > 0) {
      rolePermissions.forEach(rp => {
        console.log(`  ✅ ${rp.role_name} -> ${rp.permission_name} (${rp.permission_path})`);
      });
    } else {
      console.log('  ❌ 未找到权限分配记录');
    }

    // 6. 输出总结
    console.log('\n🎉 业务中心权限配置完成！');
    console.log(`📋 权限ID: ${permissionId}`);
    console.log(`👥 分配给 ${assignedCount} 个角色`);
    console.log(`🔗 访问路径: /centers/business`);
    console.log(`📄 组件路径: pages/centers/BusinessCenter.vue`);

  } catch (error) {
    console.error('❌ 添加业务中心权限失败:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    await sequelize.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行脚本
if (require.main === module) {
  addBusinessCenterPermission()
    .then(() => {
      console.log('✅ 脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { addBusinessCenterPermission };
