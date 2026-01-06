const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function analyzePermissionTypes() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('\n' + '='.repeat(70));
    console.log('🔍 分析权限类型 - 中心 vs 子页面');
    console.log('='.repeat(70) + '\n');

    // 查询所有中心相关的权限
    const [permissions] = await connection.execute(`
      SELECT 
        id,
        name,
        chinese_name,
        code,
        path,
        type,
        parent_id,
        sort
      FROM permissions
      WHERE (
        path LIKE '/centers/%' OR
        path LIKE '/teacher-center/%' OR
        path LIKE '/parent-center%' OR
        name LIKE '%Center%' OR
        chinese_name LIKE '%中心%'
      )
      AND status = 1
      ORDER BY type, sort, id
    `);

    console.log(`找到 ${permissions.length} 个中心相关权限\n`);
    
    // 按类型分组
    const byType = {};
    permissions.forEach(perm => {
      const type = perm.type || 'unknown';
      if (!byType[type]) byType[type] = [];
      byType[type].push(perm);
    });

    console.log('按类型分组:\n');
    Object.keys(byType).forEach(type => {
      console.log(`${type}: ${byType[type].length}个`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('📋 category类型的权限（应该是中心菜单）:\n');
    
    if (byType['category']) {
      byType['category'].forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`   路径: ${perm.path}`);
        console.log(`   代码: ${perm.code}`);
        console.log(`   ID: ${perm.id}`);
        console.log(`   父级: ${perm.parent_id || '无'}`);
        console.log(`   排序: ${perm.sort}\n`);
      });
    }

    console.log('=' .repeat(70));
    console.log('📋 menu类型的权限（应该是子页面）:\n');
    
    if (byType['menu']) {
      byType['menu'].slice(0, 10).forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`   路径: ${perm.path}`);
        console.log(`   父级: ${perm.parent_id || '无'}\n`);
      });
      if (byType['menu'].length > 10) {
        console.log(`   ... 还有 ${byType['menu'].length - 10} 个\n`);
      }
    }

    console.log('=' .repeat(70));

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

analyzePermissionTypes();
