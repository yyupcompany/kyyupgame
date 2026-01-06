/**
 * 添加用量中心权限配置
 * 为管理员和园长角色添加用量中心菜单权限
 */

import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

async function addUsageCenterPermission() {
  console.log('🚀 开始添加用量中心权限配置...\n');

  try {
    // 1. 查找或创建系统管理分类
    let systemCategory = await sequelize.query(
      `SELECT * FROM permissions WHERE code = 'SYSTEM_CATEGORY' AND type = 'category' LIMIT 1`,
      { type: QueryTypes.SELECT }
    ) as any[];

    let systemCategoryId: number;

    if (systemCategory.length === 0) {
      console.log('📁 创建系统管理分类...');
      const result = await sequelize.query(
        `INSERT INTO permissions (name, chinese_name, code, type, path, icon, sort, status, created_at, updated_at)
         VALUES ('System Management', '系统管理', 'SYSTEM_CATEGORY', 'category', '#system', 'setting', 900, 1, NOW(), NOW())`,
        { type: QueryTypes.INSERT }
      );
      systemCategoryId = result[0] as number;
      console.log(`✅ 系统管理分类创建成功，ID: ${systemCategoryId}\n`);
    } else {
      systemCategoryId = systemCategory[0].id;
      console.log(`✅ 系统管理分类已存在，ID: ${systemCategoryId}\n`);
    }

    // 2. 检查用量中心权限是否已存在
    const existingPermission = await sequelize.query(
      `SELECT * FROM permissions WHERE code = 'USAGE_CENTER' LIMIT 1`,
      { type: QueryTypes.SELECT }
    ) as any[];

    let usageCenterId: number;

    if (existingPermission.length === 0) {
      console.log('📊 创建用量中心权限...');
      const result = await sequelize.query(
        `INSERT INTO permissions (name, chinese_name, code, type, path, component, file_path, icon, sort, parent_id, status, created_at, updated_at)
         VALUES ('Usage Center', '用量中心', 'USAGE_CENTER', 'menu', '/usage-center', 'pages/usage-center/index.vue', 'pages/usage-center/index.vue', 'data-analysis', 910, ?, 1, NOW(), NOW())`,
        { 
          replacements: [systemCategoryId],
          type: QueryTypes.INSERT 
        }
      );
      usageCenterId = result[0] as number;
      console.log(`✅ 用量中心权限创建成功，ID: ${usageCenterId}\n`);
    } else {
      usageCenterId = existingPermission[0].id;
      console.log(`✅ 用量中心权限已存在，ID: ${usageCenterId}\n`);
    }

    // 3. 查找管理员和园长角色（使用code字段）
    const roles = await sequelize.query(
      `SELECT * FROM roles WHERE code IN ('admin', 'principal')`,
      { type: QueryTypes.SELECT }
    ) as any[];

    console.log(`📋 找到 ${roles.length} 个角色需要分配权限\n`);

    // 4. 为每个角色分配权限
    for (const role of roles) {
      // 检查是否已分配系统管理分类权限
      const existingCategoryPermission = await sequelize.query(
        `SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1`,
        {
          replacements: [role.id, systemCategoryId],
          type: QueryTypes.SELECT
        }
      ) as any[];

      if (existingCategoryPermission.length === 0) {
        await sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW())`,
          {
            replacements: [role.id, systemCategoryId],
            type: QueryTypes.INSERT
          }
        );
        console.log(`✅ 为角色 ${role.name} 分配系统管理分类权限`);
      }

      // 检查是否已分配用量中心权限
      const existingUsageCenterPermission = await sequelize.query(
        `SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1`,
        {
          replacements: [role.id, usageCenterId],
          type: QueryTypes.SELECT
        }
      ) as any[];

      if (existingUsageCenterPermission.length === 0) {
        await sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW())`,
          {
            replacements: [role.id, usageCenterId],
            type: QueryTypes.INSERT
          }
        );
        console.log(`✅ 为角色 ${role.name} 分配用量中心权限`);
      } else {
        console.log(`ℹ️  角色 ${role.name} 已有用量中心权限`);
      }
    }

    console.log('\n🎉 用量中心权限配置完成！');
    console.log('\n📊 权限配置摘要:');
    console.log(`   - 系统管理分类 ID: ${systemCategoryId}`);
    console.log(`   - 用量中心权限 ID: ${usageCenterId}`);
    console.log(`   - 已分配角色: ${roles.map(r => r.name).join(', ')}`);
    console.log('\n✅ 管理员和园长现在可以在侧边栏看到"用量中心"菜单项');

  } catch (error) {
    console.error('❌ 添加用量中心权限失败:', error);
    throw error;
  }
}

// 执行脚本
if (require.main === module) {
  addUsageCenterPermission()
    .then(() => {
      console.log('\n✅ 脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { addUsageCenterPermission };

