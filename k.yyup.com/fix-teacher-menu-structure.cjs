/**
 * 修复教师菜单结构
 * 确保所有TEACHER_权限有正确的parent_id和type设置
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT) || 43906,
    dialect: 'mysql',
    logging: false
  }
);

async function fixTeacherMenuStructure() {
  try {
    console.log('🔧 开始修复教师菜单结构...\n');

    // 1. 查找TEACHER_DASHBOARD_DIRECTORY (主分类)
    const [parentResults] = await sequelize.query(`
      SELECT id, name, chinese_name, code FROM permissions
      WHERE code = 'TEACHER_DASHBOARD_DIRECTORY' AND deleted_at IS NULL
    `);

    if (parentResults.length === 0) {
      console.log('❌ 未找到TEACHER_DASHBOARD_DIRECTORY');
      return;
    }

    const parentId = parentResults[0].id;
    console.log(`✅ 找到主分类 TEACHER_DASHBOARD_DIRECTORY，ID: ${parentId}`);

    // 2. 查找所有需要修复的TEACHER_权限（排除主分类）
    const [teacherPermissions] = await sequelize.query(`
      SELECT id, code, name, chinese_name, path, component, icon, sort, type, parent_id
      FROM permissions
      WHERE code LIKE 'TEACHER_%'
      AND code != 'TEACHER_DASHBOARD_DIRECTORY'
      AND deleted_at IS NULL
      ORDER BY sort ASC
    `);

    console.log(`\n📋 找到 ${teacherPermissions.length} 个需要修复的TEACHER_权限:`);

    // 3. 修复每个权限
    let fixedCount = 0;
    for (const perm of teacherPermissions) {
      console.log(`\n修复权限: ${perm.code} (${perm.chinese_name || perm.name})`);

      // 确保type为'menu'
      if (perm.type !== 'menu') {
        await sequelize.query(`
          UPDATE permissions SET type = 'menu', updated_at = NOW()
          WHERE id = :id
        `, {
          replacements: { id: perm.id }
        });
        console.log(`  ✅ 修复type: ${perm.type} -> menu`);
        fixedCount++;
      }

      // 确保parent_id正确
      if (perm.parent_id !== parentId) {
        await sequelize.query(`
          UPDATE permissions SET parent_id = :parentId, updated_at = NOW()
          WHERE id = :id
        `, {
          replacements: { id: perm.id, parentId }
        });
        console.log(`  ✅ 修复parent_id: ${perm.parent_id} -> ${parentId}`);
        fixedCount++;
      }
    }

    // 4. 验证修复结果
    const [verifyResults] = await sequelize.query(`
      SELECT code, chinese_name, type, parent_id
      FROM permissions
      WHERE code LIKE 'TEACHER_%' AND deleted_at IS NULL
      ORDER BY sort ASC
    `);

    console.log('\n📊 修复结果验证:');
    verifyResults.forEach(perm => {
      const parentType = perm.parent_id ? `子菜单(父ID:${perm.parent_id})` : '主分类';
      console.log(`  ${perm.code}: ${perm.chinese_name || '无名称'} - type:${perm.type} - ${parentType}`);
    });

    console.log(`\n🎉 修复完成！共修复了 ${fixedCount} 个字段`);

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await sequelize.close();
  }
}

fixTeacherMenuStructure();