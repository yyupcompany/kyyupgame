/**
 * 创建enrollment-center所需的权限
 * 基于路由文件中使用的权限代码
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false
});

// 需要创建的权限列表（基于enrollment-center.routes.ts）
const REQUIRED_PERMISSIONS = [
  {
    code: 'enrollment:overview:view',
    name: '招生中心总览查看',
    description: '查看招生中心总览数据',
    type: 'api',
    path: '/api/enrollment-center/overview'
  },
  {
    code: 'enrollment:plans:view',
    name: '招生计划查看',
    description: '查看招生计划列表',
    type: 'api',
    path: '/api/enrollment-center/plans'
  },
  {
    code: 'enrollment:plans:create',
    name: '招生计划创建',
    description: '创建新的招生计划',
    type: 'api',
    path: '/api/enrollment-center/plans'
  },
  {
    code: 'enrollment:plans:update',
    name: '招生计划更新',
    description: '更新招生计划',
    type: 'api',
    path: '/api/enrollment-center/plans/:id'
  },
  {
    code: 'enrollment:plans:delete',
    name: '招生计划删除',
    description: '删除招生计划',
    type: 'api',
    path: '/api/enrollment-center/plans/:id'
  },
  {
    code: 'enrollment:applications:view',
    name: '招生申请查看',
    description: '查看招生申请列表',
    type: 'api',
    path: '/api/enrollment-center/applications'
  },
  {
    code: 'enrollment:applications:approve',
    name: '招生申请审批',
    description: '审批招生申请',
    type: 'api',
    path: '/api/enrollment-center/applications/:id/status'
  },
  {
    code: 'enrollment:consultations:view',
    name: '招生咨询查看',
    description: '查看招生咨询记录',
    type: 'api',
    path: '/api/enrollment-center/consultations'
  },
  {
    code: 'enrollment:analytics:view',
    name: '招生数据分析查看',
    description: '查看招生数据分析',
    type: 'api',
    path: '/api/enrollment-center/analytics/trends'
  },
  {
    code: 'enrollment:ai:use',
    name: '招生AI功能使用',
    description: '使用招生相关AI功能',
    type: 'api',
    path: '/api/enrollment-center/ai'
  }
];

async function createPermissions() {
  try {
    console.log('🔌 连接远端数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 获取principal和admin角色ID
    const [roles] = await sequelize.query(`
      SELECT id, code FROM roles WHERE code IN ('PRINCIPAL', 'ADMIN', 'principal', 'admin')
    `);

    const principalRole = roles.find(r => r.code.toUpperCase() === 'PRINCIPAL');
    const adminRole = roles.find(r => r.code.toUpperCase() === 'ADMIN');

    if (!principalRole || !adminRole) {
      console.log('❌ 未找到principal或admin角色');
      return;
    }

    console.log(`✅ principal角色ID: ${principalRole.id}`);
    console.log(`✅ admin角色ID: ${adminRole.id}\n`);

    // 2. 创建权限并分配给角色
    console.log('🔧 开始创建和分配权限...\n');
    console.log('='.repeat(80));

    let createdCount = 0;
    let existingCount = 0;
    let assignedCount = 0;

    for (const perm of REQUIRED_PERMISSIONS) {
      console.log(`\n处理权限: ${perm.code}`);
      
      // 检查权限是否已存在
      const [existing] = await sequelize.query(`
        SELECT id FROM permissions
        WHERE code = '${perm.code}'
          AND deleted_at IS NULL
        LIMIT 1
      `);

      let permissionId;

      if (existing.length > 0) {
        permissionId = existing[0].id;
        console.log(`  ✅ 权限已存在 (ID: ${permissionId})`);
        existingCount++;
      } else {
        // 创建权限
        const [result] = await sequelize.query(`
          INSERT INTO permissions (code, name, description, type, path, status, created_at, updated_at)
          VALUES (
            '${perm.code}',
            '${perm.name}',
            '${perm.description}',
            '${perm.type}',
            '${perm.path}',
            1,
            NOW(),
            NOW()
          )
        `);
        
        permissionId = result;
        console.log(`  ✅ 权限已创建 (ID: ${permissionId})`);
        createdCount++;
      }

      // 分配给principal角色
      const [principalHas] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM role_permissions
        WHERE role_id = ${principalRole.id}
          AND permission_id = ${permissionId}
      `);

      if (principalHas[0].count === 0) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (${principalRole.id}, ${permissionId}, NOW(), NOW())
        `);
        console.log(`  ✅ 已分配给principal角色`);
        assignedCount++;
      } else {
        console.log(`  ℹ️  principal角色已拥有此权限`);
      }

      // 分配给admin角色
      const [adminHas] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM role_permissions
        WHERE role_id = ${adminRole.id}
          AND permission_id = ${permissionId}
      `);

      if (adminHas[0].count === 0) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (${adminRole.id}, ${permissionId}, NOW(), NOW())
        `);
        console.log(`  ✅ 已分配给admin角色`);
      } else {
        console.log(`  ℹ️  admin角色已拥有此权限`);
      }
    }

    // 3. 总结
    console.log('\n' + '='.repeat(80));
    console.log('📊 操作总结');
    console.log('='.repeat(80));
    console.log(`\n✅ 新创建权限: ${createdCount} 个`);
    console.log(`ℹ️  已存在权限: ${existingCount} 个`);
    console.log(`✅ 分配给principal: ${assignedCount} 个`);

    // 4. 验证最终结果
    const [finalCount] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM role_permissions rp
      INNER JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'PRINCIPAL'
    `);

    console.log(`\n✅ principal角色当前拥有 ${finalCount[0].count} 个权限`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ 权限创建和分配完成');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

createPermissions();

