/**
 * 添加呼叫中心权限到数据库
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCallCenterPermissions() {
  let connection;

  try {
    console.log('🔌 正在连接数据库...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yyup@2024',
      database: process.env.DB_NAME || 'kindergarten_management'
    });

    console.log('✅ 数据库连接成功\n');

    // 检查是否已存在呼叫中心权限
    console.log('🔍 检查呼叫中心权限是否已存在...\n');
    const [existing] = await connection.query(`
      SELECT id FROM permissions WHERE code = 'CALL_CENTER'
    `);

    if (existing && existing.length > 0) {
      console.log('⚠️  呼叫中心权限已存在，跳过添加\n');
      return;
    }

    // 添加呼叫中心一级菜单（category）
    console.log('📝 添加呼叫中心一级菜单...\n');
    const [categoryResult] = await connection.query(`
      INSERT INTO permissions (
        name,
        chinese_name,
        code,
        type,
        parent_id,
        path,
        component,
        icon,
        sort,
        status,
        created_at,
        updated_at
      ) VALUES (
        'Call Center',
        '呼叫中心',
        'CALL_CENTER',
        'category',
        NULL,
        '/centers/call-center',
        NULL,
        'phone',
        100,
        1,
        NOW(),
        NOW()
      )
    `);

    const categoryId = categoryResult.insertId;
    console.log(`✅ 呼叫中心一级菜单添加成功 (ID: ${categoryId})\n`);

    // 添加呼叫中心二级页面
    console.log('📝 添加呼叫中心二级页面...\n');
    
    const pages = [
      {
        name: 'Call Center Overview',
        chinese_name: '呼叫中心概览',
        code: 'call_center_overview',
        path: '/centers/call-center/overview',
        component: 'centers/call-center/overview',
        icon: 'dashboard',
        sort: 1
      },
      {
        name: 'Call Records',
        chinese_name: '通话记录',
        code: 'call_center_records',
        path: '/centers/call-center/records',
        component: 'centers/call-center/records',
        icon: 'list',
        sort: 2
      },
      {
        name: 'SIP Configuration',
        chinese_name: 'SIP配置',
        code: 'call_center_sip_config',
        path: '/centers/call-center/sip-config',
        component: 'centers/call-center/sip-config',
        icon: 'settings',
        sort: 3
      },
      {
        name: 'Call Statistics',
        chinese_name: '通话统计',
        code: 'call_center_statistics',
        path: '/centers/call-center/statistics',
        component: 'centers/call-center/statistics',
        icon: 'chart',
        sort: 4
      }
    ];

    for (const page of pages) {
      const [pageResult] = await connection.query(`
        INSERT INTO permissions (
          name,
          chinese_name,
          code,
          type,
          parent_id,
          path,
          component,
          icon,
          sort,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, 'page', ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [
        page.name,
        page.chinese_name,
        page.code,
        categoryId,
        page.path,
        page.component,
        page.icon,
        page.sort
      ]);

      console.log(`   ✅ ${page.chinese_name} (ID: ${pageResult.insertId})`);
    }

    console.log('\n🎉 呼叫中心权限添加完成！\n');

    // 验证添加的权限
    console.log('🔍 验证添加的权限...\n');
    const [permissions] = await connection.query(`
      SELECT id, name, chinese_name, code, type, path
      FROM permissions
      WHERE code = 'CALL_CENTER' OR parent_id = ?
      ORDER BY sort
    `, [categoryId]);

    console.log(`✅ 成功添加 ${permissions.length} 个权限:\n`);
    permissions.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm.chinese_name} (${perm.code})`);
      console.log(`   Type: ${perm.type}`);
      console.log(`   Path: ${perm.path || 'N/A'}`);
      console.log('');
    });

    console.log('💡 提示: 刷新前端页面即可看到呼叫中心菜单\n');

  } catch (error) {
    console.error('\n❌ 添加权限失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

addCallCenterPermissions();

