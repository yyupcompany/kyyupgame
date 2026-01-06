/**
 * 添加缺失的API权限到principal角色
 * 基于enrollment-center的权限模式
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

async function addMissingPermissions() {
  try {
    console.log('🔌 连接远端数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 检查enrollment相关权限
    console.log('🔍 检查enrollment相关权限...\n');
    const [enrollmentPerms] = await sequelize.query(`
      SELECT id, code, name, path
      FROM permissions
      WHERE deleted_at IS NULL
        AND code LIKE 'enrollment:%'
      ORDER BY code
    `);

    console.log(`找到 ${enrollmentPerms.length} 个enrollment权限:`);
    enrollmentPerms.forEach(p => {
      console.log(`  - ${p.code} (${p.name})`);
    });

    // 2. 检查principal是否有这些权限
    console.log('\n📊 检查principal角色权限...\n');
    const [principalRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'PRINCIPAL' LIMIT 1
    `);

    if (principalRole.length === 0) {
      console.log('❌ 未找到principal角色');
      return;
    }

    const principalRoleId = principalRole[0].id;
    console.log(`✅ principal角色ID: ${principalRoleId}\n`);

    // 检查每个权限
    const missingPerms = [];
    for (const perm of enrollmentPerms) {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM role_permissions
        WHERE role_id = ${principalRoleId}
          AND permission_id = ${perm.id}
      `);

      if (result[0].count === 0) {
        missingPerms.push(perm);
        console.log(`❌ 缺失: ${perm.code}`);
      } else {
        console.log(`✅ 已有: ${perm.code}`);
      }
    }

    if (missingPerms.length === 0) {
      console.log('\n✅ principal角色已拥有所有enrollment权限');
    } else {
      console.log(`\n⚠️  principal角色缺失 ${missingPerms.length} 个权限\n`);
      
      // 3. 添加缺失的权限
      console.log('🔧 开始添加缺失权限...\n');
      
      for (const perm of missingPerms) {
        try {
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (${principalRoleId}, ${perm.id}, NOW(), NOW())
          `);
          console.log(`✅ 已添加: ${perm.code}`);
        } catch (error) {
          console.log(`❌ 添加失败: ${perm.code} - ${error.message}`);
        }
      }
    }

    // 4. 检查其他缺失的权限（从之前的检查结果）
    console.log('\n\n' + '='.repeat(80));
    console.log('🔍 检查其他缺失的权限');
    console.log('='.repeat(80));

    const otherMissingCodes = [
      'CUSTOMER_POOL_ANALYTICS',
      'CUSTOMER_POOL_FOLLOWUP',
      'CUSTOMER_POOL_MANAGEMENT'
    ];

    console.log('\n检查客户池相关权限:\n');
    for (const code of otherMissingCodes) {
      const [perm] = await sequelize.query(`
        SELECT id, code, name
        FROM permissions
        WHERE code = '${code}'
          AND deleted_at IS NULL
        LIMIT 1
      `);

      if (perm.length === 0) {
        console.log(`⚠️  权限不存在: ${code}`);
        continue;
      }

      const permId = perm[0].id;
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM role_permissions
        WHERE role_id = ${principalRoleId}
          AND permission_id = ${permId}
      `);

      if (result[0].count === 0) {
        console.log(`❌ 缺失: ${code}`);
        
        // 添加权限
        try {
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (${principalRoleId}, ${permId}, NOW(), NOW())
          `);
          console.log(`   ✅ 已添加`);
        } catch (error) {
          console.log(`   ❌ 添加失败: ${error.message}`);
        }
      } else {
        console.log(`✅ 已有: ${code}`);
      }
    }

    // 5. 验证结果
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 验证添加结果');
    console.log('='.repeat(80));

    const [finalCount] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM role_permissions rp
      INNER JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'PRINCIPAL'
    `);

    console.log(`\n✅ principal角色当前拥有 ${finalCount[0].count} 个权限`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ 权限添加完成');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

addMissingPermissions();

