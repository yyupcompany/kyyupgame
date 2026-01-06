#!/usr/bin/env ts-node
import { sequelize } from '../src/init';
import { QueryTypes } from 'sequelize';

/**
 * 为不同角色分配页面权限
 * Admin: 所有权限
 * Principal: 管理层权限 (约80-90个页面)
 * Teacher: 教学权限 (约40-50个页面)  
 * Parent: 家长权限 (约20-25个页面)
 */

// 园长权限页面关键词
const PRINCIPAL_KEYWORDS = [
  'dashboard', 'analytics', 'report', 'campus', 'overview',
  'teacher', 'student', 'class', 'enrollment', 'application',
  'activity', 'marketing', 'advertisement', 'ai', 'performance',
  'management', 'optimization', 'statistics', 'analysis'
];

// 教师权限页面关键词
const TEACHER_KEYWORDS = [
  'dashboard', 'class', 'student', 'activity', 'parent',
  'chat', 'consultation', 'evaluation', 'planner',
  'registration', 'smart', 'ai', 'assistant'
];

// 家长权限页面关键词  
const PARENT_KEYWORDS = [
  'dashboard', 'student', 'activity', 'application',
  'chat', 'consultation', 'notification', 'schedule',
  'ai', 'assistant', 'profile'
];

async function assignRolePermissions() {
  try {
    console.log('🚀 开始为角色分配权限...');
    
    // 1. 获取所有角色
    const roles = await sequelize.query(`
      SELECT id, name, code FROM roles WHERE deleted_at IS NULL
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 找到角色:', roles.map((r: any) => r.name).join(', '));
    
    // 2. 获取所有权限
    const permissions = await sequelize.query(`
      SELECT id, name, code, component, file_path, type, parent_id
      FROM permissions 
      WHERE status = 1
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 找到权限:', permissions.length, '个');
    
    // 3. 清理现有权限分配
    await sequelize.query(`DELETE FROM role_permissions`);
    console.log('🗑️  已清理现有权限分配');
    
    // 4. 为每个角色分配权限
    const rolePermissions: any[] = [];
    
    for (const role of roles as any[]) {
      let rolePermissionIds: number[] = [];
      
      if (role.code === 'admin') {
        // Admin获得所有权限
        rolePermissionIds = permissions.map((p: any) => p.id);
        console.log(`👑 Admin角色: ${rolePermissionIds.length}个权限`);
        
      } else if (role.code === 'principal') {
        // 园长权限: 管理层功能
        rolePermissionIds = permissions.filter((p: any) => {
          const text = `${p.name} ${p.code} ${p.component || ''}`.toLowerCase();
          return PRINCIPAL_KEYWORDS.some(keyword => text.includes(keyword)) ||
                 p.type === 'category' || // 所有分类
                 (p.type === 'menu' && p.parent_id === null); // 所有父级菜单
        }).map((p: any) => p.id);
        console.log(`🎯 Principal角色: ${rolePermissionIds.length}个权限`);
        
      } else if (role.code === 'teacher') {
        // 教师权限: 教学管理功能
        rolePermissionIds = permissions.filter((p: any) => {
          const text = `${p.name} ${p.code} ${p.component || ''}`.toLowerCase();
          return TEACHER_KEYWORDS.some(keyword => text.includes(keyword)) &&
                 !text.includes('admin') && !text.includes('system') &&
                 !text.includes('role') && !text.includes('permission');
        }).map((p: any) => p.id);
        console.log(`👨‍🏫 Teacher角色: ${rolePermissionIds.length}个权限`);
        
      } else if (role.code === 'parent') {
        // 家长权限: 查看和互动功能
        rolePermissionIds = permissions.filter((p: any) => {
          const text = `${p.name} ${p.code} ${p.component || ''}`.toLowerCase();
          return PARENT_KEYWORDS.some(keyword => text.includes(keyword)) &&
                 !text.includes('edit') && !text.includes('create') &&
                 !text.includes('delete') && !text.includes('manage') &&
                 !text.includes('admin') && !text.includes('system');
        }).map((p: any) => p.id);
        console.log(`👨‍👩‍👧‍👦 Parent角色: ${rolePermissionIds.length}个权限`);
      }
      
      // 生成权限分配记录
      rolePermissionIds.forEach(permissionId => {
        rolePermissions.push({
          role_id: role.id,
          permission_id: permissionId,
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    }
    
    // 5. 批量插入权限分配
    if (rolePermissions.length > 0) {
      await sequelize.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES ${rolePermissions.map(() => '(?, ?, ?, ?)').join(', ')}
      `, {
        replacements: rolePermissions.flatMap(rp => [rp.role_id, rp.permission_id, rp.created_at, rp.updated_at]),
        type: QueryTypes.INSERT
      });
    }
    
    console.log('✅ 权限分配完成!');
    console.log('📊 总共分配:', rolePermissions.length, '个权限关联');
    
    // 6. 验证权限分配
    const summary = await sequelize.query(`
      SELECT 
        r.name as role_name,
        COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE r.deleted_at IS NULL
      GROUP BY r.id, r.name
      ORDER BY permission_count DESC
    `, { type: QueryTypes.SELECT });
    
    console.log('📈 权限分配汇总:');
    (summary as any[]).forEach(s => {
      console.log(`  ${s.role_name}: ${s.permission_count}个权限`);
    });
    
  } catch (error) {
    console.error('❌ 权限分配失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行脚本
if (require.main === module) {
  assignRolePermissions()
    .then(() => {
      console.log('🎉 权限分配脚本执行完成!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 脚本执行失败:', error);
      process.exit(1);
    });
}

export { assignRolePermissions };