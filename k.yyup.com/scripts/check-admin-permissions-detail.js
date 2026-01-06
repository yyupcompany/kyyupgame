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

async function checkAdminPermissions() {
  try {
    console.log('🔍 检查admin和principal角色的动态菜单和权限配置...\n');
    
    // 1. 检查admin角色的所有权限（包括中心页面）
    console.log('=' .repeat(80));
    console.log('1. admin角色的中心页面权限');
    console.log('='.repeat(80));
    
    const [adminCenterPerms] = await sequelize.query(`
      SELECT p.id, p.code, p.name, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = 1
        AND (p.code LIKE '%CENTER%' OR p.name LIKE '%中心%')
      ORDER BY p.code
    `);
    
    console.log(`\nadmin角色的中心页面权限 (${adminCenterPerms.length}个):`);
    console.table(adminCenterPerms);
    
    // 2. 检查principal角色的所有权限（包括中心页面）
    console.log('\n' + '='.repeat(80));
    console.log('2. principal角色的中心页面权限');
    console.log('='.repeat(80));
    
    const [principalCenterPerms] = await sequelize.query(`
      SELECT p.id, p.code, p.name, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = 2
        AND (p.code LIKE '%CENTER%' OR p.name LIKE '%中心%')
      ORDER BY p.code
    `);
    
    console.log(`\nprincipal角色的中心页面权限 (${principalCenterPerms.length}个):`);
    console.table(principalCenterPerms);
    
    // 3. 对比差异
    console.log('\n' + '='.repeat(80));
    console.log('3. 权限差异分析');
    console.log('='.repeat(80));
    
    const adminCodes = new Set(adminCenterPerms.map(p => p.code));
    const principalCodes = new Set(principalCenterPerms.map(p => p.code));
    
    const missingInPrincipal = adminCenterPerms.filter(p => !principalCodes.has(p.code));
    const extraInPrincipal = principalCenterPerms.filter(p => !adminCodes.has(p.code));
    
    console.log(`\n❌ principal缺少的权限 (${missingInPrincipal.length}个):`);
    if (missingInPrincipal.length > 0) {
      console.table(missingInPrincipal);
    } else {
      console.log('   无缺失权限');
    }
    
    console.log(`\n⚠️  principal多出的权限 (${extraInPrincipal.length}个):`);
    if (extraInPrincipal.length > 0) {
      console.table(extraInPrincipal);
    } else {
      console.log('   无多余权限');
    }
    
    // 4. 检查动态菜单配置
    console.log('\n' + '='.repeat(80));
    console.log('4. 动态菜单配置检查');
    console.log('='.repeat(80));
    
    // 检查是否有dynamic_menus表
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'dynamic_menus'
    `);
    
    if (tables.length > 0) {
      console.log('\n✅ 找到dynamic_menus表');
      
      // 查询admin的动态菜单
      const [adminMenus] = await sequelize.query(`
        SELECT dm.*
        FROM dynamic_menus dm
        INNER JOIN role_menus rm ON dm.id = rm.menu_id
        WHERE rm.role_id = 1
          AND (dm.path LIKE '%/centers/%' OR dm.name LIKE '%中心%')
        ORDER BY dm.path
      `);
      
      console.log(`\nadmin角色的中心菜单 (${adminMenus.length}个):`);
      if (adminMenus.length > 0) {
        console.table(adminMenus.map(m => ({
          id: m.id,
          name: m.name,
          path: m.path,
          permission_code: m.permission_code
        })));
      } else {
        console.log('   未找到中心菜单配置');
      }
      
      // 查询principal的动态菜单
      const [principalMenus] = await sequelize.query(`
        SELECT dm.*
        FROM dynamic_menus dm
        INNER JOIN role_menus rm ON dm.id = rm.menu_id
        WHERE rm.role_id = 2
          AND (dm.path LIKE '%/centers/%' OR dm.name LIKE '%中心%')
        ORDER BY dm.path
      `);
      
      console.log(`\nprincipal角色的中心菜单 (${principalMenus.length}个):`);
      if (principalMenus.length > 0) {
        console.table(principalMenus.map(m => ({
          id: m.id,
          name: m.name,
          path: m.path,
          permission_code: m.permission_code
        })));
      } else {
        console.log('   未找到中心菜单配置');
      }
    } else {
      console.log('\n⚠️  未找到dynamic_menus表，可能使用其他方式管理菜单');
    }
    
    // 5. 检查具体失败的页面权限
    console.log('\n' + '='.repeat(80));
    console.log('5. 失败页面的权限配置检查');
    console.log('='.repeat(80));
    
    const failedPages = [
      { name: '活动中心', path: '/centers/activity', possibleCodes: ['ACTIVITY_CENTER', 'ACTIVITY_CENTER_VIEW', 'activity_center_page'] },
      { name: '营销中心', path: '/centers/marketing', possibleCodes: ['MARKETING_CENTER', 'MARKETING_CENTER_VIEW', 'marketing_center_page'] },
      { name: '客户池中心', path: '/centers/customer-pool', possibleCodes: ['CUSTOMER_POOL_CENTER', 'CUSTOMER_POOL_CENTER_VIEW', 'customer_pool_center_page'] },
      { name: '财务中心', path: '/centers/finance', possibleCodes: ['FINANCE_CENTER', 'FINANCE_CENTER_VIEW', 'finance_center_page'] },
      { name: '任务中心', path: '/centers/task', possibleCodes: ['TASK_CENTER', 'TASK_CENTER_CATEGORY', 'task_center_page'] },
      { name: '教学中心', path: '/centers/teaching', possibleCodes: ['TEACHING_CENTER', 'TEACHING_CENTER_VIEW', 'teaching_center_page'] },
      { name: '话术中心', path: '/centers/script', possibleCodes: ['SCRIPT_CENTER', 'SCRIPT_CENTER_PAGE'] },
      { name: '新媒体中心', path: '/centers/media', possibleCodes: ['MEDIA_CENTER', 'MEDIA_CENTER_PAGE'] }
    ];
    
    for (const page of failedPages) {
      console.log(`\n📋 ${page.name} (${page.path}):`);
      
      // 检查所有可能的权限代码
      for (const code of page.possibleCodes) {
        const [perm] = await sequelize.query(`
          SELECT p.id, p.code, p.name,
                 (SELECT COUNT(*) FROM role_permissions WHERE role_id = 1 AND permission_id = p.id) as admin_has,
                 (SELECT COUNT(*) FROM role_permissions WHERE role_id = 2 AND permission_id = p.id) as principal_has
          FROM permissions p
          WHERE p.code = '${code}'
        `);
        
        if (perm.length > 0) {
          const p = perm[0];
          console.log(`   ${code}:`);
          console.log(`      - 权限ID: ${p.id}`);
          console.log(`      - 权限名称: ${p.name}`);
          console.log(`      - admin拥有: ${p.admin_has > 0 ? '✅ 是' : '❌ 否'}`);
          console.log(`      - principal拥有: ${p.principal_has > 0 ? '✅ 是' : '❌ 否'}`);
        } else {
          console.log(`   ${code}: ⚠️  权限不存在`);
        }
      }
    }
    
    // 6. 总结
    console.log('\n' + '='.repeat(80));
    console.log('📊 总结');
    console.log('='.repeat(80));
    
    console.log(`\n1. admin角色中心权限数: ${adminCenterPerms.length}个`);
    console.log(`2. principal角色中心权限数: ${principalCenterPerms.length}个`);
    console.log(`3. principal缺少的权限: ${missingInPrincipal.length}个`);
    
    if (missingInPrincipal.length > 0) {
      console.log('\n⚠️  建议: 将以下权限添加到principal角色:');
      missingInPrincipal.forEach(p => {
        console.log(`   - ${p.code} (${p.name})`);
      });
    } else {
      console.log('\n✅ principal角色拥有所有admin的中心权限');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

checkAdminPermissions();

