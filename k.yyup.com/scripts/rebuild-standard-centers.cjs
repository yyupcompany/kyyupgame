const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

async function rebuildStandardCenters() {
  console.log('========== 重建标准的12个业务中心 ==========\n');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales'
    });

    // 文档规范的12个中心
    const standardCenters = [
      { name: 'Personnel Center', chineseName: '人员中心', code: 'PERSONNEL_CENTER', path: '/centers/personnel', icon: 'Users', sort: 1 },
      { name: 'Activity Center', chineseName: '活动中心', code: 'ACTIVITY_CENTER', path: '/centers/activity', icon: 'Calendar', sort: 3 },
      { name: 'Marketing Center', chineseName: '营销中心', code: 'MARKETING_CENTER', path: '/centers/marketing', icon: 'TrendingUp', sort: 4 },
      { name: 'Business Center', chineseName: '业务中心', code: 'BUSINESS_CENTER', path: '/centers/business', icon: 'Briefcase', sort: 6 },
      { name: 'Customer Pool Center', chineseName: '客户池中心', code: 'CUSTOMER_POOL_CENTER', path: '/centers/customer-pool', icon: 'Users', sort: 7 },
      { name: 'System Center', chineseName: '系统中心', code: 'SYSTEM_CENTER', path: '/centers/system', icon: 'Settings', sort: 8 },
      { name: 'Finance Center', chineseName: '财务中心', code: 'FINANCE_CENTER', path: '/centers/finance', icon: 'DollarSign', sort: 9 },
      { name: 'Enrollment Center', chineseName: '招生中心', code: 'ENROLLMENT_CENTER', path: '/centers/enrollment', icon: 'School', sort: 11 },
      { name: 'Task Center', chineseName: '任务中心', code: 'TASK_CENTER', path: '/centers/task', icon: 'CheckSquare', sort: 13 },
      { name: 'Teaching Center', chineseName: '教学中心', code: 'TEACHING_CENTER', path: '/centers/teaching', icon: 'BookOpen', sort: 15 },
      { name: 'Script Center', chineseName: '话术中心', code: 'SCRIPT_CENTER', path: '/centers/script', icon: 'MessageSquare', sort: 21 },
      { name: 'Media Center', chineseName: '新媒体中心', code: 'MEDIA_CENTER', path: '/principal/media-center', icon: 'Video', sort: 25 }
    ];

    console.log('📋 准备创建的12个标准中心:\n');
    standardCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.chineseName} (${center.code})`);
    });

    // 1. 检查是否已存在
    console.log('\n🔍 检查已存在的中心...\n');
    const existingCenterIds = [];
    for (const center of standardCenters) {
      const [existing] = await connection.execute(
        `SELECT id FROM permissions WHERE code = ? AND status = 1`,
        [center.code]
      );
      if (existing.length > 0) {
        console.log(`  ✅ 已存在: ${center.chineseName} (ID: ${existing[0].id})`);
        existingCenterIds.push(existing[0].id);
      } else {
        console.log(`  ❌ 需创建: ${center.chineseName}`);
      }
    }

    // 2. 创建缺失的中心
    console.log('\n🔧 创建缺失的中心...\n');
    const createdCenterIds = [];
    for (const center of standardCenters) {
      const [existing] = await connection.execute(
        `SELECT id FROM permissions WHERE code = ?`,
        [center.code]
      );

      if (existing.length === 0) {
        const [result] = await connection.execute(
          `INSERT INTO permissions (
            name, chinese_name, code, type, path, icon, sort, 
            parent_id, status, created_at, updated_at
          ) VALUES (?, ?, ?, 'category', ?, ?, ?, NULL, 1, NOW(), NOW())`,
          [center.name, center.chineseName, center.code, center.path, center.icon, center.sort]
        );
        console.log(`  ✅ 已创建: ${center.chineseName} (ID: ${result.insertId})`);
        createdCenterIds.push(result.insertId);
      }
    }

    // 3. 获取所有中心的ID
    const allCenterIds = [];
    for (const center of standardCenters) {
      const [result] = await connection.execute(
        `SELECT id FROM permissions WHERE code = ? AND status = 1`,
        [center.code]
      );
      if (result.length > 0) {
        allCenterIds.push({ id: result[0].id, ...center });
      }
    }

    console.log(`\n📊 总共有 ${allCenterIds.length} 个标准中心\n`);

    // 4. 查找admin用户ID
    const [adminUser] = await connection.execute(
      `SELECT u.id FROM users u 
       JOIN user_roles ur ON u.id = ur.user_id 
       JOIN roles r ON ur.role_id = r.id 
       WHERE r.code = 'admin' LIMIT 1`
    );
    const grantorId = adminUser.length > 0 ? adminUser[0].id : null;

    // 5. 为admin分配所有中心权限（如果还没有）
    console.log('🔧 为Admin分配所有中心权限...\n');
    for (const center of allCenterIds) {
      const [existing] = await connection.execute(
        `SELECT id FROM role_permissions WHERE role_id = 1 AND permission_id = ?`,
        [center.id]
      );
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)
           VALUES (1, ?, ?, NOW(), NOW())`,
          [center.id, grantorId]
        );
        console.log(`  ✅ Admin: ${center.chineseName}`);
      }
    }

    // 6. 为园长分配除"系统中心"外的所有中心
    console.log('\n🔧 为园长分配权限（排除系统中心）...\n');
    for (const center of allCenterIds) {
      if (center.code === 'SYSTEM_CENTER') {
        console.log(`  ⏭️  跳过: ${center.chineseName} (系统中心专属于Admin)`);
        continue;
      }

      const [existing] = await connection.execute(
        `SELECT id FROM role_permissions WHERE role_id = 2 AND permission_id = ?`,
        [center.id]
      );
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)
           VALUES (2, ?, ?, NOW(), NOW())`,
          [center.id, grantorId]
        );
        console.log(`  ✅ 园长: ${center.chineseName}`);
      }
    }

    // 7. 验证最终权限
    console.log('\n========== 最终权限统计 ==========\n');
    
    const [adminCenters] = await connection.execute(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 1 
        AND p.status = 1
        AND p.type = 'category'
        AND p.code NOT LIKE 'TEACHER_%'
        AND p.code NOT LIKE 'PARENT_%'
    `);

    const [principalCenters] = await connection.execute(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 2 
        AND p.status = 1
        AND p.type = 'category'
        AND p.code NOT LIKE 'TEACHER_%'
        AND p.code NOT LIKE 'PARENT_%'
    `);

    console.log(`✅ Admin可访问的中心: ${adminCenters[0].count} 个`);
    console.log(`✅ 园长可访问的中心: ${principalCenters[0].count} 个`);
    console.log(`\n预期: Admin=12个, 园长=11个（不含系统中心）`);

    // 8. 列出admin和园长的中心
    console.log('\n========== Admin的中心列表 ==========\n');
    const [adminList] = await connection.execute(`
      SELECT DISTINCT p.chinese_name, p.code
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 1 
        AND p.status = 1
        AND p.type = 'category'
        AND p.code NOT LIKE 'TEACHER_%'
        AND p.code NOT LIKE 'PARENT_%'
      ORDER BY p.sort
    `);
    adminList.forEach((c, i) => {
      console.log(`${i + 1}. ${c.chinese_name} (${c.code})`);
    });

    console.log('\n========== 园长的中心列表 ==========\n');
    const [principalList] = await connection.execute(`
      SELECT DISTINCT p.chinese_name, p.code
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 2 
        AND p.status = 1
        AND p.type = 'category'
        AND p.code NOT LIKE 'TEACHER_%'
        AND p.code NOT LIKE 'PARENT_%'
      ORDER BY p.sort
    `);
    principalList.forEach((c, i) => {
      console.log(`${i + 1}. ${c.chinese_name} (${c.code})`);
    });

    console.log('\n========== 重建完成！==========');

  } catch (error) {
    console.error('❌ 重建失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

rebuildStandardCenters();

