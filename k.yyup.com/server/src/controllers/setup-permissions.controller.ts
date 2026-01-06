import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

/**
 * 权限设置控制器
 * 用于初始化和配置系统权限
 */
export class SetupPermissionsController {

  /**
   * 设置业务中心权限
   * @route POST /api/setup/business-center-permissions
   */
  async setupBusinessCenterPermissions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔧 开始设置业务中心权限...');
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 1. 确保所有业务中心权限存在
      const centerPermissions = [
        { id: 3001, name: 'Dashboard Center', chinese_name: '仪表板中心', code: 'DASHBOARD_CENTER', icon: 'Dashboard', sort: 1 },
        { id: 3002, name: 'Personnel Center', chinese_name: '人员中心', code: 'PERSONNEL_CENTER', icon: 'Users', sort: 2 },
        { id: 3003, name: 'Activity Center', chinese_name: '活动中心', code: 'ACTIVITY_CENTER', icon: 'Calendar', sort: 3 },
        { id: 3004, name: 'Enrollment Center', chinese_name: '招生中心', code: 'ENROLLMENT_CENTER', icon: 'School', sort: 4 },
        { id: 3005, name: 'Marketing Center', chinese_name: '营销中心', code: 'MARKETING_CENTER', icon: 'TrendingUp', sort: 5 },
        { id: 3006, name: 'AI Center', chinese_name: 'AI中心', code: 'AI_CENTER', icon: 'Brain', sort: 6 },
        { id: 2013, name: '系统管理', chinese_name: '系统中心', code: 'SYSTEM_CENTER', icon: 'Settings', sort: 7 },
        { id: 3074, name: 'FinanceCenter', chinese_name: '财务中心', code: 'FINANCE_CENTER', icon: 'money', sort: 10 },
        { id: 3035, name: '任务中心', chinese_name: '任务中心', code: 'TASK_CENTER_CATEGORY', icon: 'List', sort: 17 },
        { id: 3054, name: 'CustomerPoolCenter', chinese_name: '客户池中心', code: 'CUSTOMER_POOL_CENTER', icon: 'icon-users', sort: 75 },
        { id: 3073, name: 'AnalyticsCenter', chinese_name: '分析中心', code: 'ANALYTICS_CENTER', icon: 'DataAnalysis', sort: 80 }
      ];

      for (const permission of centerPermissions) {
        await sequelize.query(`
          INSERT IGNORE INTO ${tenantDb}.permissions (id, name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'category', NULL, ?, NULL, ?, ?, ?, 1, NOW(), NOW())
        `, {
          replacements: [
            permission.id, permission.name, permission.chinese_name, permission.code,
            `#${permission.code.toLowerCase().replace('_', '-')}`,
            permission.code, permission.icon, permission.sort
          ],
          type: QueryTypes.INSERT
        });
      }

      console.log('✅ 业务中心权限创建完成');

      // 2. 添加页面权限
      const pagePermissions = [
        { code: 'ENROLLMENT_CENTER_PAGE', parent_code: 'ENROLLMENT_CENTER', path: '/centers/enrollment', component: 'pages/centers/EnrollmentCenter.vue' },
        { code: 'ACTIVITY_CENTER_PAGE', parent_code: 'ACTIVITY_CENTER', path: '/centers/activity', component: 'pages/centers/ActivityCenter.vue' },
        { code: 'PERSONNEL_CENTER_PAGE', parent_code: 'PERSONNEL_CENTER', path: '/centers/personnel', component: 'pages/centers/PersonnelCenter.vue' },
        { code: 'MARKETING_CENTER_PAGE', parent_code: 'MARKETING_CENTER', path: '/centers/marketing', component: 'pages/centers/MarketingCenter.vue' },
        { code: 'AI_CENTER_PAGE', parent_code: 'AI_CENTER', path: '/centers/ai', component: 'pages/centers/AICenter.vue' },
        { code: 'DASHBOARD_CENTER_PAGE', parent_code: 'DASHBOARD_CENTER', path: '/centers/dashboard', component: 'pages/centers/DashboardCenter.vue' }
      ];

      for (const page of pagePermissions) {
        // 获取父权限ID
        const [parentResult] = await sequelize.query(`
          SELECT id FROM ${tenantDb}.permissions WHERE code = ?
        `, {
          replacements: [page.parent_code],
          type: QueryTypes.SELECT
        }) as any[];

        if (parentResult) {
          await sequelize.query(`
            INSERT IGNORE INTO ${tenantDb}.permissions (name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
            VALUES (?, ?, ?, 'menu', ?, ?, ?, ?, '', 1, 1, NOW(), NOW())
          `, {
            replacements: [
              `${page.parent_code} Page`, `${page.parent_code}页面`, page.code,
              parentResult.id, page.path, page.component, `${page.parent_code}_VIEW`
            ],
            type: QueryTypes.INSERT
          });
        }
      }

