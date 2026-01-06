const mysql = require('mysql2');

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
});

console.log('🔄 开始综合权限配置检查...');

// 需要检查的页面权限
const requiredPages = [
  { name: 'AI助手页面', code: 'AI_ASSISTANT_USE', path: '/ai' },
  { name: 'AI助手页面', code: 'AI_ASSISTANT_VIEW', path: '/ai' },
  { name: 'AI助手页面', code: 'AI_ASSISTANT_ACCESS', path: '/ai' },
  { name: '班级管理页面', code: 'CLASS_MANAGEMENT', path: '/class' },
  { name: '班级管理页面', code: 'CLASS_VIEW', path: '/class' },
  { name: '班级管理页面', code: 'CLASS_LIST', path: '/class' },
  { name: '学生管理页面', code: 'STUDENT_MANAGEMENT', path: '/student' },
  { name: '学生管理页面', code: 'STUDENT_VIEW', path: '/student' },
  { name: '学生管理页面', code: 'STUDENT_LIST', path: '/student' },
  { name: '教师管理页面', code: 'TEACHER_MANAGEMENT', path: '/teacher' },
  { name: '教师管理页面', code: 'TEACHER_VIEW', path: '/teacher' },
  { name: '教师管理页面', code: 'TEACHER_LIST', path: '/teacher' },
  { name: '系统管理页面', code: 'SYSTEM_MANAGEMENT', path: '/system' },
  { name: '系统管理页面', code: 'SYSTEM_VIEW', path: '/system' },
  { name: '系统管理页面', code: 'SYSTEM_USERS', path: '/system/users' },
  { name: '系统管理页面', code: 'SYSTEM_ROLES', path: '/system/roles' },
  { name: '系统管理页面', code: 'SYSTEM_PERMISSIONS', path: '/system/permissions' },
  { name: '系统管理页面', code: 'SYSTEM_SETTINGS', path: '/system/settings' },
  { name: '系统管理页面', code: 'SYSTEM_LOGS', path: '/system/logs' },
  { name: '系统管理页面', code: 'SYSTEM_BACKUP', path: '/system/backup' }
];

function checkPermissions() {
  return new Promise((resolve, reject) => {
    // 1. 检查权限表中的权限
    connection.query('SELECT * FROM permissions ORDER BY sort ASC', (err, permissions) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n📋 数据库中的所有权限:');
      console.log(`📊 总计权限数量: ${permissions.length}`);
      
      // 按类型分组显示
      const groupedPermissions = {};
      permissions.forEach(p => {
        const type = p.type || 'other';
        if (!groupedPermissions[type]) {
          groupedPermissions[type] = [];
        }
        groupedPermissions[type].push(p);
      });
      
      Object.keys(groupedPermissions).forEach(type => {
        console.log(`\n🏷️  ${type.toUpperCase()} 类型权限 (${groupedPermissions[type].length}个):`);
        groupedPermissions[type].forEach(p => {
          console.log(`   - ${p.name} (${p.code}) - 路径: ${p.path || 'N/A'}`);
        });
      });
      
      // 检查必需的页面权限
      console.log('\n🔍 检查必需的页面权限:');
      const missingPermissions = [];
      
      requiredPages.forEach(required => {
        const found = permissions.find(p => 
          p.code === required.code || 
          (p.path && p.path.includes(required.path))
        );
        
        if (found) {
          console.log(`✅ ${required.name} - 权限 ${required.code} 已存在`);
        } else {
          console.log(`❌ ${required.name} - 权限 ${required.code} 缺失`);
          missingPermissions.push(required);
        }
      });
      
      if (missingPermissions.length > 0) {
        console.log('\n⚠️  缺失权限汇总:');
        missingPermissions.forEach(mp => {
          console.log(`   - ${mp.name}: ${mp.code} (路径: ${mp.path})`);
        });
      }
      
      resolve({ permissions, missingPermissions });
    });
  });
}

