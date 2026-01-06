/**
 * 分配呼叫中心权限给admin角色
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Yyup@2024',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function assignCallCenterPermissions() {
  try {
    console.log('🔍 开始分配呼叫中心权限给admin角色...\n');

    // 1. 查找admin角色
    const [adminRoles] = await sequelize.query(`
      SELECT id, name, code FROM roles WHERE code = 'admin' LIMIT 1
    `);

    if (!adminRoles || adminRoles.length === 0) {
      console.error('❌ 未找到admin角色');
      return;
    }

    const adminRole = adminRoles[0];
    console.log(`✅ 找到admin角色: ID=${adminRole.id}, Name=${adminRole.name}\n`);

    // 2. 查找所有呼叫中心权限
    const [callCenterPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, parent_id
      FROM permissions
      WHERE code = 'CALL_CENTER' OR code LIKE 'call_center_%'
      ORDER BY id
    `);

    if (!callCenterPermissions || callCenterPermissions.length === 0) {
      console.error('❌ 未找到呼叫中心权限');
      return;
    }

    console.log(`✅ 找到${callCenterPermissions.length}个呼叫中心权限:\n`);
    callCenterPermissions.forEach(p => {
      console.log(`   - ${p.chinese_name || p.name} (${p.code}) - ID: ${p.id}, Type: ${p.type}`);
    });
    console.log('');

    // 3. 检查哪些权限已经分配
    const permissionIds = callCenterPermissions.map(p => p.id);
    const [existingAssignments] = await sequelize.query(`
      SELECT permission_id
      FROM role_permissions
      WHERE role_id = ${adminRole.id}
        AND permission_id IN (${permissionIds.join(',')})
    `);

    const existingPermissionIds = existingAssignments.map(a => a.permission_id);
    console.log(`🔍 已分配的权限: ${existingPermissionIds.length}个\n`);

    // 4. 分配未分配的权限
    let assignedCount = 0;
    for (const permission of callCenterPermissions) {
      if (existingPermissionIds.includes(permission.id)) {
        console.log(`⏭️  跳过已分配: ${permission.chinese_name || permission.name}`);
        continue;
      }

      await sequelize.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (${adminRole.id}, ${permission.id}, NOW(), NOW())
      `);

      console.log(`✅ 已分配: ${permission.chinese_name || permission.name} (${permission.code})`);
      assignedCount++;
    }

    console.log(`\n🎉 分配完成！新分配了${assignedCount}个权限\n`);

    // 5. 验证分配结果
    const [finalCheck] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM role_permissions
      WHERE role_id = ${adminRole.id}
        AND permission_id IN (${permissionIds.join(',')})
    `);

    console.log(`✅ 验证: admin角色现在有${finalCheck[0].count}个呼叫中心权限\n`);

    // 6. 显示admin角色的所有权限统计
    const [totalPermissions] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM role_permissions
      WHERE role_id = ${adminRole.id}
    `);

    console.log(`📊 admin角色权限总数: ${totalPermissions[0].count}\n`);

  } catch (error) {
    console.error('❌ 分配权限失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
assignCallCenterPermissions();

