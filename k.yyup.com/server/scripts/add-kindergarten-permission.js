const { Sequelize } = require('sequelize');
const config = require('../src/config/database');

async function addKindergartenPermission() {
  const sequelize = new Sequelize(config.development);

  try {
    console.log('🔍 开始为园长角色添加幼儿园管理权限...');

    // 1. 查找园长角色
    const [principalRoles] = await sequelize.query(
      `SELECT id, name, code FROM roles WHERE code = 'principal' AND deleted_at IS NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!principalRoles) {
      throw new Error('未找到园长角色');
    }

    console.log('✅ 找到园长角色:', principalRoles);

    // 2. 先创建幼儿园管理权限（如果不存在）
    let [kindergartenPermission] = await sequelize.query(
      `SELECT id, name, code FROM permissions WHERE code = 'KINDERGARTEN_MANAGE' AND deleted_at IS NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!kindergartenPermission) {
      console.log('⚠️ 幼儿园管理权限不存在，正在创建...');

      // 创建权限
      await sequelize.query(
        `INSERT INTO permissions (name, chinese_name, code, type, path, component, permission, icon, sort, status, created_at, updated_at)
         VALUES ('幼儿园管理', '幼儿园管理', 'KINDERGARTEN_MANAGE', 'button', '/kindergarten', 'KindergartenManage', 'kindergarten:manage', 'kindergarten', 100, 1, NOW(), NOW())`,
        { type: Sequelize.QueryTypes.INSERT }
      );

      // 重新查询创建的权限
      [kindergartenPermission] = await sequelize.query(
        `SELECT id, name, code FROM permissions WHERE code = 'KINDERGARTEN_MANAGE' AND deleted_at IS NULL`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      console.log('✅ 成功创建幼儿园管理权限:', kindergartenPermission);
    } else {
      console.log('✅ 找到幼儿园管理权限:', kindergartenPermission);
    }
    
    // 3. 检查是否已经存在权限关联
    const [existingPermission] = await sequelize.query(
      `SELECT id FROM role_permissions 
       WHERE role_id = :roleId AND permission_id = :permissionId`,
      {
        replacements: {
          roleId: principalRoles.id,
          permissionId: kindergartenPermission.id
        },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    
    if (existingPermission) {
      console.log('⚠️ 权限关联已存在，无需重复添加');
      return;
    }
    
    // 4. 添加权限关联
    await sequelize.query(
      `INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)
       VALUES (:roleId, :permissionId, 1, NOW(), NOW())`,
      {
        replacements: {
          roleId: principalRoles.id,
          permissionId: kindergartenPermission.id
        },
        type: Sequelize.QueryTypes.INSERT
      }
    );
    
    console.log('✅ 成功为园长角色添加幼儿园管理权限');
    
    // 5. 验证权限添加
    const [verification] = await sequelize.query(
      `SELECT rp.id, r.name as role_name, p.name as permission_name
       FROM role_permissions rp
       JOIN roles r ON rp.role_id = r.id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE r.code = 'principal' AND p.code = 'KINDERGARTEN_MANAGE'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (verification) {
      console.log('✅ 权限验证成功:', verification);
    } else {
      console.log('❌ 权限验证失败');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

addKindergartenPermission();