function checkRolePermissions() {
  return new Promise((resolve, reject) => {
    // 2. 检查角色权限分配
    const query = `
      SELECT 
        r.name as roleName,
        r.code as roleCode,
        COUNT(rp.permission_id) as permissionCount,
        GROUP_CONCAT(p.name ORDER BY p.sort ASC) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name, r.code
      ORDER BY r.name
    `;
    
    connection.query(query, (err, roleResults) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n🎭 角色权限分配:');
      roleResults.forEach(role => {
        console.log(`\n📋 ${role.roleName} (${role.roleCode}):`);
        console.log(`   权限数量: ${role.permissionCount}`);
        if (role.permissions) {
          const permissionList = role.permissions.split(',');
          permissionList.forEach(perm => {
            console.log(`   - ${perm.trim()}`);
          });
        } else {
          console.log(`   ⚠️  该角色没有分配任何权限`);
        }
      });
      
      resolve(roleResults);
    });
  });
}

function checkUserRoleAssignments() {
  return new Promise((resolve, reject) => {
    // 3. 检查用户角色分配
    const query = `
      SELECT 
        u.username,
        u.real_name,
        u.role as userRole,
        GROUP_CONCAT(r.name ORDER BY r.name ASC) as assignedRoles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id, u.username, u.real_name, u.role
      ORDER BY u.username
    `;
    
    connection.query(query, (err, userResults) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n👥 用户角色分配:');
      userResults.forEach(user => {
        console.log(`\n👤 ${user.username} (${user.real_name || '未设置真实姓名'}):`);
        console.log(`   用户角色字段: ${user.userRole || '未设置'}`);
        console.log(`   分配的角色: ${user.assignedRoles || '未分配角色'}`);
        
        if (!user.assignedRoles) {
          console.log(`   ⚠️  该用户没有分配任何角色`);
        }
      });
      
      resolve(userResults);
    });
  });
}

function checkTestData() {
  return new Promise((resolve, reject) => {
    // 4. 检查测试数据
    const queries = [
      { name: '用户数据', query: 'SELECT COUNT(*) as count FROM users' },
      { name: '角色数据', query: 'SELECT COUNT(*) as count FROM roles' },
      { name: '权限数据', query: 'SELECT COUNT(*) as count FROM permissions' },
      { name: '用户角色关联', query: 'SELECT COUNT(*) as count FROM user_roles' },
      { name: '角色权限关联', query: 'SELECT COUNT(*) as count FROM role_permissions' },
      { name: '学生数据', query: 'SELECT COUNT(*) as count FROM students' },
      { name: '教师数据', query: 'SELECT COUNT(*) as count FROM teachers' },
      { name: '班级数据', query: 'SELECT COUNT(*) as count FROM classes' },
      { name: '活动数据', query: 'SELECT COUNT(*) as count FROM activities' },
      { name: '招生计划', query: 'SELECT COUNT(*) as count FROM enrollment_plans' }
    ];
    
    console.log('\n📊 测试数据统计:');
    
    let completed = 0;
    const results = {};
    
    queries.forEach(({ name, query }) => {
      connection.query(query, (err, result) => {
        if (err) {
          console.log(`❌ ${name}: 查询失败 - ${err.message}`);
          results[name] = { count: 0, error: err.message };
        } else {
          const count = result[0].count;
          console.log(`📈 ${name}: ${count} 条记录`);
          results[name] = { count, error: null };
          
          if (count === 0) {
            console.log(`   ⚠️  ${name}数据为空，可能需要添加测试数据`);
          }
        }
        
        completed++;
        if (completed === queries.length) {
          resolve(results);
        }
      });
    });
  });
}

