/**
 * 检查园长角色的所有权限
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

async function checkPrincipalPermissions() {
  try {
    console.log('🔍 检查园长角色的所有权限...\n');

    // 查询园长角色的所有权限
    const [permissions] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.code, p.type, p.path, p.component, p.parent_id
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'principal' AND p.type IN ('page', 'menu')
      ORDER BY p.parent_id, p.sort, p.id
    `);

    console.log(`✅ 找到 ${permissions.length} 个园长权限:\n`);
    
    // 按父级分组
    const grouped = {};
    permissions.forEach(perm => {
      const parentId = perm.parent_id || 'root';
      if (!grouped[parentId]) {
        grouped[parentId] = [];
      }
      grouped[parentId].push(perm);
    });

    // 显示根级权限
    if (grouped['root']) {
      console.log('📁 根级权限:');
      grouped['root'].forEach(perm => {
        console.log(`  ${perm.id}. ${perm.name} (${perm.chinese_name || 'N/A'})`);
        console.log(`     路径: ${perm.path || 'N/A'}`);
        console.log(`     组件: ${perm.component || 'N/A'}`);
        console.log(`     代码: ${perm.code}`);
        
        // 显示子权限
        if (grouped[perm.id]) {
          grouped[perm.id].forEach(child => {
            console.log(`       └─ ${child.id}. ${child.name} (${child.chinese_name || 'N/A'})`);
            console.log(`          路径: ${child.path || 'N/A'}`);
            console.log(`          组件: ${child.component || 'N/A'}`);
          });
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPrincipalPermissions();

