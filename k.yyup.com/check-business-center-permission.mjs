/**
 * 检查并添加业务中心权限
 */

import { Sequelize } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize('kindergarten_management', 'root', 'root123', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false
});

async function checkAndAddPermission() {
  try {
    console.log('🔍 检查业务中心权限...\n');
    
    // 1. 检查BUSINESS_CENTER_VIEW权限是否存在
    const [permissions] = await sequelize.query(`
      SELECT id, name, code, path, status 
      FROM permissions 
      WHERE code = 'BUSINESS_CENTER_VIEW'
    `);
    
    if (permissions.length > 0) {
      console.log('✅ 找到BUSINESS_CENTER_VIEW权限:');
      console.log(permissions[0]);
      console.log('');
      
      const permissionId = permissions[0].id;
      
      // 2. 检查admin角色是否有这个权限
      const [rolePermissions] = await sequelize.query(`
        SELECT rp.*, r.name as role_name 
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.id
        WHERE rp.permission_id = ${permissionId}
      `);
      
      if (rolePermissions.length > 0) {
        console.log('✅ 以下角色拥有此权限:');
        rolePermissions.forEach(rp => {
          console.log(`   - ${rp.role_name} (role_id: ${rp.role_id})`);
        });
        console.log('');
      } else {
        console.log('⚠️  没有角色拥有此权限！');
        console.log('');
        
        // 3. 获取admin角色ID
        const [adminRoles] = await sequelize.query(`
          SELECT id, name FROM roles WHERE code = 'ADMIN' OR name = '系统管理员'
        `);
        
        if (adminRoles.length > 0) {
          const adminRoleId = adminRoles[0].id;
          console.log(`📝 为admin角色 (id: ${adminRoleId}) 添加权限...`);
          
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (${adminRoleId}, ${permissionId}, NOW(), NOW())
            ON DUPLICATE KEY UPDATE updated_at = NOW()
          `);
          
          console.log('✅ 权限添加成功！');
        } else {
          console.log('❌ 未找到admin角色');
        }
      }
      
      // 4. 检查用户角色分配
      const [userRoles] = await sequelize.query(`
        SELECT ur.*, u.username, r.name as role_name
        FROM user_roles ur
        JOIN users u ON ur.user_id = u.id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.username = 'admin'
      `);
      
      if (userRoles.length > 0) {
        console.log('\n✅ admin用户的角色:');
        userRoles.forEach(ur => {
          console.log(`   - ${ur.role_name} (role_id: ${ur.role_id})`);
        });
      } else {
        console.log('\n⚠️  admin用户没有分配角色');
      }
      
    } else {
      console.log('❌ 未找到BUSINESS_CENTER_VIEW权限');
      console.log('📝 创建权限...\n');
      
      // 创建权限
      await sequelize.query(`
        INSERT INTO permissions (name, code, path, type, status, created_at, updated_at)
        VALUES ('业务中心查看', 'BUSINESS_CENTER_VIEW', '/centers/business', 'page', 1, NOW(), NOW())
      `);
      
      console.log('✅ 权限创建成功！');
      
      // 获取新创建的权限ID
      const [newPermissions] = await sequelize.query(`
        SELECT id FROM permissions WHERE code = 'BUSINESS_CENTER_VIEW'
      `);
      
      if (newPermissions.length > 0) {
        const permissionId = newPermissions[0].id;
        
        // 获取admin角色
        const [adminRoles] = await sequelize.query(`
          SELECT id FROM roles WHERE code = 'ADMIN' OR name = '系统管理员'
        `);
        
        if (adminRoles.length > 0) {
          const adminRoleId = adminRoles[0].id;
          
          // 分配权限给admin角色
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (${adminRoleId}, ${permissionId}, NOW(), NOW())
          `);
          
          console.log('✅ 权限已分配给admin角色！');
        }
      }
    }
    
    // 5. 检查所有业务相关权限
    console.log('\n📋 所有业务相关权限:');
    const [allBusinessPermissions] = await sequelize.query(`
      SELECT id, name, code, path, status 
      FROM permissions 
      WHERE code LIKE '%BUSINESS%' OR name LIKE '%业务%'
      ORDER BY id
    `);
    
    if (allBusinessPermissions.length > 0) {
      allBusinessPermissions.forEach(p => {
        console.log(`   - ${p.name} (${p.code}): ${p.path} [状态: ${p.status === 1 ? '启用' : '禁用'}]`);
      });
    } else {
      console.log('   未找到业务相关权限');
    }
    
    console.log('\n✅ 检查完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAndAddPermission();

