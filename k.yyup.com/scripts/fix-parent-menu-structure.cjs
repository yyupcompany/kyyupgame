const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

async function fixParentMenuStructure() {
  console.log('========== 重构家长菜单结构 ==========\n');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales'
    });

    // 查找家长角色ID和admin用户ID
    const [parentRole] = await connection.execute(
      `SELECT id FROM roles WHERE code = 'parent'`
    );
    const parentRoleId = parentRole[0].id;

    const [adminUser] = await connection.execute(
      `SELECT u.id FROM users u 
       JOIN user_roles ur ON u.id = ur.user_id 
       JOIN roles r ON ur.role_id = r.id 
       WHERE r.code = 'admin' LIMIT 1`
    );
    const grantorId = adminUser.length > 0 ? adminUser[0].id : null;

    console.log('📋 按照用户要求，家长中心应该包含:\n');
    console.log('  1. 我的首页（综合显示）');
    console.log('  2. 测评中心');
    console.log('  3. 游戏中心');
    console.log('  4. 成长报告');
    console.log('  5. 分享统计（转发播放次数）\n');

    // 1. 禁用旧的家长菜单结构
    console.log('🔧 禁用旧的家长菜单结构...\n');
    await connection.execute(`
      UPDATE permissions 
      SET status = 0
      WHERE code LIKE 'PARENT_%'
    `);
    console.log('✅ 已禁用旧的家长菜单\n');

    // 2. 创建新的简化家长菜单（扁平化，一级菜单）
    const newParentMenus = [
      // 不需要"家长中心"这个分类，因为家长本身就在家长中心了
      // 直接显示功能菜单
      { name: 'Parent Overview', chineseName: '综合显示', code: 'PARENT_OVERVIEW', path: '/parent-center/dashboard', icon: 'Home', sort: 1 },
      { name: 'Parent Children', chineseName: '我的孩子', code: 'PARENT_CHILDREN', path: '/parent-center/children', icon: 'Users', sort: 2 },
      { name: 'Parent Assessment', chineseName: '发育测评', code: 'PARENT_ASSESSMENT', path: '/parent-center/assessment', icon: 'ClipboardCheck', sort: 3 },
      { name: 'Parent Games', chineseName: '脑开发游戏', code: 'PARENT_GAMES', path: '/parent-center/games', icon: 'Gamepad2', sort: 4 },
      { name: 'Parent Growth', chineseName: '成长报告', code: 'PARENT_GROWTH', path: '/parent-center/child-growth', icon: 'TrendingUp', sort: 5 },
      { name: 'Parent Activities', chineseName: '活动报名', code: 'PARENT_ACTIVITIES', path: '/parent-center/activities', icon: 'Calendar', sort: 6 },
      { name: 'Parent AI', chineseName: 'AI育儿助手', code: 'PARENT_AI', path: '/parent-center/ai-assistant', icon: 'Bot', sort: 7 },
      { name: 'Parent Share Stats', chineseName: '分享统计', code: 'PARENT_SHARE_STATS', path: '/parent-center/share-stats', icon: 'Share2', sort: 8 }
    ];

    console.log('🔧 创建新的家长菜单（扁平化）...\n');
    
    const createdMenuIds = [];
    for (const menu of newParentMenus) {
      // 检查是否已存在
      const [existing] = await connection.execute(
        `SELECT id FROM permissions WHERE code = ?`,
        [menu.code]
      );

      let menuId;
      if (existing.length > 0) {
        // 更新现有记录
        await connection.execute(
          `UPDATE permissions 
           SET name = ?, chinese_name = ?, path = ?, icon = ?, sort = ?, status = 1, type = 'menu'
           WHERE code = ?`,
          [menu.name, menu.chineseName, menu.path, menu.icon, menu.sort, menu.code]
        );
        menuId = existing[0].id;
        console.log(`  ✅ 已更新: ${menu.chineseName} (ID: ${menuId})`);
      } else {
        // 创建新记录（作为menu类型，不是category）
        const [result] = await connection.execute(
          `INSERT INTO permissions (
            name, chinese_name, code, type, path, icon, sort,
            parent_id, status, created_at, updated_at
          ) VALUES (?, ?, ?, 'menu', ?, ?, ?, NULL, 1, NOW(), NOW())`,
          [menu.name, menu.chineseName, menu.code, menu.path, menu.icon, menu.sort]
        );
        menuId = result.insertId;
        console.log(`  ✅ 已创建: ${menu.chineseName} (ID: ${menuId})`);
      }
      createdMenuIds.push(menuId);
    }

    // 3. 清除家长现有的所有权限
    console.log('\n🔧 清除家长旧权限...');
    await connection.execute(`DELETE FROM role_permissions WHERE role_id = ?`, [parentRoleId]);
    console.log('✅ 已清除\n');

    // 4. 为家长分配新菜单权限
    console.log('🔧 为家长分配新菜单权限...\n');
    for (const menuId of createdMenuIds) {
      await connection.execute(
        `INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [parentRoleId, menuId, grantorId]
      );
    }
    console.log(`✅ 已为家长分配 ${createdMenuIds.length} 个菜单权限\n`);

    // 5. 验证结果
    const [finalMenus] = await connection.execute(`
      SELECT p.chinese_name, p.path
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.status = 1
      ORDER BY p.sort
    `, [parentRoleId]);

    console.log('========== 家长最终菜单 ==========\n');
    finalMenus.forEach((m, i) => {
      console.log(`${i + 1}. ${m.chinese_name} - ${m.path}`);
    });

    console.log('\n========== 重构完成！==========');

  } catch (error) {
    console.error('❌ 重构失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixParentMenuStructure();

