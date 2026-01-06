const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function addTeacherSidebarPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 1. 获取教师角色ID
    console.log('\n🔍 查找教师角色...');
    const [teacherRoleResult] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'teacher' AND deleted_at IS NULL
    `);

    if (!teacherRoleResult.length) {
      console.log('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = teacherRoleResult[0].id;
    console.log(`✅ 找到教师角色，ID: ${teacherRoleId}`);

    // 2. 查找所有教师中心相关的权限
    console.log('\n🔍 查找教师中心权限...');
    const [teacherPermissions] = await sequelize.query(`
      SELECT id, code, name, path FROM permissions
      WHERE (code LIKE 'TEACHER_%' OR path LIKE '/teacher-center/%')
      AND deleted_at IS NULL
      ORDER BY sort ASC
    `);

    console.log(`📊 找到 ${teacherPermissions.length} 个教师相关权限:`);
    teacherPermissions.forEach(p => {
      console.log(`  - ${p.code}: ${p.name} (${p.path})`);
    });

    // 3. 为教师角色分配权限
    console.log('\n🔧 开始为教师角色分配权限...');
    let addedCount = 0;
    let skippedCount = 0;

    for (const permission of teacherPermissions) {
      // 检查权限是否已经分配
      const [existingAssignment] = await sequelize.query(`
        SELECT id FROM role_permissions
        WHERE role_id = ${teacherRoleId} AND permission_id = ${permission.id}
        AND deleted_at IS NULL
      `);

      if (existingAssignment.length > 0) {
        console.log(`⏭️  权限 ${permission.code} 已存在，跳过`);
        skippedCount++;
        continue;
      }

      // 添加权限分配 (允许grantor_id为NULL)
      await sequelize.query(`
        INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)
        VALUES (${teacherRoleId}, ${permission.id}, NULL, NOW(), NOW())
      `);

      console.log(`✅ 添加权限: ${permission.code}`);
      addedCount++;
    }

    // 4. 验证结果
    console.log('\n📊 验证分配结果...');
    const [finalPermissions] = await sequelize.query(`
      SELECT p.code, p.name, p.path
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${teacherRoleId}
      AND (p.code LIKE 'TEACHER_%' OR p.path LIKE '/teacher-center/%')
      AND p.deleted_at IS NULL AND rp.deleted_at IS NULL
      ORDER BY p.sort ASC
    `);

    console.log(`\n🎉 权限分配完成！`);
    console.log(`- 新增权限: ${addedCount} 个`);
    console.log(`- 已存在权限: ${skippedCount} 个`);
    console.log(`- 总权限数: ${finalPermissions.length} 个`);

    console.log('\n📋 教师角色当前权限列表:');
    finalPermissions.forEach(p => {
      console.log(`  ✅ ${p.code}: ${p.name}`);
    });

    // 5. 特别检查侧边栏菜单权限
    console.log('\n🔍 检查侧边栏菜单权限...');
    const [sidebarPermissions] = await sequelize.query(`
      SELECT p.code, p.name, p.path, p.component
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${teacherRoleId}
      AND p.type = 'menu'
      AND p.deleted_at IS NULL AND rp.deleted_at IS NULL
      ORDER BY p.sort ASC
    `);

    console.log(`📱 教师侧边栏菜单权限 (${sidebarPermissions.length} 个):`);
    sidebarPermissions.forEach(p => {
      console.log(`  📋 ${p.code}: ${p.name}`);
      if (p.path) console.log(`     路径: ${p.path}`);
      if (p.component) console.log(`     组件: ${p.component}`);
    });

  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔚 数据库连接已关闭');
  }
}

addTeacherSidebarPermissions();