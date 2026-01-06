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

async function addMissingCenterPermissions() {
  try {
    console.log('🚀 开始添加缺失的中心页面权限...\n');
    
    const missingPermissions = [
      { code: 'ACTIVITY_CENTER_VIEW', name: '活动中心查看', description: '查看活动中心页面' },
      { code: 'MARKETING_CENTER_VIEW', name: '营销中心查看', description: '查看营销中心页面' },
      { code: 'CUSTOMER_POOL_CENTER_VIEW', name: '客户池中心查看', description: '查看客户池中心页面' },
      { code: 'FINANCE_CENTER_VIEW', name: '财务中心查看', description: '查看财务中心页面' },
      { code: 'TASK_CENTER_VIEW', name: '任务中心查看', description: '查看任务中心页面' },
      { code: 'TEACHING_CENTER_VIEW', name: '教学中心查看', description: '查看教学中心页面' },
      { code: 'SCRIPT_CENTER_VIEW', name: '话术中心查看', description: '查看话术中心页面' },
      { code: 'MEDIA_CENTER_PAGE', name: '新媒体中心页面', description: '访问新媒体中心页面' },
      { code: 'ANALYTICS_CENTER_VIEW', name: '分析中心查看', description: '查看分析中心页面' },
      { code: 'ATTENDANCE_CENTER_VIEW', name: '考勤中心查看', description: '查看考勤中心页面' },
      { code: 'BUSINESS_CENTER_VIEW', name: '业务中心查看', description: '查看业务中心页面' }
    ];
    
    console.log(`📋 需要添加的权限数量: ${missingPermissions.length}个\n`);
    
    const allPermissions = [];
    
    for (const perm of missingPermissions) {
      const [existing] = await sequelize.query(`SELECT id FROM permissions WHERE code = '${perm.code}'`);
      
      if (existing.length > 0) {
        console.log(`⏭️  跳过已存在的权限: ${perm.code}`);
        allPermissions.push({ ...perm, id: existing[0].id });
      } else {
        const [result] = await sequelize.query(`
          INSERT INTO permissions (code, name, description, created_at, updated_at)
          VALUES ('${perm.code}', '${perm.name}', '${perm.description}', NOW(), NOW())
        `);
        console.log(`✅ 添加权限: ${perm.code} (ID: ${result})`);
        allPermissions.push({ ...perm, id: result });
      }
    }
    
    console.log(`\n🔗 开始分配权限给admin和principal角色...\n`);
    
    for (const perm of allPermissions) {
      const [adminExists] = await sequelize.query(`SELECT id FROM role_permissions WHERE role_id = 1 AND permission_id = ${perm.id}`);
      if (adminExists.length === 0) {
        await sequelize.query(`INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (1, ${perm.id}, NOW(), NOW())`);
        console.log(`✅ admin角色添加权限: ${perm.code}`);
      }
      
      const [principalExists] = await sequelize.query(`SELECT id FROM role_permissions WHERE role_id = 2 AND permission_id = ${perm.id}`);
      if (principalExists.length === 0) {
        await sequelize.query(`INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (2, ${perm.id}, NOW(), NOW())`);
        console.log(`✅ principal角色添加权限: ${perm.code}`);
      }
    }
    
    console.log(`\n🎉 所有权限已成功分配！`);
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

addMissingCenterPermissions();
