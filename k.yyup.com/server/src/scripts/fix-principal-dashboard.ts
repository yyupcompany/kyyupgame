import { sequelize } from '../config/database';

/**
 * 修复园长仪表板页面404问题
 * 按照标准流程手动添加权限配置
 */
async function fixPrincipalDashboard() {
  try {
    console.log('🔧 开始修复园长仪表板页面权限...');

    // 1. 检查权限是否已存在
    const [existingPermissions] = await sequelize.query(`
      SELECT id, name, code, path FROM permissions 
      WHERE code = 'principal-dashboard' OR path = '/principal/PrincipalDashboard'
    `);

    if (existingPermissions.length > 0) {
      console.log('ℹ️  权限已存在:', existingPermissions);
      return;
    }

    // 2. 添加园长仪表板权限
    console.log('📝 添加园长仪表板权限...');
    await sequelize.query(`
      INSERT INTO permissions (
        name, 
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
        '园长仪表板', 
        'principal-dashboard', 
        'menu', 
        NULL, 
        '/principal/PrincipalDashboard', 
        'pages/principal/Dashboard.vue', 
        'PRINCIPAL_DASHBOARD_VIEW', 
        'Monitor', 
        10, 
        1,
        NOW(),
        NOW()
      )
    `);

    // 3. 获取新添加的权限ID
    const [newPermission] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'principal-dashboard'
    `);

    if (newPermission.length === 0) {
      throw new Error('权限添加失败');
    }

    const permissionId = (newPermission[0] as any).id;
    console.log('✅ 权限添加成功，ID:', permissionId);

    // 4. 获取admin角色ID
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin'
    `);

    if (adminRole.length === 0) {
      console.log('⚠️  未找到admin角色');
      return;
    }

    const adminRoleId = (adminRole[0] as any).id;

    // 5. 为admin角色分配权限
    console.log('🔐 为admin角色分配权限...');
    await sequelize.query(`
      INSERT IGNORE INTO role_permissions (
        role_id, 
        permission_id, 
        created_at, 
        updated_at
      ) VALUES (
        ${adminRoleId}, 
        ${permissionId}, 
        NOW(), 
        NOW()
      )
    `);

    // 6. 检查园长角色是否存在并分配权限
    const [principalRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'principal'
    `);

    if (principalRole.length > 0) {
      const principalRoleId = (principalRole[0] as any).id;
      console.log('🔐 为园长角色分配权限...');
      await sequelize.query(`
        INSERT IGNORE INTO role_permissions (
          role_id, 
          permission_id, 
          created_at, 
          updated_at
        ) VALUES (
          ${principalRoleId}, 
          ${permissionId}, 
          NOW(), 
          NOW()
        )
      `);
    }

    // 7. 验证修复结果
    console.log('🔍 验证修复结果...');
    const [verifyPermissions] = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.code,
        p.path,
        p.component
      FROM permissions p 
      WHERE p.code = 'principal-dashboard'
    `);

    const [verifyRolePermissions] = await sequelize.query(`
      SELECT 
        r.name as role_name,
        p.name as permission_name,
        p.path as permission_path
      FROM roles r
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.code = 'principal-dashboard'
    `);

    console.log('📋 权限配置:');
    console.table(verifyPermissions);

    console.log('🔐 角色权限分配:');
    console.table(verifyRolePermissions);

    console.log('✅ 园长仪表板权限修复完成！');
    console.log('💡 请重启应用并访问: http://localhost:5173/principal/PrincipalDashboard');

  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixPrincipalDashboard()
    .then(() => {
      console.log('🎉 修复脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 修复脚本执行失败:', error);
      process.exit(1);
    });
}

export { fixPrincipalDashboard };
