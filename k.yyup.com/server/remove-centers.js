/**
 * 从数据库中移除指定的中心
 * 移除：智能中心(AI中心)、数据分析中心、督查中心
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function removeCenters() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ 数据库连接成功\n');

    // 定义要移除的中心
    const centersToRemove = [
      {
        id: 3006,
        name: 'AI Center',
        chinese_name: '智能中心',
        code: 'AI_CENTER',
        reason: '用户要求移除'
      },
      {
        id: 3073,
        name: 'Analytics Center',
        chinese_name: '数据分析中心',
        code: 'ANALYTICS_CENTER',
        reason: '用户要求移除'
      },
      {
        id: 5001,
        name: 'Inspection Center',
        chinese_name: '督查中心',
        code: 'INSPECTION_CENTER',
        reason: '用户要求移除'
      }
    ];

    console.log('📋 准备移除以下中心：\n');
    centersToRemove.forEach((center, index) => {
      console.log(`${index + 1}. ID ${center.id}: ${center.chinese_name} (${center.name})`);
      console.log(`   Code: ${center.code}`);
      console.log(`   原因: ${center.reason}\n`);
    });

    // 首先查询这些中心是否有子菜单
    console.log('🔍 检查是否有子菜单...\n');
    for (const center of centersToRemove) {
      const [children] = await connection.execute(
        `SELECT id, name, chinese_name, type, path 
         FROM permissions 
         WHERE parent_id = ? AND status = 1`,
        [center.id]
      );

      if (children.length > 0) {
        console.log(`⚠️  中心 ${center.chinese_name} (ID: ${center.id}) 有 ${children.length} 个子菜单：`);
        console.table(children);
        console.log('');
      } else {
        console.log(`✅ 中心 ${center.chinese_name} (ID: ${center.id}) 没有子菜单\n`);
      }
    }

    console.log('⚠️  即将执行删除操作（设置 status=0）\n');

    // 执行删除（软删除，设置status=0）
    for (const center of centersToRemove) {
      // 先删除子菜单
      const [childResult] = await connection.execute(
        `UPDATE permissions 
         SET status = 0, updated_at = NOW() 
         WHERE parent_id = ?`,
        [center.id]
      );

      if (childResult.affectedRows > 0) {
        console.log(`✅ 已禁用 ${center.chinese_name} 的 ${childResult.affectedRows} 个子菜单`);
      }

      // 删除中心本身
      const [result] = await connection.execute(
        `UPDATE permissions 
         SET status = 0, updated_at = NOW() 
         WHERE id = ?`,
        [center.id]
      );

      if (result.affectedRows > 0) {
        console.log(`✅ 已禁用中心: ${center.chinese_name} (ID: ${center.id})`);
      } else {
        console.log(`⚠️  中心 ${center.chinese_name} (ID: ${center.id}) 未找到或已禁用`);
      }
      console.log('');
    }

    // 同时删除相关的角色权限关联
    console.log('🔍 删除相关的角色权限关联...\n');
    const centerIds = centersToRemove.map(c => c.id).join(',');
    
    const [rolePermResult] = await connection.execute(
      `DELETE FROM role_permissions 
       WHERE permission_id IN (${centerIds})`
    );

    if (rolePermResult.affectedRows > 0) {
      console.log(`✅ 已删除 ${rolePermResult.affectedRows} 条角色权限关联记录\n`);
    } else {
      console.log(`ℹ️  没有找到相关的角色权限关联记录\n`);
    }

    // 验证删除结果
    console.log('📋 验证删除结果：\n');
    const [remainingCenters] = await connection.execute(`
      SELECT id, name, chinese_name, code, sort 
      FROM permissions 
      WHERE type='category' AND parent_id IS NULL AND status=1 
      ORDER BY sort
    `);

    console.log(`剩余 ${remainingCenters.length} 个活跃的中心：\n`);
    console.table(remainingCenters);

    // 检查被删除的中心
    const [deletedCenters] = await connection.execute(`
      SELECT id, name, chinese_name, code, status 
      FROM permissions 
      WHERE id IN (${centerIds})
    `);

    console.log('\n已禁用的中心：\n');
    console.table(deletedCenters);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 执行删除
removeCenters().catch(console.error);

