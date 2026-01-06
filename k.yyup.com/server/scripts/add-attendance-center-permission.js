const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAttendanceCenterPermission() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'kargerdensales'
  });

  try {
    console.log('🔍 检查是否已存在考勤中心权限...\n');

    // 检查是否已存在
    const [existingRows] = await connection.execute(`
      SELECT id, name, code FROM permissions
      WHERE code = 'ATTENDANCE_CENTER' OR name = 'Attendance Center' OR chinese_name = '考勤中心'
    `);

    if (existingRows.length > 0) {
      console.log('⚠️  考勤中心权限已存在:');
      console.table(existingRows);
      console.log('\n🔄 更新现有权限...');

      // 更新现有权限
      await connection.execute(`
        UPDATE permissions
        SET
          name = 'Attendance Center',
          chinese_name = '考勤中心',
          code = 'ATTENDANCE_CENTER',
          type = 'menu',
          parent_id = NULL,
          path = '/centers/attendance',
          component = 'pages/centers/AttendanceCenter.vue',
          permission = 'attendance:center:view',
          icon = 'CalendarCheck',
          sort = 65,
          status = 1
        WHERE code = 'ATTENDANCE_CENTER' OR name = 'Attendance Center' OR chinese_name = '考勤中心'
      `);

      const attendanceCenterId = existingRows[0].id;
      console.log(`✅ 更新考勤中心权限成功，ID: ${attendanceCenterId}`);

      // 继续添加子菜单权限
      await addSubPermissions(connection, attendanceCenterId);

    } else {
      console.log('📝 添加新的考勤中心权限...\n');

      // 获取最大ID和排序值
      const [maxRows] = await connection.execute(`
        SELECT MAX(id) as max_id, MAX(sort) as max_sort FROM permissions
      `);
      const maxId = (maxRows[0]?.max_id || 0) + 1;
      const maxSort = (maxRows[0]?.max_sort || 0) + 1;

      // 插入考勤中心主菜单
      const [insertResult] = await connection.execute(`
        INSERT INTO permissions (
          id, name, chinese_name, code, type, parent_id, path, component,
          permission, icon, sort, status, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
        )
      `, [
        maxId,
        'Attendance Center',
        '考勤中心',
        'ATTENDANCE_CENTER',
        'menu',
        null, // 顶级菜单
        '/centers/attendance',
        'pages/centers/AttendanceCenter.vue',
        'attendance:center:view',
        'CalendarCheck',
        65, // 排序在客户池(60)和检查中心(70)之间
        1 // 启用状态
      ]);

      const attendanceCenterId = insertResult.insertId;
      console.log(`✅ 添加考勤中心主菜单成功，ID: ${attendanceCenterId}`);

      // 添加子菜单权限
      await addSubPermissions(connection, attendanceCenterId);
    }

    // 验证添加结果
    console.log('\n🔍 验证添加结果...');
    const [verifyRows] = await connection.execute(`
      SELECT id, name, chinese_name, code, parent_id, path, icon, sort, status
      FROM permissions
      WHERE code = 'ATTENDANCE_CENTER' OR parent_id IN (
        SELECT id FROM permissions WHERE code = 'ATTENDANCE_CENTER'
      )
      ORDER BY sort, id
    `);

    console.log('📋 考勤中心相关权限:');
    console.table(verifyRows);

    console.log('\n🎉 考勤中心权限配置完成！');

  } catch (error) {
    console.error('❌ 操作失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function addSubPermissions(connection, parentId) {
  console.log('\n📝 添加考勤中心子菜单权限...');

  const subPermissions = [
    {
      name: 'Attendance Statistics',
      chineseName: '考勤统计',
      code: 'ATTENDANCE_STATISTICS',
      path: '/centers/attendance/statistics',
      component: 'pages/centers/components/attendance/StatisticsTab.vue',
      permission: 'attendance:statistics:view',
      icon: 'BarChart',
      sort: 1
    },
    {
      name: 'Class Statistics',
      chineseName: '班级统计',
      code: 'ATTENDANCE_CLASS_STATISTICS',
      path: '/centers/attendance/class-statistics',
      component: 'pages/centers/components/attendance/ClassStatisticsTab.vue',
      permission: 'attendance:class:view',
      icon: 'School',
      sort: 2
    },
    {
      name: 'Abnormal Analysis',
      chineseName: '异常分析',
      code: 'ATTENDANCE_ABNORMAL',
      path: '/centers/attendance/abnormal',
      component: 'pages/centers/components/attendance/AbnormalAnalysisTab.vue',
      permission: 'attendance:abnormal:view',
      icon: 'AlertTriangle',
      sort: 3
    },
    {
      name: 'Health Monitoring',
      chineseName: '健康监测',
      code: 'ATTENDANCE_HEALTH',
      path: '/centers/attendance/health',
      component: 'pages/centers/components/attendance/HealthMonitoringTab.vue',
      permission: 'attendance:health:view',
      icon: 'Heart',
      sort: 4
    },
    {
      name: 'Records Management',
      chineseName: '记录管理',
      code: 'ATTENDANCE_RECORDS',
      path: '/centers/attendance/records',
      component: 'pages/centers/components/attendance/RecordsManagementTab.vue',
      permission: 'attendance:records:manage',
      icon: 'List',
      sort: 5
    }
  ];

  for (const perm of subPermissions) {
    // 检查是否已存在
    const [existing] = await connection.execute(`
      SELECT id FROM permissions WHERE code = ? OR (parent_id = ? AND code = ?)
    `, [perm.code, parentId, perm.code]);

    if (existing.length === 0) {
      // 获取最大ID
      const [maxIdResult] = await connection.execute('SELECT MAX(id) as max_id FROM permissions');
      const newId = (maxIdResult[0]?.max_id || 0) + 1;

      await connection.execute(`
        INSERT INTO permissions (
          id, name, chinese_name, code, type, parent_id, path, component,
          permission, icon, sort, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        newId,
        perm.name,
        perm.chineseName,
        perm.code,
        'menu',
        parentId,
        perm.path,
        perm.component,
        perm.permission,
        perm.icon,
        perm.sort,
        1 // 启用状态
      ]);

      console.log(`  ✅ 添加子菜单: ${perm.chineseName} (ID: ${newId})`);
    } else {
      console.log(`  ⚠️  子菜单已存在: ${perm.chineseName}`);
    }
  }
}

// 运行脚本
addAttendanceCenterPermission().catch(console.error);