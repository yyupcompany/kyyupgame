const mysql = require('mysql2/promise');

async function checkDashboardPermissions() {
  const config = {
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    database: 'kargerdensales',
    user: 'root',
    password: 'pwk5ls7j'
  };
  
  console.log('Connecting to database...');
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('Connected successfully!');
    
    // 查询仪表板相关权限
    const [permissions] = await connection.execute(`
      SELECT id, name, path, component, type, status, created_at 
      FROM permissions 
      WHERE name LIKE '%仪表%' OR name LIKE '%dashboard%' OR path LIKE '%dashboard%'
      ORDER BY id
    `);
    
    console.log('\n=== Dashboard related permissions ===');
    console.log('='.repeat(80));
    permissions.forEach(perm => {
      console.log(`ID: ${perm.id}`);
      console.log(`Name: ${perm.name}`);
      console.log(`Path: ${perm.path}`);
      console.log(`Component: ${perm.component}`);
      console.log(`Type: ${perm.type}`);
      console.log(`Status: ${perm.status} ${perm.status === 1 ? '(Enabled)' : '(Disabled)'}`);
      console.log(`Created: ${perm.created_at}`);
      console.log('-'.repeat(40));
    });
    
    // 查询所有权限中包含"主"或"概览"的
    const [overviewPermissions] = await connection.execute(`
      SELECT id, name, path, component, type, status 
      FROM permissions 
      WHERE name LIKE '%主%' OR name LIKE '%概览%' OR name LIKE '%数据统计%' OR name LIKE '%园长%'
      ORDER BY name
    `);
    
    console.log('\n=== Overview/Main related permissions ===');
    console.log('='.repeat(80));
    overviewPermissions.forEach(perm => {
      console.log(`ID: ${perm.id} | Name: ${perm.name} | Path: ${perm.path} | Status: ${perm.status === 1 ? 'Enabled' : 'Disabled'}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

checkDashboardPermissions();