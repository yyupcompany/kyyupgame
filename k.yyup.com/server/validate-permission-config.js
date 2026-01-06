const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
});

console.log('🔍 权限配置验证检查');

// 必需的页面权限配置
const requiredPagePermissions = {
  'AI助手页面': [
    'AI_ASSISTANT_USE',
    'AI_WORKSPACE_USE',
    'AI_EXPERT_CONSULTATION',
    'AI_ACTIVITY_PLANNER'
  ],
  '班级管理页面': [
    'CLASS_MANAGE',
    'CLASS_VIEW'
  ],
  '学生管理页面': [
    'STUDENT_MANAGE',
    'STUDENT_VIEW'
  ],
  '教师管理页面': [
    'TEACHER_MANAGE'
  ],
  '系统管理页面': [
    'SYSTEM_SETTINGS',
    'SYSTEM_LOG_VIEW',
    'SYSTEM_BACKUP'
  ]
};

// 核心角色配置
const coreRoles = ['admin', 'principal', 'teacher', 'parent'];

async function validatePermissionConfig() {
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ 数据库连接成功');
    
    let validationPassed = true;
    const issues = [];
    
    // 1. 验证必需的页面权限
    console.log('\n🔍 验证必需的页面权限...');
    
    for (const [pageName, permissions] of Object.entries(requiredPagePermissions)) {
      console.log(`\n📋 检查 ${pageName}:`);
      
      for (const permissionCode of permissions) {
        const permission = await new Promise((resolve, reject) => {
          const query = 'SELECT id, name, code, path FROM permissions WHERE code = ?';
          connection.query(query, [permissionCode], (err, results) => {
            if (err) reject(err);
            else resolve(results[0]);
          });
        });
        
        if (permission) {
          console.log(`  ✅ ${permissionCode} - ${permission.name} (路径: ${permission.path || 'N/A'})`);
        } else {
          console.log(`  ❌ ${permissionCode} - 缺失`);
          validationPassed = false;
          issues.push(`缺失权限: ${permissionCode} (${pageName})`);
        }
      }
    }
    
    // 2. 验证核心角色配置
    console.log('\n🎭 验证核心角色配置...');
    
    for (const roleCode of coreRoles) {
      const role = await new Promise((resolve, reject) => {
        const query = `
          SELECT r.id, r.name, r.code, COUNT(rp.permission_id) as permission_count
          FROM roles r
          LEFT JOIN role_permissions rp ON r.id = rp.role_id
          WHERE r.code = ?
          GROUP BY r.id, r.name, r.code
        `;
        
        connection.query(query, [roleCode], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });
      
      if (role) {
        console.log(`  ✅ ${roleCode} - ${role.name} (${role.permission_count}个权限)`);
        
        // 验证管理员权限
        if (roleCode === 'admin' && role.permission_count === 0) {
          validationPassed = false;
          issues.push(`管理员角色没有分配任何权限`);
        }
      } else {
        console.log(`  ❌ ${roleCode} - 角色不存在`);
        validationPassed = false;
        issues.push(`缺失核心角色: ${roleCode}`);
      }
    }
    
    // 3. 验证用户角色分配
    console.log('\n👥 验证用户角色分配...');
    
    const userRoleAssignments = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          u.username,
          u.real_name,
          r.code as role_code,
          r.name as role_name
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.code IN ('admin', 'principal', 'teacher', 'parent')
        ORDER BY u.username
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    const userRoleMap = {};
    userRoleAssignments.forEach(assignment => {
      if (!userRoleMap[assignment.username]) {
        userRoleMap[assignment.username] = [];
      }
      userRoleMap[assignment.username].push(assignment.role_code);
    });
    
    console.log(`找到 ${Object.keys(userRoleMap).length} 个用户有角色分配:`);
    
    // 验证是否有管理员用户
    const adminUsers = Object.keys(userRoleMap).filter(username => 
      userRoleMap[username].includes('admin')
    );
    
    if (adminUsers.length > 0) {
      console.log(`  ✅ 找到 ${adminUsers.length} 个管理员用户: ${adminUsers.join(', ')}`);
    } else {
      console.log(`  ❌ 没有找到管理员用户`);
      validationPassed = false;
      issues.push('没有分配管理员角色的用户');
    }
    
    // 4. 验证权限路径配置
    console.log('\n🛣️  验证权限路径配置...');
    
    const permissionsWithoutPath = await new Promise((resolve, reject) => {
      const query = `
        SELECT name, code 
        FROM permissions 
        WHERE (path IS NULL OR path = '') 
        AND type = 'MENU'
        ORDER BY name
      `;
      
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (permissionsWithoutPath.length > 0) {
      console.log(`  ⚠️  找到 ${permissionsWithoutPath.length} 个没有路径的菜单权限:`);
      permissionsWithoutPath.forEach(perm => {
        console.log(`    - ${perm.name} (${perm.code})`);
      });
      issues.push(`${permissionsWithoutPath.length} 个权限缺少路径配置`);
    } else {
      console.log(`  ✅ 所有菜单权限都已配置路径`);
    }
    
    // 5. 验证数据完整性
    console.log('\n📊 验证数据完整性...');
    
    const dataCounts = await new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as count FROM users',
        'SELECT COUNT(*) as count FROM roles WHERE code IN ("admin", "principal", "teacher", "parent")',
        'SELECT COUNT(*) as count FROM permissions WHERE type IN ("MENU", "BUTTON")',
        'SELECT COUNT(*) as count FROM user_roles',
        'SELECT COUNT(*) as count FROM role_permissions'
      ];
      
      const results = {};
      let completed = 0;
      
      queries.forEach((query, index) => {
        connection.query(query, (err, result) => {
          if (!err) {
            const names = ['users', 'coreRoles', 'validPermissions', 'userRoles', 'rolePermissions'];
            results[names[index]] = result[0].count;
          }
          completed++;
          if (completed === queries.length) {
            resolve(results);
          }
        });
      });
    });
    
    console.log(`• 用户数据: ${dataCounts.users || 0} 条`);
    console.log(`• 核心角色: ${dataCounts.coreRoles || 0} 条`);
    console.log(`• 有效权限: ${dataCounts.validPermissions || 0} 条`);
    console.log(`• 用户角色关联: ${dataCounts.userRoles || 0} 条`);
    console.log(`• 角色权限关联: ${dataCounts.rolePermissions || 0} 条`);
    
    // 验证数据量是否合理
    if (dataCounts.users < 5) {
      issues.push('用户数据过少，建议添加更多测试用户');
    }
    
    if (dataCounts.coreRoles < 4) {
      validationPassed = false;
      issues.push('核心角色不完整，缺少必需角色');
    }
    
    if (dataCounts.userRoles < 5) {
      issues.push('用户角色分配过少，建议为更多用户分配角色');
    }
    
    if (dataCounts.rolePermissions < 20) {
      validationPassed = false;
      issues.push('角色权限分配过少，核心角色需要更多权限');
    }
    
    // 6. 生成验证报告
    console.log('\n' + '='.repeat(60));
    console.log('📋 权限配置验证报告');
    console.log('='.repeat(60));
    
    if (validationPassed) {
      console.log('✅ 权限配置验证通过！');
      console.log('\n🎉 权限系统已正确配置，可以正常使用。');
    } else {
      console.log('❌ 权限配置验证失败！');
      console.log('\n发现以下问题:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    if (issues.length > 0 && validationPassed) {
      console.log('\n⚠️  建议改进:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n📊 配置概览:');
    console.log(`• AI助手页面权限: ${requiredPagePermissions['AI助手页面'].length} 个`);
    console.log(`• 班级管理页面权限: ${requiredPagePermissions['班级管理页面'].length} 个`);
    console.log(`• 学生管理页面权限: ${requiredPagePermissions['学生管理页面'].length} 个`);
    console.log(`• 教师管理页面权限: ${requiredPagePermissions['教师管理页面'].length} 个`);
    console.log(`• 系统管理页面权限: ${requiredPagePermissions['系统管理页面'].length} 个`);
    console.log(`• 核心角色: ${coreRoles.length} 个`);
    console.log(`• 管理员用户: ${adminUsers.length} 个`);
    
    return {
      passed: validationPassed,
      issues: issues,
      dataCounts: dataCounts
    };
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
    return {
      passed: false,
      issues: [`验证过程出错: ${error.message}`],
      dataCounts: {}
    };
  } finally {
    connection.end();
  }
}

// 如果直接运行脚本，执行验证
if (require.main === module) {
  validatePermissionConfig().then(result => {
    if (result.passed) {
      console.log('\n🎉 权限系统验证通过！');
      process.exit(0);
    } else {
      console.log('\n❌ 权限系统验证失败！');
      process.exit(1);
    }
  });
}

module.exports = { validatePermissionConfig };