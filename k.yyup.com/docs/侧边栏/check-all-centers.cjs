/**
 * 全面检查所有中心的配置
 * 找出为什么侧边栏会显示英文名称的根本原因
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../server/.env') });
const mysql = require('mysql2/promise');

async function checkAllCenters() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 查询所有一级分类（中心）
    console.log('📋 查询所有一级分类（中心）...\n');
    const [categories] = await connection.execute(`
      SELECT 
        id, 
        name, 
        chinese_name,
        code, 
        type,
        parent_id,
        status,
        sort,
        component,
        path,
        icon
      FROM permissions 
      WHERE type = 'category' 
        AND parent_id IS NULL
      ORDER BY sort, id
    `);

    console.log(`找到 ${categories.length} 个一级分类：\n`);
    console.table(categories.map(c => ({
      ID: c.id,
      名称: c.name,
      中文名称: c.chinese_name || '❌ 缺失',
      代码: c.code,
      状态: c.status === 1 ? '✅ 启用' : '❌ 禁用',
      排序: c.sort,
      组件: c.component || '无',
      路径: c.path
    })));

    // 2. 统计问题
    console.log('\n📊 问题统计：\n');
    
    const missingChineseName = categories.filter(c => !c.chinese_name);
    const disabled = categories.filter(c => c.status === 0);
    const enabled = categories.filter(c => c.status === 1);
    
    console.log(`总计: ${categories.length} 个中心`);
    console.log(`✅ 启用: ${enabled.length} 个`);
    console.log(`❌ 禁用: ${disabled.length} 个`);
    console.log(`⚠️  缺少中文名称: ${missingChineseName.length} 个`);
    
    if (missingChineseName.length > 0) {
      console.log('\n⚠️  以下中心缺少中文名称：');
      missingChineseName.forEach(c => {
        console.log(`   - ID ${c.id}: ${c.name} (${c.code})`);
      });
    }

    // 3. 检查角色权限关联
    console.log('\n\n📋 检查admin角色的权限关联...\n');
    const [rolePermissions] = await connection.execute(`
      SELECT 
        rp.id,
        rp.role_id,
        r.name as role_name,
        r.code as role_code,
        p.id as permission_id,
        p.name as permission_name,
        p.chinese_name,
        p.code as permission_code,
        p.type,
        p.status
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.code = 'ADMIN'
        AND p.type = 'category'
        AND p.parent_id IS NULL
      ORDER BY p.sort, p.id
    `);

    console.log(`admin角色有 ${rolePermissions.length} 个中心权限：\n`);
    console.table(rolePermissions.map(rp => ({
      权限ID: rp.permission_id,
      名称: rp.permission_name,
      中文名称: rp.chinese_name || '❌ 缺失',
      代码: rp.permission_code,
      状态: rp.status === 1 ? '✅ 启用' : '❌ 禁用'
    })));

    // 4. 找出启用但没有分配给admin的中心
    console.log('\n\n📋 检查启用但未分配给admin的中心...\n');
    const assignedIds = rolePermissions.map(rp => rp.permission_id);
    const enabledButNotAssigned = enabled.filter(c => !assignedIds.includes(c.id));
    
    if (enabledButNotAssigned.length > 0) {
      console.log(`⚠️  发现 ${enabledButNotAssigned.length} 个启用但未分配给admin的中心：\n`);
      console.table(enabledButNotAssigned.map(c => ({
        ID: c.id,
        名称: c.name,
        中文名称: c.chinese_name || '❌ 缺失',
        代码: c.code
      })));
    } else {
      console.log('✅ 所有启用的中心都已分配给admin');
    }

    // 5. 检查二级菜单（页面）
    console.log('\n\n📋 检查每个中心的二级菜单（页面）...\n');
    for (const category of enabled) {
      const [pages] = await connection.execute(`
        SELECT 
          id,
          name,
          chinese_name,
          code,
          component,
          path,
          status
        FROM permissions
        WHERE parent_id = ?
          AND type IN ('menu', 'page')
        ORDER BY sort, id
      `, [category.id]);

      console.log(`\n${category.chinese_name || category.name} (ID: ${category.id}):`);
      if (pages.length === 0) {
        console.log('  ⚠️  没有二级菜单');
      } else {
        console.log(`  找到 ${pages.length} 个二级菜单：`);
        pages.forEach(p => {
          const status = p.status === 1 ? '✅' : '❌';
          const chineseName = p.chinese_name || '❌ 缺失';
          console.log(`    ${status} ${p.name} (${chineseName}) - ${p.component || '无组件'}`);
        });
      }
    }

    // 6. 生成修复建议
    console.log('\n\n🔧 修复建议：\n');
    
    if (missingChineseName.length > 0) {
      console.log('1. 补充缺失的中文名称：');
      console.log('```sql');
      missingChineseName.forEach(c => {
        const suggestedName = c.name.replace(' Center', '中心');
        console.log(`UPDATE permissions SET chinese_name = '${suggestedName}' WHERE id = ${c.id}; -- ${c.name}`);
      });
      console.log('```\n');
    }

    if (enabledButNotAssigned.length > 0) {
      console.log('2. 为admin角色分配缺失的中心权限：');
      console.log('```sql');
      const [adminRole] = await connection.execute(`SELECT id FROM roles WHERE code = 'ADMIN'`);
      if (adminRole.length > 0) {
        const adminRoleId = adminRole[0].id;
        enabledButNotAssigned.forEach(c => {
          console.log(`INSERT INTO role_permissions (role_id, permission_id) VALUES (${adminRoleId}, ${c.id}); -- ${c.name}`);
        });
      }
      console.log('```\n');
    }

    // 7. 根本原因分析
    console.log('\n\n🎯 根本原因分析：\n');
    console.log('侧边栏显示英文名称的可能原因：');
    console.log('1. ❌ 数据库中 chinese_name 字段为 NULL 或空字符串');
    console.log('2. ❌ 后端 API 返回数据时没有正确映射 chinese_name 字段');
    console.log('3. ❌ 前端 Sidebar 组件没有正确读取 chinese_name 字段');
    console.log('4. ❌ 缓存问题：Redis 或前端缓存了旧数据');
    console.log('5. ❌ 权限未分配：中心虽然启用但未分配给当前角色');
    
    console.log('\n建议的修复顺序：');
    console.log('1. 先修复数据库中的 chinese_name 字段（最根本）');
    console.log('2. 清除 Redis 缓存');
    console.log('3. 重启后端服务器');
    console.log('4. 清除浏览器缓存');
    console.log('5. 验证前端 Sidebar 组件的映射逻辑');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行检查
checkAllCenters();

