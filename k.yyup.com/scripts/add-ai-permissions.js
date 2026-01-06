/**
 * 添加AI相关权限给admin和principal角色
 */

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  logging: false,
  timezone: '+08:00'
});

async function addAIPermissions() {
  try {
    console.log('🚀 开始添加AI相关权限...\n');
    
    // 需要添加的AI权限
    const aiPermissions = [
      { code: 'AI', name: 'AI功能', description: '访问AI功能模块', path: '/ai' },
      { code: 'AI_CONVERSATIONS', name: 'AI对话', description: '访问AI对话功能', path: '/ai/conversations' },
      { code: 'AI_ASSISTANT', name: 'AI助手', description: '使用AI助手功能', path: '/ai/assistant' },
      { code: 'AI_MODEL_CONFIG', name: 'AI模型配置', description: '配置AI模型', path: '/ai/models' }
    ];
    
    console.log(`📋 需要添加的AI权限数量: ${aiPermissions.length}个\n`);
    
    const addedPermissions = [];
    const existingPermissions = [];
    
    for (const perm of aiPermissions) {
      // 检查权限是否已存在
      const [existing] = await sequelize.query(`
        SELECT id FROM permissions WHERE code = '${perm.code}'
      `);
      
      let permId;
      if (existing.length > 0) {
        console.log(`⏭️  权限已存在: ${perm.code}`);
        permId = existing[0].id;
        existingPermissions.push({ ...perm, id: permId });
      } else {
        // 插入新权限
        const [result] = await sequelize.query(`
          INSERT INTO permissions (code, name, description, path, created_at, updated_at)
          VALUES ('${perm.code}', '${perm.name}', '${perm.description}', '${perm.path}', NOW(), NOW())
        `);
        permId = result;
        console.log(`✅ 添加权限: ${perm.code} (ID: ${permId})`);
        addedPermissions.push({ ...perm, id: permId });
      }
    }
    
    console.log(`\n📊 权限添加统计:`);
    console.log(`   - 新增: ${addedPermissions.length}个`);
    console.log(`   - 已存在: ${existingPermissions.length}个`);
    
    // 将所有权限分配给admin和principal角色
    console.log(`\n🔗 开始分配权限给admin和principal角色...\n`);
    
    const allPermissions = [...addedPermissions, ...existingPermissions];
    const adminRoleId = 1;
    const principalRoleId = 2;
    
    let adminAdded = 0;
    let principalAdded = 0;
    
    for (const perm of allPermissions) {
      // 分配给admin角色
      const [adminExists] = await sequelize.query(`
        SELECT id FROM role_permissions 
        WHERE role_id = ${adminRoleId} AND permission_id = ${perm.id}
      `);
      
      if (adminExists.length === 0) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (${adminRoleId}, ${perm.id}, NOW(), NOW())
        `);
        console.log(`✅ admin角色添加权限: ${perm.code}`);
        adminAdded++;
      } else {
        console.log(`⏭️  admin角色已有权限: ${perm.code}`);
      }
      
      // 分配给principal角色
      const [principalExists] = await sequelize.query(`
        SELECT id FROM role_permissions 
        WHERE role_id = ${principalRoleId} AND permission_id = ${perm.id}
      `);
      
      if (principalExists.length === 0) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (${principalRoleId}, ${perm.id}, NOW(), NOW())
        `);
        console.log(`✅ principal角色添加权限: ${perm.code}`);
        principalAdded++;
      } else {
        console.log(`⏭️  principal角色已有权限: ${perm.code}`);
      }
    }
    
    console.log(`\n📊 权限分配统计:`);
    console.log(`   - admin角色新增: ${adminAdded}个`);
    console.log(`   - principal角色新增: ${principalAdded}个`);
    
    // 同时添加之前缺少的SYSTEM_AIMODELCONFIG权限给principal
    console.log(`\n🔧 补充principal缺少的其他AI权限...\n`);
    
    const [systemAiModel] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'SYSTEM_AIMODELCONFIG'
    `);
    
    if (systemAiModel.length > 0) {
      const permId = systemAiModel[0].id;
      const [principalHas] = await sequelize.query(`
        SELECT id FROM role_permissions 
        WHERE role_id = ${principalRoleId} AND permission_id = ${permId}
      `);
      
      if (principalHas.length === 0) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (${principalRoleId}, ${permId}, NOW(), NOW())
        `);
        console.log(`✅ principal角色添加权限: SYSTEM_AIMODELCONFIG`);
      }
    }
    
    // 验证结果
    console.log(`\n🔍 验证权限分配结果...\n`);
    
    const [adminAIPerms] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ${adminRoleId}
        AND (p.code LIKE '%AI%' OR p.path LIKE '%/ai%')
    `);
    
    const [principalAIPerms] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ${principalRoleId}
        AND (p.code LIKE '%AI%' OR p.path LIKE '%/ai%')
    `);
    
    console.log(`✅ admin角色拥有的AI权限: ${adminAIPerms[0].count}个`);
    console.log(`✅ principal角色拥有的AI权限: ${principalAIPerms[0].count}个`);
    
    console.log(`\n🎉 AI权限添加完成！`);
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

addAIPermissions();

