/**
 * 添加教师客户跟踪SOP系统权限
 */

const { Sequelize, QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 使用远端数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function addCustomerTrackingPermissions() {
  console.log('🚀 开始添加客户跟踪权限...\n');
  console.log('📡 连接到远端数据库:', process.env.DB_HOST);
  console.log('📊 数据库名称:', process.env.DB_NAME);
  console.log('');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查找或创建教师中心权限
    console.log('📋 1. 检查教师中心权限...');
    let teacherCenterId = await sequelize.query(
      `SELECT id FROM permissions WHERE code = 'TEACHER_CENTER' OR path = '/teacher-center' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!teacherCenterId || teacherCenterId.length === 0) {
      console.log('   创建教师中心权限...');
      await sequelize.query(`
        INSERT INTO permissions (name, code, type, path, component, icon, sort, status, created_at, updated_at)
        VALUES ('教师中心', 'TEACHER_CENTER', 'menu', '/teacher-center', 'Layout', 'User', 50, 1, NOW(), NOW())
      `);
      teacherCenterId = await sequelize.query(
        `SELECT id FROM permissions WHERE code = 'TEACHER_CENTER' LIMIT 1`,
        { type: QueryTypes.SELECT }
      );
    }

    const teacherCenterIdValue = teacherCenterId[0].id;
    console.log(`   ✅ 教师中心权限ID: ${teacherCenterIdValue}\n`);

    // 2. 添加客户跟踪主菜单权限
    console.log('📋 2. 添加客户跟踪主菜单...');
    await sequelize.query(`
      INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
      VALUES ('客户跟踪', 'TEACHER_CUSTOMER_TRACKING', 'menu', ${teacherCenterIdValue}, '/teacher-center/customer-tracking', 'pages/teacher-center/customer-tracking/index.vue', 'UserCheck', 70, 1, NOW(), NOW())
    `);

    const customerTrackingId = await sequelize.query(
      `SELECT id FROM permissions WHERE code = 'TEACHER_CUSTOMER_TRACKING' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    const customerTrackingIdValue = customerTrackingId[0].id;
    console.log(`   ✅ 客户跟踪权限ID: ${customerTrackingIdValue}\n`);

    // 3. 添加客户跟踪子权限
    console.log('📋 3. 添加客户跟踪子权限...');
    const subPermissions = [
      { name: '客户列表', code: 'TEACHER_CUSTOMER_TRACKING_LIST', type: 'menu', path: '/teacher-center/customer-tracking', component: '', permission: 'teacher:customer:list', sort: 10 },
      { name: '客户详情', code: 'TEACHER_CUSTOMER_TRACKING_DETAIL', type: 'menu', path: '/teacher-center/customer-tracking/:id', component: 'pages/teacher-center/customer-tracking/detail.vue', permission: 'teacher:customer:detail', sort: 20 },
      { name: 'SOP跟踪', code: 'TEACHER_CUSTOMER_TRACKING_SOP', type: 'button', path: '', component: '', permission: 'teacher:customer:sop:view', sort: 30 },
      { name: '对话管理', code: 'TEACHER_CUSTOMER_TRACKING_CONVERSATION', type: 'button', path: '', component: '', permission: 'teacher:customer:conversation:manage', sort: 40 },
      { name: 'AI建议', code: 'TEACHER_CUSTOMER_TRACKING_AI', type: 'button', path: '', component: '', permission: 'teacher:customer:ai:view', sort: 50 },
      { name: '完成任务', code: 'TEACHER_CUSTOMER_TRACKING_TASK_COMPLETE', type: 'button', path: '', component: '', permission: 'teacher:customer:task:complete', sort: 60 },
      { name: '推进阶段', code: 'TEACHER_CUSTOMER_TRACKING_STAGE_ADVANCE', type: 'button', path: '', component: '', permission: 'teacher:customer:stage:advance', sort: 70 },
      { name: '上传截图', code: 'TEACHER_CUSTOMER_TRACKING_SCREENSHOT', type: 'button', path: '', component: '', permission: 'teacher:customer:screenshot:upload', sort: 80 }
    ];

    for (const perm of subPermissions) {
      await sequelize.query(`
        INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, sort, status, created_at, updated_at)
        VALUES ('${perm.name}', '${perm.code}', '${perm.type}', ${customerTrackingIdValue}, '${perm.path}', '${perm.component}', '${perm.permission}', ${perm.sort}, 1, NOW(), NOW())
      `);
      console.log(`   ✅ ${perm.name}`);
    }
    console.log('');

    // 4. 查找或创建教师角色
    console.log('📋 4. 检查教师角色...');
    let teacherRole = await sequelize.query(
      `SELECT id FROM roles WHERE code = 'teacher' OR name = '教师' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!teacherRole || teacherRole.length === 0) {
      console.log('   创建教师角色...');
      await sequelize.query(`
        INSERT INTO roles (name, code, description, status, created_at, updated_at)
        VALUES ('教师', 'teacher', '教师角色', 1, NOW(), NOW())
      `);
      teacherRole = await sequelize.query(
        `SELECT id FROM roles WHERE code = 'teacher' LIMIT 1`,
        { type: QueryTypes.SELECT }
      );
    }

    const teacherRoleId = teacherRole[0].id;
    console.log(`   ✅ 教师角色ID: ${teacherRoleId}\n`);

    // 5. 为教师角色分配客户跟踪主菜单权限
    console.log('📋 5. 分配权限给教师角色...');
    await sequelize.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
      VALUES (${teacherRoleId}, ${customerTrackingIdValue}, NOW(), NOW())
    `);
    console.log('   ✅ 主菜单权限已分配');

    // 6. 为教师角色分配所有客户跟踪子权限
    await sequelize.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
      SELECT ${teacherRoleId}, p.id, NOW(), NOW()
      FROM permissions p 
      WHERE p.parent_id = ${customerTrackingIdValue}
    `);
    console.log('   ✅ 所有子权限已分配\n');

    // 7. 验证权限配置
    console.log('📋 6. 验证权限配置...');
    const permCount = await sequelize.query(
      `SELECT COUNT(*) as count FROM permissions WHERE code LIKE 'TEACHER_CUSTOMER_TRACKING%'`,
      { type: QueryTypes.SELECT }
    );
    console.log(`   ✅ 权限数量: ${permCount[0].count}`);

    const rolePermCount = await sequelize.query(
      `SELECT COUNT(*) as count
       FROM role_permissions rp
       INNER JOIN permissions p ON rp.permission_id = p.id
       INNER JOIN roles r ON rp.role_id = r.id
       WHERE r.code = 'teacher' AND p.code LIKE 'TEACHER_CUSTOMER_TRACKING%'`,
      { type: QueryTypes.SELECT }
    );
    console.log(`   ✅ 角色权限关联数量: ${rolePermCount[0].count}\n`);

    // 8. 显示配置结果
    console.log('📋 7. 权限配置详情:');
    const permissions = await sequelize.query(
      `SELECT 
        p.name as name,
        p.code as code,
        p.type as type,
        p.path as path,
        p.permission as permission,
        CASE WHEN rp.id IS NOT NULL THEN '✅ 已分配' ELSE '❌ 未分配' END as teacher_role
       FROM permissions p
       LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = ${teacherRoleId}
       WHERE p.code LIKE 'TEACHER_CUSTOMER_TRACKING%'
       ORDER BY p.sort`,
      { type: QueryTypes.SELECT }
    );

    console.log('\n   权限列表:');
    permissions.forEach(p => {
      console.log(`   ${p.teacher_role} ${p.name} (${p.code})`);
      if (p.path) console.log(`      路径: ${p.path}`);
      if (p.permission) console.log(`      权限标识: ${p.permission}`);
    });

    console.log('\n✅ 客户跟踪权限配置完成！');
    console.log('\n💡 提示: 请刷新浏览器页面，重新登录后即可看到客户跟踪菜单');

  } catch (error) {
    console.error('❌ 配置失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行
addCustomerTrackingPermissions()
  .then(() => {
    console.log('\n🎉 完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  });

