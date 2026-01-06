const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

async function addMissingCenters() {
  console.log('========== 添加缺失的中心 ==========\n');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales'
    });

    // 缺失的7个中心
    const missingCenters = [
      { name: 'AI Center', chineseName: 'AI中心', code: 'AI_CENTER', path: '/centers/ai', icon: 'Brain', sort: 2 },
      { name: 'Analytics Center', chineseName: '数据分析中心', code: 'ANALYTICS_CENTER', path: '/centers/analytics', icon: 'BarChart', sort: 5 },
      { name: 'Attendance Center', chineseName: '考勤中心', code: 'ATTENDANCE_CENTER', path: '/centers/attendance', icon: 'Clock', sort: 10 },
      { name: 'Call Center', chineseName: '呼叫中心', code: 'CALL_CENTER', path: '/centers/call-center', icon: 'Phone', sort: 12 },
      { name: 'Inspection Center', chineseName: '督查中心', code: 'INSPECTION_CENTER', path: '/centers/inspection', icon: 'Shield', sort: 14 },
      { name: 'Document Template Center', chineseName: '文档模板中心', code: 'DOCUMENT_TEMPLATE_CENTER', path: '/centers/document-template', icon: 'FileText', sort: 16 },
      { name: 'Assessment Center', chineseName: '测评中心', code: 'ASSESSMENT_CENTER', path: '/centers/assessment', icon: 'ClipboardCheck', sort: 17 },
      { name: 'Media Center', chineseName: '新媒体中心', code: 'MEDIA_CENTER', path: '/principal/media-center', icon: 'Video', sort: 25 }
    ];

    console.log('📋 准备添加的中心:\n');
    missingCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.chineseName} (${center.code})`);
    });

    console.log('\n🔧 开始创建...\n');
    
    const createdCenterIds = [];
    for (const center of missingCenters) {
      // 检查是否已存在
      const [existing] = await connection.execute(
        `SELECT id, status FROM permissions WHERE code = ?`,
        [center.code]
      );

      if (existing.length > 0) {
        if (existing[0].status === 0) {
          // 如果存在但被禁用，重新启用
          await connection.execute(
            `UPDATE permissions SET status = 1 WHERE code = ?`,
            [center.code]
          );
          console.log(`  ✅ 已启用: ${center.chineseName} (ID: ${existing[0].id})`);
          createdCenterIds.push({ id: existing[0].id, ...center });
        } else {
          console.log(`  ⏭️  已存在: ${center.chineseName} (ID: ${existing[0].id})`);
          createdCenterIds.push({ id: existing[0].id, ...center });
        }
      } else {
        // 创建新的
        const [result] = await connection.execute(
          `INSERT INTO permissions (
            name, chinese_name, code, type, path, icon, sort, 
            parent_id, status, created_at, updated_at
          ) VALUES (?, ?, ?, 'category', ?, ?, ?, NULL, 1, NOW(), NOW())`,
          [center.name, center.chineseName, center.code, center.path, center.icon, center.sort]
        );
        console.log(`  ✅ 已创建: ${center.chineseName} (ID: ${result.insertId})`);
        createdCenterIds.push({ id: result.insertId, ...center });
      }
    }

    // 查找admin用户ID
    const [adminUser] = await connection.execute(
      `SELECT u.id FROM users u 
       JOIN user_roles ur ON u.id = ur.user_id 
       JOIN roles r ON ur.role_id = r.id 
       WHERE r.code = 'admin' LIMIT 1`
    );
    const grantorId = adminUser.length > 0 ? adminUser[0].id : null;

    // 为admin分配所有新中心的权限
    console.log('\n🔧 为Admin分配权限...\n');
    for (const center of createdCenterIds) {
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

    // 为园长分配权限（排除系统中心）
    console.log('\n🔧 为园长分配权限（排除系统中心）...\n');
    for (const center of createdCenterIds) {
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

    // 最终统计
    console.log('\n========== 最终统计 ==========\n');
    
    const [adminTotal] = await connection.execute(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 1 
        AND p.status = 1
        AND p.type = 'category'
        AND p.code NOT LIKE 'TEACHER_%'
        AND p.code NOT LIKE 'PARENT_%'
    `);

    const [principalTotal] = await connection.execute(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 2 
        AND p.status = 1
        AND p.type = 'category'
        AND p.code NOT LIKE 'TEACHER_%'
        AND p.code NOT LIKE 'PARENT_%'
    `);

    console.log(`✅ Admin可访问的中心: ${adminTotal[0].count} 个`);
    console.log(`✅ 园长可访问的中心: ${principalTotal[0].count} 个\n`);

    // 列出所有中心
    console.log('========== Admin的所有中心 ==========\n');
    const [adminCenters] = await connection.execute(`
      SELECT DISTINCT p.chinese_name, p.code, p.sort
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 1 
        AND p.status = 1
        AND p.type = 'category'
        AND p.code NOT LIKE 'TEACHER_%'
        AND p.code NOT LIKE 'PARENT_%'
      ORDER BY p.sort
    `);
    
    adminCenters.forEach((c, i) => {
      console.log(`${i + 1}. ${c.chinese_name} (${c.code})`);
    });

    console.log('\n========== 添加完成！==========');

  } catch (error) {
    console.error('❌ 添加失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

addMissingCenters();

