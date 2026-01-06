/**
 * 查询远程数据库中的业务中心权限
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

// 远程数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function queryPermissions() {
  try {
    console.log('🔗 连接远程数据库...');
    console.log(`   主机: ${process.env.DB_HOST || 'dbconn.sealoshzh.site'}`);
    console.log(`   端口: ${process.env.DB_PORT || '43906'}`);
    console.log(`   数据库: ${process.env.DB_NAME || 'kargerdensales'}\n`);
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 1. 查询BUSINESS_CENTER_VIEW权限
    console.log('📋 步骤1: 查询BUSINESS_CENTER_VIEW权限');
    console.log('='.repeat(60));
    const [permissions] = await sequelize.query(`
      SELECT id, name, code, path, type, status, created_at, updated_at
      FROM permissions 
      WHERE code = 'BUSINESS_CENTER_VIEW'
    `);
    
    if (permissions.length > 0) {
      console.log('✅ 找到权限记录:');
      permissions.forEach(p => {
        console.log(`   ID: ${p.id}`);
        console.log(`   名称: ${p.name}`);
        console.log(`   代码: ${p.code}`);
        console.log(`   路径: ${p.path}`);
        console.log(`   类型: ${p.type}`);
        console.log(`   状态: ${p.status === 1 ? '✅ 启用' : '❌ 禁用'}`);
        console.log(`   创建时间: ${p.created_at}`);
        console.log(`   更新时间: ${p.updated_at}`);
      });
      
      const permissionId = permissions[0].id;
      
      // 2. 查询哪些角色有这个权限
      console.log('\n📋 步骤2: 查询拥有此权限的角色');
      console.log('='.repeat(60));
      const [rolePermissions] = await sequelize.query(`
        SELECT rp.*, r.id as role_id, r.name as role_name, r.code as role_code
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.id
        WHERE rp.permission_id = ${permissionId}
      `);
      
      if (rolePermissions.length > 0) {
        console.log(`✅ 找到 ${rolePermissions.length} 个角色拥有此权限:`);
        rolePermissions.forEach(rp => {
          console.log(`   - ${rp.role_name} (${rp.role_code}) [ID: ${rp.role_id}]`);
        });
      } else {
        console.log('❌ 没有角色拥有此权限！');
        console.log('   这就是问题所在 - 需要为角色分配权限');
      }
      
    } else {
      console.log('❌ 未找到BUSINESS_CENTER_VIEW权限记录');
      console.log('   权限记录不存在，需要创建');
    }
    
    // 3. 查询所有业务相关权限
    console.log('\n📋 步骤3: 查询所有业务相关权限');
    console.log('='.repeat(60));
    const [allBusinessPerms] = await sequelize.query(`
      SELECT id, name, code, path, status
      FROM permissions 
      WHERE code LIKE '%BUSINESS%' OR name LIKE '%业务%'
      ORDER BY id
    `);
    
    if (allBusinessPerms.length > 0) {
      console.log(`✅ 找到 ${allBusinessPerms.length} 个业务相关权限:`);
      allBusinessPerms.forEach(p => {
        const statusIcon = p.status === 1 ? '✅' : '❌';
        console.log(`   ${statusIcon} ${p.name} (${p.code})`);
        console.log(`      路径: ${p.path || '无'}`);
      });
    } else {
      console.log('⚠️  未找到任何业务相关权限');
    }
    
    // 4. 查询admin和principal角色
    console.log('\n📋 步骤4: 查询admin和principal角色');
    console.log('='.repeat(60));
    const [roles] = await sequelize.query(`
      SELECT id, name, code, status
      FROM roles 
      WHERE code IN ('ADMIN', 'PRINCIPAL') OR name IN ('系统管理员', '园长')
      ORDER BY id
    `);
    
    if (roles.length > 0) {
      console.log(`✅ 找到 ${roles.length} 个角色:`);
      for (const role of roles) {
        console.log(`\n   角色: ${role.name} (${role.code}) [ID: ${role.id}]`);
        console.log(`   状态: ${role.status === 1 ? '✅ 启用' : '❌ 禁用'}`);
        
        // 查询该角色的所有权限
        const [rolePerms] = await sequelize.query(`
          SELECT p.code, p.name
          FROM role_permissions rp
          JOIN permissions p ON rp.permission_id = p.id
          WHERE rp.role_id = ${role.id} AND p.code LIKE '%CENTER%'
          ORDER BY p.code
        `);
        
        if (rolePerms.length > 0) {
          console.log(`   中心权限 (${rolePerms.length}个):`);
          rolePerms.forEach(p => {
            console.log(`      - ${p.name} (${p.code})`);
          });
        } else {
          console.log(`   ⚠️  没有中心相关权限`);
        }
      }
    } else {
      console.log('❌ 未找到admin或principal角色');
    }
    
    // 5. 查询admin用户的角色分配
    console.log('\n📋 步骤5: 查询admin用户的角色分配');
    console.log('='.repeat(60));
    const [userRoles] = await sequelize.query(`
      SELECT u.id as user_id, u.username, r.id as role_id, r.name as role_name, r.code as role_code
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.username = 'admin'
    `);
    
    if (userRoles.length > 0) {
      console.log(`✅ admin用户拥有 ${userRoles.length} 个角色:`);
      userRoles.forEach(ur => {
        console.log(`   - ${ur.role_name} (${ur.role_code}) [角色ID: ${ur.role_id}]`);
      });
    } else {
      console.log('❌ admin用户没有分配任何角色');
    }
    
    // 6. 检查是否需要添加权限
    console.log('\n📋 步骤6: 权限修复建议');
    console.log('='.repeat(60));
    
    if (permissions.length === 0) {
      console.log('❌ 问题: BUSINESS_CENTER_VIEW权限不存在');
      console.log('✅ 解决: 需要创建权限记录');
      console.log('\n   执行SQL:');
      console.log(`   INSERT INTO permissions (name, code, path, type, status, created_at, updated_at)`);
      console.log(`   VALUES ('业务中心查看', 'BUSINESS_CENTER_VIEW', '/centers/business', 'page', 1, NOW(), NOW());`);
    } else if (rolePermissions && rolePermissions.length === 0) {
      console.log('❌ 问题: 权限存在但没有分配给任何角色');
      console.log('✅ 解决: 需要为admin和principal角色分配权限');
      
      if (roles.length > 0) {
        console.log('\n   执行SQL:');
        roles.forEach(role => {
          console.log(`   INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)`);
          console.log(`   VALUES (${role.id}, ${permissions[0].id}, NOW(), NOW());`);
        });
      }
    } else {
      console.log('✅ 权限配置正常');
      console.log('   如果仍然无法访问，请检查:');
      console.log('   1. 用户是否已登录');
      console.log('   2. Token是否有效');
      console.log('   3. 前端路由守卫逻辑');
      console.log('   4. 清除浏览器缓存和localStorage');
    }
    
    console.log('\n✅ 查询完成！');
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.original) {
      console.error('   详细错误:', error.original.message);
    }
  } finally {
    await sequelize.close();
    console.log('\n👋 数据库连接已关闭');
  }
}

queryPermissions();

