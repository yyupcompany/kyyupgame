/**
 * 修复教师角色AI权限问题
 * 为教师角色添加访问 /api/ai 路由所需的权限
 */

import { Sequelize, QueryTypes } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  logging: console.log,
  timezone: '+08:00'
});

async function fixTeacherAIPermission() {
  try {
    console.log('🚀 开始修复教师角色AI权限...\n');
    
    // 1. 查找或创建 '/ai' 权限
    console.log('1️⃣ 检查 /ai 权限是否存在...');
    const existingPermission = await sequelize.query<{id: number, name: string, code: string}>(
      `SELECT id, name, code FROM permissions WHERE code = '/ai' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );
    
    let aiPermissionId: number;
    if (existingPermission.length > 0) {
      aiPermissionId = existingPermission[0].id;
      console.log(`✅ /ai 权限已存在，ID: ${aiPermissionId}`);
    } else {
      console.log('⚠️  /ai 权限不存在，正在创建...');
      await sequelize.query(
        `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
         VALUES ('AI中心访问', '/ai', 'menu', NULL, '/api/ai', NULL, NULL, 'ChatDotRound', 40, 1, NOW(), NOW())`,
        { type: QueryTypes.INSERT }
      );
      
      const newPermission = await sequelize.query<{id: number}>(
        `SELECT id FROM permissions WHERE code = '/ai' LIMIT 1`,
        { type: QueryTypes.SELECT }
      );
      aiPermissionId = newPermission[0].id;
      console.log(`✅ /ai 权限创建成功，ID: ${aiPermissionId}`);
    }
    
    // 2. 获取教师角色ID
    console.log('\n2️⃣ 查找教师角色...');
    const teacherRole = await sequelize.query<{id: number, name: string, code: string}>(
      `SELECT id, name, code FROM roles WHERE code = 'teacher' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );
    
    if (teacherRole.length === 0) {
      throw new Error('❌ 未找到教师角色');
    }
    
    const teacherRoleId = teacherRole[0].id;
    console.log(`✅ 教师角色找到，ID: ${teacherRoleId}, 名称: ${teacherRole[0].name}`);
    
    // 3. 检查是否已经分配了权限
    console.log('\n3️⃣ 检查教师角色是否已有 /ai 权限...');
    const existingRolePermission = await sequelize.query<{id: number}>(
      `SELECT id FROM role_permissions 
       WHERE role_id = ? AND permission_id = ?`,
      { 
        replacements: [teacherRoleId, aiPermissionId],
        type: QueryTypes.SELECT 
      }
    );
    
    if (existingRolePermission.length > 0) {
      console.log('ℹ️  教师角色已经拥有 /ai 权限，无需重复添加');
    } else {
      console.log('⚠️  教师角色没有 /ai 权限，正在添加...');
      await sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        { 
          replacements: [teacherRoleId, aiPermissionId],
          type: QueryTypes.INSERT 
        }
      );
      console.log('✅ /ai 权限已成功分配给教师角色');
    }
    
    // 4. 验证权限是否添加成功
    console.log('\n4️⃣ 验证权限分配结果...');
    const verification = await sequelize.query<{
      role_name: string,
      role_code: string,
      permission_name: string,
      permission_code: string,
      permission_path: string
    }>(
      `SELECT 
        r.name AS role_name,
        r.code AS role_code,
        p.name AS permission_name,
        p.code AS permission_code,
        p.path AS permission_path
      FROM role_permissions rp
      INNER JOIN roles r ON rp.role_id = r.id
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE r.code = 'teacher' AND p.code = '/ai'`,
      { type: QueryTypes.SELECT }
    );
    
    if (verification.length > 0) {
      console.log('✅ 验证成功！教师角色现在拥有以下权限:');
      console.log('   角色:', verification[0].role_name);
      console.log('   权限:', verification[0].permission_name);
      console.log('   权限代码:', verification[0].permission_code);
      console.log('   路径:', verification[0].permission_path);
    } else {
      console.log('❌ 验证失败！权限可能未正确分配');
    }
    
    // 5. 显示教师角色的所有AI相关权限
    console.log('\n5️⃣ 教师角色的所有AI相关权限:');
    const allAIPermissions = await sequelize.query<{
      code: string,
      name: string,
      path: string
    }>(
      `SELECT 
        p.code,
        p.name,
        p.path
      FROM role_permissions rp
      INNER JOIN roles r ON rp.role_id = r.id
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE r.code = 'teacher' AND (p.code LIKE '%ai%' OR p.code LIKE '%AI%' OR p.path LIKE '%/ai%')
      ORDER BY p.code`,
      { type: QueryTypes.SELECT }
    );
    
    if (allAIPermissions.length > 0) {
      console.log(`找到 ${allAIPermissions.length} 个AI相关权限:`);
      allAIPermissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.code} - ${perm.name} (${perm.path})`);
      });
    } else {
      console.log('⚠️  未找到任何AI相关权限');
    }
    
    console.log('\n✅ 权限修复完成！');
    console.log('📝 请刷新浏览器页面，重新登录教师账号以使权限生效。');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行修复
fixTeacherAIPermission()
  .then(() => {
    console.log('\n🎉 脚本执行成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });

