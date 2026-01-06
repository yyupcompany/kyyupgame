/**
 * 修复集团管理和推广中心权限问题
 * 
 * 问题1: 集团管理路由权限不匹配
 * 问题2: 推广中心权限代码不匹配
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function fixPermissions() {
  try {
    console.log('🔧 开始修复权限问题...\n');

    // 1. 添加 MARKETING_REFERRALS_MANAGE 权限
    console.log('📝 步骤1: 添加推广中心管理权限...');
    
    const [referralPermission] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'MARKETING_REFERRALS_MANAGE'
    `);

    if (referralPermission.length === 0) {
      // 获取营销中心的ID
      const [marketingCenter] = await sequelize.query(`
        SELECT id FROM permissions WHERE code = 'MARKETING_CENTER_VIEW'
      `);

      if (marketingCenter.length > 0) {
        const parentId = marketingCenter[0].id;
        
        await sequelize.query(`
          INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
          VALUES ('Marketing Referrals Manage', '推广管理', 'MARKETING_REFERRALS_MANAGE', 'menu', ?, '/marketing/referrals', 'pages/marketing/referrals/index.vue', 'Share', 100, 1, NOW(), NOW())
        `, { replacements: [parentId] });
        
        console.log('   ✅ 已添加 MARKETING_REFERRALS_MANAGE 权限');
      } else {
        console.log('   ⚠️  未找到营销中心父权限，跳过');
      }
    } else {
      console.log('   ℹ️  MARKETING_REFERRALS_MANAGE 权限已存在');
    }

    // 2. 将 MARKETING_REFERRALS_MANAGE 权限分配给管理员角色
    console.log('\n📝 步骤2: 分配推广管理权限给管理员...');
    
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin'
    `);

    const [newPermission] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'MARKETING_REFERRALS_MANAGE'
    `);

    if (adminRole.length > 0 && newPermission.length > 0) {
      const roleId = adminRole[0].id;
      const permissionId = newPermission[0].id;

      // 检查是否已分配
      const [existing] = await sequelize.query(`
        SELECT id FROM role_permissions 
        WHERE role_id = ? AND permission_id = ?
      `, { replacements: [roleId, permissionId] });

      if (existing.length === 0) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, { replacements: [roleId, permissionId] });
        
        console.log('   ✅ 已分配推广管理权限给管理员角色');
      } else {
        console.log('   ℹ️  管理员已拥有推广管理权限');
      }
    }

    // 3. 检查并报告集团管理权限状态
    console.log('\n📝 步骤3: 检查集团管理权限状态...');
    
    const [groupPermissions] = await sequelize.query(`
      SELECT code, name, chinese_name, type 
      FROM permissions 
      WHERE code LIKE 'GROUP_%'
      ORDER BY code
    `);

    console.log('   集团管理相关权限:');
    groupPermissions.forEach(p => {
      console.log(`   - ${p.code.padEnd(25)} ${p.chinese_name || p.name} (${p.type})`);
    });

    // 4. 检查使用量中心权限
    console.log('\n📝 步骤4: 检查使用量中心权限...');
    
    const [usagePermission] = await sequelize.query(`
      SELECT id, code, name, chinese_name, path, component 
      FROM permissions 
      WHERE code = 'USAGE_CENTER'
    `);

    if (usagePermission.length > 0) {
      console.log('   ✅ 使用量中心权限已存在:');
      console.log(`      代码: ${usagePermission[0].code}`);
      console.log(`      名称: ${usagePermission[0].chinese_name || usagePermission[0].name}`);
      console.log(`      路径: ${usagePermission[0].path || '未设置'}`);
      console.log(`      组件: ${usagePermission[0].component || '未设置'}`);
    } else {
      console.log('   ⚠️  使用量中心权限不存在');
    }

    // 5. 验证管理员权限
    console.log('\n📝 步骤5: 验证管理员拥有的权限...');
    
    const [adminPermissions] = await sequelize.query(`
      SELECT p.code, p.chinese_name, p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'admin' 
        AND (p.code LIKE 'GROUP_%' OR p.code LIKE '%REFERRAL%' OR p.code = 'USAGE_CENTER')
      ORDER BY p.code
    `);

    console.log('   管理员拥有的相关权限:');
    if (adminPermissions.length > 0) {
      adminPermissions.forEach(p => {
        console.log(`   ✅ ${p.code.padEnd(30)} ${p.chinese_name || p.name}`);
      });
    } else {
      console.log('   ⚠️  未找到相关权限');
    }

    console.log('\n✅ 权限修复完成！');
    console.log('\n📋 下一步操作:');
    console.log('   1. 修改前端路由配置，将集团管理父路由权限从 GROUP_MANAGE 改为 GROUP_MANAGEMENT');
    console.log('   2. 添加使用量中心的路由配置');
    console.log('   3. 重启前端服务以应用更改');
    console.log('   4. 清除浏览器缓存或重新登录');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行修复
fixPermissions()
  .then(() => {
    console.log('\n🎉 脚本执行成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });

