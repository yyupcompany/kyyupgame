const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
});

console.log('🔍 快速权限配置检查');

async function quickCheck() {
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查关键页面权限
    console.log('\n📋 1. 检查关键页面权限');
    const keyPermissions = await new Promise((resolve, reject) => {
      const query = `
        SELECT name, code, path, type 
        FROM permissions 
        WHERE code IN ('AI_ASSISTANT_USE', 'CLASS_MANAGE', 'STUDENT_MANAGE', 'TEACHER_MANAGE', 'SYSTEM_MANAGE')
           OR code LIKE '%AI%'
           OR code LIKE '%CLASS%'
           OR code LIKE '%STUDENT%'
           OR code LIKE '%TEACHER%'
           OR code LIKE '%SYSTEM%'
        ORDER BY code
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`找到 ${keyPermissions.length} 个相关权限:`);
    keyPermissions.forEach(p => {
      console.log(`✓ ${p.name} (${p.code}) - 路径: ${p.path || 'N/A'}`);
    });
    
    // 2. 检查核心角色权限分配
    console.log('\n🎭 2. 检查核心角色权限分配');
    const coreRoles = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          r.name as roleName,
          r.code as roleCode,
          COUNT(rp.permission_id) as permissionCount
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        WHERE r.code IN ('admin', 'principal', 'teacher', 'parent')
        GROUP BY r.id, r.name, r.code
        ORDER BY r.code
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    coreRoles.forEach(role => {
      console.log(`• ${role.roleName} (${role.roleCode}): ${role.permissionCount} 个权限`);
    });
    
    // 3. 检查用户角色分配
    console.log('\n👥 3. 检查用户角色分配');
    const userRoles = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          u.username,
          u.real_name,
          r.name as roleName,
          r.code as roleCode
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.code IN ('admin', 'principal', 'teacher', 'parent')
        ORDER BY u.username, r.code
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    const userRoleMap = {};
    userRoles.forEach(ur => {
      if (!userRoleMap[ur.username]) {
        userRoleMap[ur.username] = {
          realName: ur.real_name,
          roles: []
        };
      }
      userRoleMap[ur.username].roles.push(ur.roleCode);
    });
    
    Object.keys(userRoleMap).forEach(username => {
      const user = userRoleMap[username];
      console.log(`• ${username} (${user.realName || '未设置'}): ${user.roles.join(', ')}`);
    });
    
    // 4. 检查测试数据量
    console.log('\n📊 4. 检查测试数据量');
    const dataCounts = await new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as count FROM users',
        'SELECT COUNT(*) as count FROM roles',
        'SELECT COUNT(*) as count FROM permissions',
        'SELECT COUNT(*) as count FROM user_roles',
        'SELECT COUNT(*) as count FROM role_permissions'
      ];
      
      const results = {};
      let completed = 0;
      
      queries.forEach((query, index) => {
        connection.query(query, (err, result) => {
          if (!err) {
            const tableName = ['users', 'roles', 'permissions', 'user_roles', 'role_permissions'][index];
            results[tableName] = result[0].count;
          }
          completed++;
          if (completed === queries.length) {
            resolve(results);
          }
        });
      });
    });
    
    console.log(`• 用户数据: ${dataCounts.users || 0} 条`);
    console.log(`• 角色数据: ${dataCounts.roles || 0} 条`);
    console.log(`• 权限数据: ${dataCounts.permissions || 0} 条`);
    console.log(`• 用户角色关联: ${dataCounts.user_roles || 0} 条`);
    console.log(`• 角色权限关联: ${dataCounts.role_permissions || 0} 条`);
    
    // 5. 检查管理员权限
    console.log('\n🔐 5. 检查管理员权限');
    const adminPermissions = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.name as permissionName,
          p.code as permissionCode,
          p.path as permissionPath
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE r.code = 'admin'
        AND (p.code LIKE '%AI%' OR p.code LIKE '%CLASS%' OR p.code LIKE '%STUDENT%' OR p.code LIKE '%TEACHER%' OR p.code LIKE '%SYSTEM%')
        ORDER BY p.code
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (adminPermissions.length > 0) {
      console.log(`管理员具有 ${adminPermissions.length} 个关键权限:`);
      
      const permissionGroups = {
        'AI权限': adminPermissions.filter(p => p.permissionCode.includes('AI')),
        '班级权限': adminPermissions.filter(p => p.permissionCode.includes('CLASS')),
        '学生权限': adminPermissions.filter(p => p.permissionCode.includes('STUDENT')),
        '教师权限': adminPermissions.filter(p => p.permissionCode.includes('TEACHER')),
        '系统权限': adminPermissions.filter(p => p.permissionCode.includes('SYSTEM'))
      };
      
      Object.keys(permissionGroups).forEach(group => {
        const perms = permissionGroups[group];
        if (perms.length > 0) {
          console.log(`  ${group}: ${perms.length} 个`);
          perms.forEach(p => {
            console.log(`    - ${p.permissionName} (${p.permissionCode})`);
          });
        }
      });
    } else {
      console.log('❌ 管理员没有关键权限或未找到管理员用户');
    }
    
    // 6. 总结和建议
    console.log('\n' + '='.repeat(60));
    console.log('📋 检查总结');
    console.log('='.repeat(60));
    
    // 检查是否有足够的权限
    const hasAI = keyPermissions.some(p => p.code.includes('AI'));
    const hasClass = keyPermissions.some(p => p.code.includes('CLASS'));
    const hasStudent = keyPermissions.some(p => p.code.includes('STUDENT'));
    const hasTeacher = keyPermissions.some(p => p.code.includes('TEACHER'));
    const hasSystem = keyPermissions.some(p => p.code.includes('SYSTEM'));
    
    console.log(`✅ AI助手权限: ${hasAI ? '已配置' : '❌ 缺失'}`);
    console.log(`✅ 班级管理权限: ${hasClass ? '已配置' : '❌ 缺失'}`);
    console.log(`✅ 学生管理权限: ${hasStudent ? '已配置' : '❌ 缺失'}`);
    console.log(`✅ 教师管理权限: ${hasTeacher ? '已配置' : '❌ 缺失'}`);
    console.log(`✅ 系统管理权限: ${hasSystem ? '已配置' : '❌ 缺失'}`);
    
    const hasData = dataCounts.users > 0 && dataCounts.roles > 0 && dataCounts.permissions > 0;
    console.log(`✅ 测试数据: ${hasData ? '充足' : '❌ 不足'}`);
    
    const hasAdmin = coreRoles.some(r => r.roleCode === 'admin' && r.permissionCount > 0);
    console.log(`✅ 管理员配置: ${hasAdmin ? '已配置' : '❌ 缺失'}`);
    
    if (hasAI && hasClass && hasStudent && hasTeacher && hasSystem && hasData && hasAdmin) {
      console.log('\n🎉 权限系统配置完整！');
    } else {
      console.log('\n⚠️  权限系统需要完善，建议检查缺失项');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    connection.end();
  }
}

quickCheck();