      console.log('✅ 页面权限创建完成');

      // 3. 确保角色存在
      const roles = [
        { name: 'admin', description: '系统管理员' },
        { name: '园长', description: '幼儿园园长，负责园区整体管理' },
        { name: '教师', description: '幼儿园教师，负责教学和学生管理' },
        { name: '家长', description: '学生家长，可查看孩子相关信息' }
      ];

      for (const role of roles) {
        await sequelize.query(`
          INSERT IGNORE INTO ${tenantDb}.roles (name, description, status, created_at, updated_at)
          VALUES (?, ?, 1, NOW(), NOW())
        `, {
          replacements: [role.name, role.description],
          type: QueryTypes.INSERT
        });
      }

      console.log('✅ 角色创建完成');

      // 4. 分配权限给角色
      // 管理员：所有权限
      const adminPermissions = [
        'DASHBOARD_CENTER', 'PERSONNEL_CENTER', 'ACTIVITY_CENTER', 'ENROLLMENT_CENTER',
        'MARKETING_CENTER', 'AI_CENTER', 'SYSTEM_CENTER', 'FINANCE_CENTER',
        'TASK_CENTER_CATEGORY', 'CUSTOMER_POOL_CENTER', 'ANALYTICS_CENTER',
        'DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE',
        'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE'
      ];

      await this.assignPermissionsToRole('admin', adminPermissions, tenantDb);

      // 园长：业务中心权限（除系统中心）
      const principalPermissions = [
        'DASHBOARD_CENTER', 'PERSONNEL_CENTER', 'ACTIVITY_CENTER', 'ENROLLMENT_CENTER',
        'MARKETING_CENTER', 'AI_CENTER', 'FINANCE_CENTER',
        'TASK_CENTER_CATEGORY', 'CUSTOMER_POOL_CENTER', 'ANALYTICS_CENTER',
        'DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE',
        'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE'
      ];

      await this.assignPermissionsToRole('园长', principalPermissions, tenantDb);

      // 教师：教学相关权限
      const teacherPermissions = [
        'DASHBOARD_CENTER', 'PERSONNEL_CENTER', 'ACTIVITY_CENTER', 'ENROLLMENT_CENTER',
        'TASK_CENTER_CATEGORY', 'ANALYTICS_CENTER',
        'DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE',
        'ENROLLMENT_CENTER_PAGE'
      ];

      await this.assignPermissionsToRole('教师', teacherPermissions, tenantDb);

      // 家长：基础查看权限
      const parentPermissions = [
        'ACTIVITY_CENTER', 'ENROLLMENT_CENTER',
        'ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE'
      ];

      await this.assignPermissionsToRole('家长', parentPermissions, tenantDb);

      console.log('✅ 角色权限分配完成');

      // 5. 为测试用户分配角色
      await this.assignUserRole(130, '教师', tenantDb); // teacher用户
      await this.assignUserRole(131, '家长', tenantDb); // parent用户

      console.log('✅ 测试用户角色分配完成');

      // 6. 验证配置结果
      const verification = await this.verifyPermissionSetup(req);

