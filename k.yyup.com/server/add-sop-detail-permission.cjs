/**
 * 添加SOP详情页权限到动态权限系统
 */

const { Sequelize, QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false
  }
);

async function addSOPDetailPermission() {
  console.log('🚀 添加SOP详情页权限到动态权限系统...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查找客户跟踪主菜单权限ID
    console.log('📋 1. 查找客户跟踪主菜单权限...');
    const customerTracking = await sequelize.query(
      `SELECT id FROM permissions WHERE code = 'TEACHER_CUSTOMER_TRACKING' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!customerTracking || customerTracking.length === 0) {
      console.log('❌ 未找到客户跟踪主菜单权限');
      console.log('   请先运行: node add-customer-tracking-permissions.cjs');
      return;
    }

    const parentId = customerTracking[0].id;
    console.log(`   ✅ 客户跟踪权限ID: ${parentId}\n`);

    // 2. 检查SOP详情页权限是否已存在
    console.log('📋 2. 检查SOP详情页权限...');
    const existing = await sequelize.query(
      `SELECT id FROM permissions WHERE code = 'TEACHER_CUSTOMER_TRACKING_DETAIL' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (existing && existing.length > 0) {
      console.log('   ⚠️  SOP详情页权限已存在，更新配置...');
      
      // 更新现有权限
      await sequelize.query(`
        UPDATE permissions 
        SET 
          name = '客户详情',
          type = 'menu',
          parent_id = ${parentId},
          path = '/teacher-center/customer-tracking/:id',
          component = 'pages/teacher-center/customer-tracking/detail.vue',
          permission = 'teacher:customer:detail',
          sort = 20,
          status = 1,
          updated_at = NOW()
        WHERE code = 'TEACHER_CUSTOMER_TRACKING_DETAIL'
      `);
      
      console.log('   ✅ 权限已更新\n');
    } else {
      console.log('   创建新的SOP详情页权限...');
      
      // 创建新权限
      await sequelize.query(`
        INSERT INTO permissions (name, code, type, parent_id, path, component, permission, sort, status, created_at, updated_at)
        VALUES ('客户详情', 'TEACHER_CUSTOMER_TRACKING_DETAIL', 'menu', ${parentId}, '/teacher-center/customer-tracking/:id', 'pages/teacher-center/customer-tracking/detail.vue', 'teacher:customer:detail', 20, 1, NOW(), NOW())
      `);
      
      console.log('   ✅ 权限已创建\n');
    }

    // 3. 获取详情页权限ID
    const detailPermission = await sequelize.query(
      `SELECT id FROM permissions WHERE code = 'TEACHER_CUSTOMER_TRACKING_DETAIL' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );
    
    const detailPermissionId = detailPermission[0].id;
    console.log(`   详情页权限ID: ${detailPermissionId}\n`);

    // 4. 查找教师角色
    console.log('📋 3. 查找教师角色...');
    const teacherRole = await sequelize.query(
      `SELECT id FROM roles WHERE code = 'teacher' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!teacherRole || teacherRole.length === 0) {
      console.log('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = teacherRole[0].id;
    console.log(`   ✅ 教师角色ID: ${teacherRoleId}\n`);

    // 5. 为教师角色分配详情页权限
    console.log('📋 4. 分配权限给教师角色...');
    await sequelize.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
      VALUES (${teacherRoleId}, ${detailPermissionId}, NOW(), NOW())
    `);
    console.log('   ✅ 权限已分配\n');

    // 6. 验证配置
    console.log('📋 5. 验证权限配置...');
    
    const verification = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.code,
        p.type,
        p.path,
        p.component,
        p.permission,
        p.parent_id,
        parent.name as parent_name,
        CASE WHEN rp.id IS NOT NULL THEN '✅ 已分配' ELSE '❌ 未分配' END as teacher_role
      FROM permissions p
      LEFT JOIN permissions parent ON p.parent_id = parent.id
      LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = ${teacherRoleId}
      WHERE p.code = 'TEACHER_CUSTOMER_TRACKING_DETAIL'
    `, { type: QueryTypes.SELECT });

    console.log('\n权限详情:');
    verification.forEach(perm => {
      console.log(`   名称: ${perm.name}`);
      console.log(`   代码: ${perm.code}`);
      console.log(`   类型: ${perm.type}`);
      console.log(`   路径: ${perm.path}`);
      console.log(`   组件: ${perm.component}`);
      console.log(`   权限标识: ${perm.permission}`);
      console.log(`   父级: ${perm.parent_name} (ID: ${perm.parent_id})`);
      console.log(`   教师角色: ${perm.teacher_role}`);
    });

    // 7. 检查所有客户跟踪相关权限
    console.log('\n📋 6. 所有客户跟踪权限:');
    const allPermissions = await sequelize.query(`
      SELECT 
        p.name,
        p.code,
        p.type,
        p.path,
        CASE WHEN rp.id IS NOT NULL THEN '✅' ELSE '❌' END as assigned
      FROM permissions p
      LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = ${teacherRoleId}
      WHERE p.code LIKE 'TEACHER_CUSTOMER_TRACKING%'
      ORDER BY p.sort
    `, { type: QueryTypes.SELECT });

    console.log('\n权限列表:');
    allPermissions.forEach(perm => {
      console.log(`   ${perm.assigned} ${perm.name} (${perm.code})`);
      if (perm.path) console.log(`      路径: ${perm.path}`);
    });

    console.log('\n✅ SOP详情页权限配置完成！');
    console.log('\n💡 提示:');
    console.log('   1. 请刷新浏览器页面');
    console.log('   2. 重新登录教师账号');
    console.log('   3. 访问: http://localhost:5173/teacher-center/customer-tracking/1');

  } catch (error) {
    console.error('❌ 配置失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行
addSOPDetailPermission()
  .then(() => {
    console.log('\n🎉 完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  });

