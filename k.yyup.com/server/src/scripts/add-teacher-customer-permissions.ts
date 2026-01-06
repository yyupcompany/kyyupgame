#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function addTeacherCustomerPermissions() {
  try {
    console.log('🔄 开始为教师角色添加客户池中心权限...');
    
    // 查找教师角色
    const [teacherRole] = await sequelize.query(
      'SELECT id FROM roles WHERE code = "teacher" LIMIT 1'
    );
    
    if (!teacherRole || teacherRole.length === 0) {
      console.log('❌ 未找到教师角色');
      return;
    }
    
    const teacherRoleId = (teacherRole as any)[0].id;
    console.log('✅ 找到教师角色ID:', teacherRoleId);
    
    // 查找客户池中心相关权限
    const [permissions] = await sequelize.query(
      'SELECT id, name, path FROM permissions WHERE path LIKE "/centers/customer-pool%" OR name LIKE "%客户池%" OR name LIKE "%客户管理%"'
    );
    
    console.log('📋 找到客户池相关权限:', permissions.length);
    (permissions as any[]).forEach(p => console.log('  -', p.name, ':', p.path));
    
    // 为教师角色添加权限
    for (const permission of permissions as any[]) {
      try {
        await sequelize.query(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          { replacements: [teacherRoleId, permission.id] }
        );
        console.log('✅ 已添加权限:', permission.name);
      } catch (error) {
        console.log('⚠️ 权限可能已存在:', permission.name);
      }
    }
    
    console.log('🎉 教师角色客户池权限添加完成！');
    
  } catch (error) {
    console.error('❌ 添加权限失败:', error);
  } finally {
    process.exit(0);
  }
}

addTeacherCustomerPermissions();