      ApiResponse.success(res, {
        message: '业务中心权限设置完成',
        verification
      }, '权限配置成功');

    } catch (error) {
      console.error('❌ 权限设置失败:', error);
      ApiResponse.handleError(res, error, '权限设置失败');
    }
  }

  /**
   * 为角色分配权限
   */
  private async assignPermissionsToRole(roleName: string, permissionCodes: string[], tenantDb: string): Promise<void> {
    for (const code of permissionCodes) {
      await sequelize.query(`
        INSERT IGNORE INTO ${tenantDb}.role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT r.id, p.id, NOW(), NOW()
        FROM ${tenantDb}.roles r, ${tenantDb}.permissions p
        WHERE r.name = ? AND p.code = ?
      `, {
        replacements: [roleName, code],
        type: QueryTypes.INSERT
      });
    }
    console.log(`✅ ${roleName}角色权限分配完成 (${permissionCodes.length}个权限)`);
  }

  /**
   * 为用户分配角色
   */
  private async assignUserRole(userId: number, roleName: string, tenantDb: string): Promise<void> {
    await sequelize.query(`
      INSERT IGNORE INTO ${tenantDb}.user_roles (user_id, role_id, created_at, updated_at)
      SELECT ?, r.id, NOW(), NOW()
      FROM ${tenantDb}.roles r
      WHERE r.name = ?
    `, {
      replacements: [userId, roleName],
      type: QueryTypes.INSERT
    });
  }

  /**
   * 修复业务中心权限路径
   * @route POST /api/setup/fix-business-center-paths
   */
  async fixBusinessCenterPaths(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔧 开始修复业务中心权限路径...');
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 定义路径映射
      const pathMappings = [
        { code: 'DASHBOARD_CENTER', newPath: '/centers/dashboard' },
        { code: 'PERSONNEL_CENTER', newPath: '/centers/personnel' },
        { code: 'ACTIVITY_CENTER', newPath: '/centers/activity' },
        { code: 'ENROLLMENT_CENTER', newPath: '/centers/enrollment' },
        { code: 'MARKETING_CENTER', newPath: '/centers/marketing' },
        { code: 'AI_CENTER', newPath: '/centers/ai' },
        { code: 'SYSTEM_CENTER', newPath: '/centers/system' },
        { code: 'FINANCE_CENTER', newPath: '/centers/finance' },
        { code: 'TASK_CENTER_CATEGORY', newPath: '/centers/task' },
        { code: 'CUSTOMER_POOL_CENTER', newPath: '/centers/customer-pool' },
        { code: 'ANALYTICS_CENTER', newPath: '/centers/analytics' }
      ];

      // 更新每个业务中心的路径
      for (const mapping of pathMappings) {
        await sequelize.query(`
          UPDATE ${tenantDb}.permissions SET path = ?, updated_at = NOW() WHERE code = ?
        `, {
          replacements: [mapping.newPath, mapping.code],
          type: QueryTypes.UPDATE
        });
        console.log(`✅ 更新 ${mapping.code}: ${mapping.newPath}`);
      }

      // 添加页面级权限
      const pagePermissions = [
        { code: 'DASHBOARD_CENTER_PAGE', parent_code: 'DASHBOARD_CENTER', path: '/centers/dashboard', component: 'pages/centers/DashboardCenter.vue' },
        { code: 'PERSONNEL_CENTER_PAGE', parent_code: 'PERSONNEL_CENTER', path: '/centers/personnel', component: 'pages/centers/PersonnelCenter.vue' },
        { code: 'ACTIVITY_CENTER_PAGE', parent_code: 'ACTIVITY_CENTER', path: '/centers/activity', component: 'pages/centers/ActivityCenter.vue' },
        { code: 'ENROLLMENT_CENTER_PAGE', parent_code: 'ENROLLMENT_CENTER', path: '/centers/enrollment', component: 'pages/centers/EnrollmentCenter.vue' },
        { code: 'MARKETING_CENTER_PAGE', parent_code: 'MARKETING_CENTER', path: '/centers/marketing', component: 'pages/centers/MarketingCenter.vue' },
        { code: 'AI_CENTER_PAGE', parent_code: 'AI_CENTER', path: '/centers/ai', component: 'pages/centers/AICenter.vue' }
      ];

      for (const page of pagePermissions) {
        // 获取父权限ID
        const [parentResult] = await sequelize.query(`
          SELECT id FROM ${tenantDb}.permissions WHERE code = ?
        `, {
          replacements: [page.parent_code],
          type: QueryTypes.SELECT
        }) as any[];

        if (parentResult) {
          await sequelize.query(`
            INSERT IGNORE INTO ${tenantDb}.permissions (name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
            VALUES (?, ?, ?, 'menu', ?, ?, ?, ?, '', 1, 1, NOW(), NOW())
          `, {
            replacements: [
              `${page.parent_code} Page`, `${page.parent_code}页面`, page.code,
              parentResult.id, page.path, page.component, `${page.parent_code}_VIEW`
            ],
            type: QueryTypes.INSERT
          });
          console.log(`✅ 添加页面权限: ${page.code}`);
        }
      }

      // 为所有角色分配页面权限
      const rolePagePermissions = {
        'admin': ['DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE'],
        '园长': ['DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE'],
        '教师': ['DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE'],
        '家长': ['ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE']
      };

      for (const [roleName, permissionCodes] of Object.entries(rolePagePermissions)) {
        for (const permissionCode of permissionCodes) {
          await sequelize.query(`
            INSERT IGNORE INTO ${tenantDb}.role_permissions (role_id, permission_id, created_at, updated_at)
            SELECT r.id, p.id, NOW(), NOW()
            FROM ${tenantDb}.roles r, ${tenantDb}.permissions p
            WHERE r.name = ? AND p.code = ?
          `, {
            replacements: [roleName, permissionCode],
            type: QueryTypes.INSERT
          });
        }
        console.log(`✅ ${roleName}角色页面权限分配完成`);
      }

      console.log('✅ 业务中心权限路径修复完成');

      // 验证修复结果
      const verification = await this.verifyPermissionSetup(req);

      ApiResponse.success(res, {
        message: '业务中心权限路径修复完成',
        pathMappings: pathMappings.length,
        pagePermissions: pagePermissions.length,
        verification
      }, '权限路径修复成功');

    } catch (error) {
      console.error('❌ 权限路径修复失败:', error);
      ApiResponse.handleError(res, error, '权限路径修复失败');
    }
  }

  /**
   * 验证权限配置
   */
  private async verifyPermissionSetup(req?: Request): Promise<any> {
    // 获取租户数据库名称（共享连接池模式）
    const tenantDb = req ? getTenantDatabaseName(req) : 'kindergarten';

    // 验证角色权限数量
    const rolePermissions = await sequelize.query(`
      SELECT
        r.name as role_name,
        COUNT(rp.permission_id) as permission_count
      FROM ${tenantDb}.roles r
      LEFT JOIN ${tenantDb}.role_permissions rp ON r.id = rp.role_id
      LEFT JOIN ${tenantDb}.permissions p ON rp.permission_id = p.id
      WHERE r.name IN ('admin', '园长', '教师', '家长')
        AND p.code LIKE '%CENTER%'
      GROUP BY r.id, r.name
      ORDER BY r.name
    `, { type: QueryTypes.SELECT });

    // 验证用户角色分配
    const userRoles = await sequelize.query(`
      SELECT
        u.id as user_id,
        u.username,
        r.name as role_name
      FROM ${tenantDb}.users u
      LEFT JOIN ${tenantDb}.user_roles ur ON u.id = ur.user_id
      LEFT JOIN ${tenantDb}.roles r ON ur.role_id = r.id
      WHERE u.id IN (121, 130, 131)
      ORDER BY u.id
    `, { type: QueryTypes.SELECT });

    // 验证权限路径
    const permissionPaths = await sequelize.query(`
      SELECT code, path, type FROM ${tenantDb}.permissions
      WHERE code LIKE '%CENTER%'
      ORDER BY code
    `, { type: QueryTypes.SELECT });

    return {
      rolePermissions,
      userRoles,
      permissionPaths
    };
  }

  /**
   * 为其他角色分配业务中心权限
   * @route POST /api/setup/assign-role-permissions
   */
  static async assignRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔑 开始为其他角色分配业务中心权限...');
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 角色权限映射（基于role-mapping.ts配置）
      const rolePermissionMapping = {
        // 园长权限：所有中心（包括系统中心和检查中心）
        principal: [3002, 3003, 3004, 3005, 3006, 3054, 3035, 2013, 3074, 3073, 4059, 5001],

        // 教师权限：6个教学相关中心
        teacher: [3001, 3002, 3003, 3004, 3035, 3073],

        // 家长权限：2个相关中心
        parent: [3003, 3004]
      };

      let totalAssigned = 0;

      for (const [roleCode, permissionIds] of Object.entries(rolePermissionMapping)) {
        console.log(`🔄 处理角色: ${roleCode}`);

        // 获取角色ID
        const [roleResult] = await sequelize.query(
          'SELECT id FROM ${tenantDb}.roles WHERE code = :roleCode AND status = 1',
          {
            replacements: { roleCode },
            type: QueryTypes.SELECT
          }
        ) as [any[]];

        if (!roleResult || roleResult.length === 0) {
          console.warn(`⚠️ 角色 ${roleCode} 不存在，跳过`);
          continue;
        }

        const roleId = roleResult[0].id;
        console.log(`✅ 找到角色 ${roleCode} (ID: ${roleId})`);

        // 为角色分配权限
        for (const permissionId of permissionIds) {
          // 检查权限关联是否已存在
          const [existingResult] = await sequelize.query(
            'SELECT id FROM ${tenantDb}.role_permissions WHERE role_id = :roleId AND permission_id = :permissionId',
            {
              replacements: { roleId, permissionId },
              type: QueryTypes.SELECT
            }
          ) as [any[]];

          if (existingResult && existingResult.length > 0) {
            console.log(`⏭️ 角色 ${roleCode} 已有权限 ${permissionId}，跳过`);
            continue;
          }

          // 创建角色权限关联
          await sequelize.query(
            'INSERT INTO ${tenantDb}.role_permissions (role_id, permission_id, created_at, updated_at) VALUES (:roleId, :permissionId, NOW(), NOW())',
            {
              replacements: { roleId, permissionId },
              type: QueryTypes.INSERT
            }
          );

          console.log(`✅ 为角色 ${roleCode} 分配权限 ${permissionId}`);
          totalAssigned++;
        }
      }

      res.json({
        success: true,
        message: '角色权限分配完成',
        data: {
          totalAssigned,
          rolePermissionMapping
        }
      });

    } catch (error) {
      console.error('❌ 角色权限分配失败:', error);
      res.status(500).json({
        success: false,
        message: '角色权限分配失败',
        error: (error as Error).message
      });
    }
  }
}
