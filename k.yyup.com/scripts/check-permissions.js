import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  logging: false,
  timezone: '+08:00'
});

async function checkPermissions() {
  try {
    console.log('📋 检查admin和principal角色的权限...\n');
    
    // 1. 获取admin角色的权限
    const [adminPerms] = await sequelize.query(`
      SELECT p.id, p.code, p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = 1
      ORDER BY p.code
    `);
    
    console.log(`✅ admin角色权限 (${adminPerms.length}个):`);
    console.table(adminPerms);
    
    // 2. 获取principal角色的权限
    const [principalPerms] = await sequelize.query(`
      SELECT p.id, p.code, p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = 2
      ORDER BY p.code
    `);
    
    console.log(`\n✅ principal角色权限 (${principalPerms.length}个):`);
    console.table(principalPerms.slice(0, 20)); // 只显示前20个
    
    // 3. 查找中心页面相关的权限
    const [centerPerms] = await sequelize.query(`
      SELECT id, code, name
      FROM permissions
      WHERE code LIKE '%CENTER%'
      ORDER BY code
    `);
    
    console.log(`\n📊 所有中心页面相关权限 (${centerPerms.length}个):`);
    console.table(centerPerms);
    
    // 4. 检查principal缺少哪些中心权限
    const principalPermCodes = new Set(principalPerms.map(p => p.code));
    const missingCenterPerms = centerPerms.filter(p => !principalPermCodes.has(p.code));
    
    console.log(`\n❌ principal角色缺少的中心权限 (${missingCenterPerms.length}个):`);
    console.table(missingCenterPerms);
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPermissions();

