import { QueryInterface } from 'sequelize';
import bcrypt from 'bcryptjs';

// 生成密码哈希（使用bcrypt，与登录认证一致）
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 检查是否存在admin角色，如果不存在则创建
    const [existingRoles] = await queryInterface.sequelize.query('SELECT * FROM roles WHERE code = "admin"');
    let adminRoleId = 1;
    
    if (existingRoles.length === 0) {
      await queryInterface.bulkInsert('roles', [{
        name: '超级管理员',
        code: 'admin',
        description: '系统超级管理员，拥有所有权限',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }]);
      console.log('✅ 创建admin角色');
    } else {
      adminRoleId = (existingRoles[0] as any).id;
      console.log('ℹ️  admin角色已存在，ID:', adminRoleId);
    }

    // 分批次添加权限以处理外键约束
    // 第一批：父级权限
    const parentPermissions = [
      {
        name: '仪表板',
        code: 'dashboard',
        type: 'menu',
        parent_id: null,
        path: '/dashboard',
        component: 'pages/dashboard/index.vue',
        permission: null,
        icon: 'dashboard',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '系统管理',
        code: 'system',
        type: 'menu',
        parent_id: null,
        path: '/system',
        component: 'Layout',
        permission: null,
        icon: 'setting',
        sort: 90,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '用户管理',
        code: 'user',
        type: 'menu',
        parent_id: null,
        path: '/user',
        component: 'Layout',
        permission: null,
        icon: 'user',
        sort: 10,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '招生管理',
        code: 'enrollment',
        type: 'menu',
        parent_id: null,
        path: '/enrollment',
        component: 'Layout',
        permission: null,
        icon: 'enrollment',
        sort: 20,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '活动管理',
        code: 'activity',
        type: 'menu',
        parent_id: null,
        path: '/activity',
        component: 'pages/activity/index.vue',
        permission: null,
        icon: 'activity',
        sort: 30,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // 添加父级权限
    const parentPermissionsToAdd = [];
    for (const permission of parentPermissions) {
      const [existing] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code = '${permission.code}'`);
      if (existing.length === 0) {
        parentPermissionsToAdd.push(permission);
      }
    }

    if (parentPermissionsToAdd.length > 0) {
      await queryInterface.bulkInsert('permissions', parentPermissionsToAdd);
      console.log(`✅ 添加了${parentPermissionsToAdd.length}个父级权限`);
    }

    // 获取父级权限的实际ID
    const [systemPermission] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code = 'system'`);
    const [userPermission] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code = 'user'`);
    const [enrollmentPermission] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code = 'enrollment'`);
    
    const systemId = systemPermission.length > 0 ? (systemPermission[0] as any).id : null;
    const userId = userPermission.length > 0 ? (userPermission[0] as any).id : null;
    const enrollmentId = enrollmentPermission.length > 0 ? (enrollmentPermission[0] as any).id : null;

    // 第二批：子级权限
    const childPermissions = [
      {
        name: '学生管理',
        code: 'user:student',
        type: 'menu',
        parent_id: userId,
        path: 'student',
        component: 'pages/student/index.vue',
        permission: null,
        icon: 'student',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '教师管理',
        code: 'user:teacher',
        type: 'menu',
        parent_id: userId,
        path: 'teacher',
        component: 'pages/teacher/index.vue',
        permission: null,
        icon: 'teacher',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '家长管理',
        code: 'user:parent',
        type: 'menu',
        parent_id: userId,
        path: 'parent',
        component: 'pages/parent/index.vue',
        permission: null,
        icon: 'parent',
        sort: 3,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '班级管理',
        code: 'user:class',
        type: 'menu',
        parent_id: userId,
        path: 'class',
        component: 'pages/class/index.vue',
        permission: null,
        icon: 'class',
        sort: 4,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '招生计划',
        code: 'enrollment:plan',
        type: 'menu',
        parent_id: enrollmentId,
        path: 'enrollment-plan',
        component: 'pages/enrollment-plan/PlanList.vue',
        permission: null,
        icon: 'plan',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '招生申请',
        code: 'enrollment:application',
        type: 'menu',
        parent_id: enrollmentId,
        path: 'application',
        component: 'pages/application/ApplicationList.vue',
        permission: null,
        icon: 'application',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '用户账户',
        code: 'system:user',
        type: 'menu',
        parent_id: systemId,
        path: 'User',
        component: 'pages/system/User.vue',
        permission: null,
        icon: 'user',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '角色管理',
        code: 'system:role',
        type: 'menu',
        parent_id: systemId,
        path: 'Role',
        component: 'pages/system/Role.vue',
        permission: null,
        icon: 'peoples',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '权限管理',
        code: 'system:permission',
        type: 'menu',
        parent_id: systemId,
        path: 'Permission',
        component: 'pages/system/Permission.vue',
        permission: null,
        icon: 'tree-table',
        sort: 3,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // 添加子级权限
    const childPermissionsToAdd = [];
    for (const permission of childPermissions) {
      if (permission.parent_id !== null) { // 只添加有效父级ID的权限
        const [existing] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code = '${permission.code}'`);
        if (existing.length === 0) {
          childPermissionsToAdd.push(permission);
        }
      }
    }

    if (childPermissionsToAdd.length > 0) {
      await queryInterface.bulkInsert('permissions', childPermissionsToAdd);
      console.log(`✅ 添加了${childPermissionsToAdd.length}个子级权限`);
    }

    console.log(`✅ 权限添加完成，总共添加了${parentPermissionsToAdd.length + childPermissionsToAdd.length}个权限`);

    // 获取权限ID，用于后续角色权限关联
    const [existingPermissions] = await queryInterface.sequelize.query('SELECT id FROM permissions WHERE code IN ("dashboard", "system", "user", "user:student", "user:teacher", "user:parent", "user:class", "enrollment", "enrollment:plan", "enrollment:application", "activity", "system:user", "system:role", "system:permission") ORDER BY id');
    const permissionIds = (existingPermissions as any[]).map(p => p.id);
    
    // 检查是否存在admin用户
    const [existingUsers] = await queryInterface.sequelize.query('SELECT * FROM users WHERE username = "admin"');
    let adminUserId = 1;
    
    if (existingUsers.length === 0) {
      await queryInterface.bulkInsert('users', [{
        username: 'admin',
        password: await hashPassword('admin123'),
        email: 'admin@example.com',
        role: 'admin',
        real_name: '超级管理员',
        phone: '13800138000',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }]);
      console.log('✅ 创建admin用户');
    } else {
      adminUserId = (existingUsers[0] as any).id;
      console.log('ℹ️  admin用户已存在，ID:', adminUserId);
    }

    // 检查用户角色关联是否存在
    const [existingUserRoles] = await queryInterface.sequelize.query(`SELECT * FROM user_roles WHERE user_id = ${adminUserId} AND role_id = ${adminRoleId}`);
    if (existingUserRoles.length === 0) {
      await queryInterface.bulkInsert('user_roles', [{
        user_id: adminUserId,
        role_id: adminRoleId,
        created_at: new Date(),
        updated_at: new Date()
      }]);
      console.log('✅ 创建用户角色关联');
    } else {
      console.log('ℹ️  用户角色关联已存在');
    }

    // 关联角色和权限 - 超级管理员拥有所有权限
    if (permissionIds.length > 0) {
      // 先清理现有的角色权限关联，避免重复
      await queryInterface.sequelize.query(`DELETE FROM role_permissions WHERE role_id = ${adminRoleId} AND permission_id IN (${permissionIds.join(',')})`);
      
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: adminRoleId,
        permission_id: permissionId,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('role_permissions', rolePermissions);
      console.log(`✅ 为admin角色关联了${rolePermissions.length}个权限`);
    } else {
      console.log('⚠️  未找到匹配的权限ID');
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // 删除关联数据
    await queryInterface.bulkDelete('role_permissions', {});
    await queryInterface.bulkDelete('user_roles', {});
    await queryInterface.bulkDelete('permissions', {});
    await queryInterface.bulkDelete('roles', {});
    await queryInterface.bulkDelete('users', {});
  }
}; 