const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

async function analyzePrincipalPermissions() {
  console.log('========== 分析Admin和园长权限差异 ==========\n');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales'
    });

    // 1. 查找"系统管理"分类及其子权限
    const [systemCategory] = await connection.execute(
      `SELECT id, name, chinese_name, code, type 
       FROM permissions 
       WHERE name = '系统管理' AND type = 'category' AND status = 1`
    );
    
    let systemPermissionIds = [];
    if (systemCategory.length > 0) {
      console.log('📌 系统管理分类:', systemCategory[0]);
      const systemCategoryId = systemCategory[0].id;
      
      // 查找系统管理下的所有子权限
      const [systemChildren] = await connection.execute(
        `SELECT id, name, chinese_name, type, code
         FROM permissions 
         WHERE parent_id = ? AND status = 1`,
        [systemCategoryId]
      );
      
      console.log(`\n📋 系统管理下的子权限(${systemChildren.length}个):`);
      systemChildren.forEach(p => {
        console.log(`  - [${p.type}] ${p.name} (ID: ${p.id})`);
      });
      
      // 收集所有系统管理相关的权限ID（包括分类本身）
      systemPermissionIds = [systemCategoryId, ...systemChildren.map(p => p.id)];
      console.log(`\n🔢 系统管理相关权限ID总数: ${systemPermissionIds.length}`);
      console.log('ID列表:', systemPermissionIds.join(', '));
    }

    // 2. 获取admin的所有权限（排除TEACHER_和PARENT_）
    const [adminPerms] = await connection.execute(
      `SELECT DISTINCT p.id, p.name, p.code
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 1 
         AND p.status = 1
         AND p.code NOT LIKE 'TEACHER_%'
         AND p.code NOT LIKE 'PARENT_%'
       ORDER BY p.id`
    );

    console.log(`\n📊 Admin的中心权限总数: ${adminPerms.length}`);

    // 3. 获取园长的所有权限
    const [principalPerms] = await connection.execute(
      `SELECT DISTINCT p.id, p.name, p.code
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 2 
         AND p.status = 1
         AND p.code NOT LIKE 'TEACHER_%'
         AND p.code NOT LIKE 'PARENT_%'
       ORDER BY p.id`
    );

    console.log(`📊 园长的中心权限总数: ${principalPerms.length}\n`);

    // 4. 找出admin有但园长没有的权限
    const adminIds = adminPerms.map(p => p.id);
    const principalIds = principalPerms.map(p => p.id);
    const missingIds = adminIds.filter(id => !principalIds.includes(id));

    console.log(`⚠️ 园长缺少的权限数量: ${missingIds.length}\n`);
    
    if (missingIds.length > 0) {
      console.log('🔍 缺少的权限详情:');
      for (const id of missingIds) {
        const perm = adminPerms.find(p => p.id === id);
        const isSystem = systemPermissionIds.includes(id);
        console.log(`  - [ID:${id}] ${perm.name || perm.code} ${isSystem ? '🔒(系统管理)' : '❌'}`);
      }
    }

    // 5. 计算应该给园长的权限（admin的所有权限 - 系统管理）
    const targetPrincipalIds = adminIds.filter(id => !systemPermissionIds.includes(id));
    console.log(`\n✅ 园长应该拥有的权限数量: ${targetPrincipalIds.length}`);
    console.log(`   (Admin ${adminPerms.length} - 系统管理 ${systemPermissionIds.length} = ${targetPrincipalIds.length})\n`);

    return { 
      systemPermissionIds, 
      targetPrincipalIds,
      currentPrincipalIds: principalIds 
    };

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

analyzePrincipalPermissions();