function checkSpecificUserPermissions() {
  return new Promise((resolve, reject) => {
    // 5. 检查特定用户的详细权限
    const query = `
      SELECT 
        u.username,
        u.real_name,
        p.name as permissionName,
        p.code as permissionCode,
        p.path as permissionPath,
        p.type as permissionType
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.role = 'admin' OR u.username = 'admin'
      ORDER BY u.username, p.sort ASC
    `;
    
    connection.query(query, (err, userPermissions) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n🔐 管理员用户权限详情:');
      
      if (userPermissions.length === 0) {
        console.log('❌ 没有找到管理员用户或管理员没有分配权限');
        resolve([]);
        return;
      }
      
      // 按用户分组
      const userGroups = {};
      userPermissions.forEach(up => {
        if (!userGroups[up.username]) {
          userGroups[up.username] = {
            realName: up.real_name,
            permissions: []
          };
        }
        userGroups[up.username].permissions.push(up);
      });
      
      Object.keys(userGroups).forEach(username => {
        const user = userGroups[username];
        console.log(`\n👤 ${username} (${user.realName || '未设置真实姓名'}):`);
        console.log(`   权限数量: ${user.permissions.length}`);
        
        // 检查关键页面权限
        const pagePermissions = {
          'AI助手': user.permissions.filter(p => p.permissionCode.includes('AI') || p.permissionName.includes('AI')),
          '班级管理': user.permissions.filter(p => p.permissionCode.includes('CLASS') || p.permissionName.includes('班级')),
          '学生管理': user.permissions.filter(p => p.permissionCode.includes('STUDENT') || p.permissionName.includes('学生')),
          '教师管理': user.permissions.filter(p => p.permissionCode.includes('TEACHER') || p.permissionName.includes('教师')),
          '系统管理': user.permissions.filter(p => p.permissionCode.includes('SYSTEM') || p.permissionName.includes('系统'))
        };
        
        Object.keys(pagePermissions).forEach(page => {
          const perms = pagePermissions[page];
          if (perms.length > 0) {
            console.log(`   ✅ ${page} (${perms.length}个权限):`);
            perms.forEach(p => {
              console.log(`      - ${p.permissionName} (${p.permissionCode})`);
            });
          } else {
            console.log(`   ❌ ${page}: 无相关权限`);
          }
        });
      });
      
      resolve(userPermissions);
    });
  });
}

async function main() {
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ 数据库连接成功!');
          resolve();
        }
      });
    });
    
    // 执行所有检查
    const permissionCheck = await checkPermissions();
    const roleCheck = await checkRolePermissions();
    const userCheck = await checkUserRoleAssignments();
    const testDataCheck = await checkTestData();
    const userPermissionCheck = await checkSpecificUserPermissions();
    
    // 生成总结报告
    console.log('\n' + '='.repeat(80));
    console.log('📋 综合权限配置检查报告');
    console.log('='.repeat(80));
    
    console.log('\n🔍 检查结果汇总:');
    console.log(`📊 权限总数: ${permissionCheck.permissions.length}`);
    console.log(`🎭 角色总数: ${roleCheck.length}`);
    console.log(`👥 用户总数: ${userCheck.length}`);
    console.log(`❌ 缺失权限: ${permissionCheck.missingPermissions.length}`);
    
    if (permissionCheck.missingPermissions.length > 0) {
      console.log('\n⚠️  需要添加的权限:');
      permissionCheck.missingPermissions.forEach(mp => {
        console.log(`   - ${mp.name}: ${mp.code} (路径: ${mp.path})`);
      });
      
      console.log('\n💡 建议执行以下SQL语句添加缺失权限:');
      permissionCheck.missingPermissions.forEach((mp, index) => {
        console.log(`INSERT INTO permissions (name, code, path, type, sort, created_at, updated_at) VALUES ('${mp.name}', '${mp.code}', '${mp.path}', 'page', ${100 + index}, NOW(), NOW());`);
      });
    } else {
      console.log('\n✅ 所有必需的页面权限都已配置完成！');
    }
    
    console.log('\n🎉 检查完成！');
    
  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error);
  } finally {
    connection.end();
  }
}

main();