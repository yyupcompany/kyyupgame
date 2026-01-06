const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 修改英文菜单名称并重新排序 ===');
  
  // 1. 修改招生管理中的英文菜单名称
  const enrollmentMenuUpdates = [
    { id: 1091, chinese_name: '申请管理', name: '申请管理' },
    { id: 1095, chinese_name: '招生计划', name: '招生计划' },
    { id: 1174, chinese_name: '名额管理', name: '名额管理' },
  ];
  
  console.log('\n=== 修改招生管理英文菜单名称 ===');
  for (const update of enrollmentMenuUpdates) {
    try {
      await connection.execute(
        'UPDATE permissions SET chinese_name = ?, name = ?, updated_at = NOW() WHERE id = ?',
        [update.chinese_name, update.name, update.id]
      );
      console.log(`✅ [${update.id}] 已更新为: ${update.chinese_name}`);
    } catch (error) {
      console.error(`❌ 更新失败 [${update.id}]: ${error.message}`);
    }
  }
  
  // 2. 修改系统管理中的英文菜单名称
  const systemMenuUpdates = [
    { id: 1155, chinese_name: '班级列表', name: '班级列表' },
    { id: 1156, chinese_name: '自定义布局', name: '自定义布局' },
    { id: 1157, chinese_name: '数据统计', name: '数据统计' },
    { id: 1158, chinese_name: '重要通知', name: '重要通知' },
    { id: 1159, chinese_name: '绩效管理', name: '绩效管理' },
    { id: 1160, chinese_name: '日程管理', name: '日程管理' },
    { id: 1224, chinese_name: 'AI模型配置', name: 'AI模型配置' },
    { id: 1238, chinese_name: '权限管理', name: '权限管理' },
    { id: 1239, chinese_name: '权限配置', name: '权限配置' },
    { id: 1241, chinese_name: '角色管理', name: '角色管理' },
    { id: 1242, chinese_name: '系统设置', name: '系统设置' },
    { id: 1243, chinese_name: '用户管理', name: '用户管理' },
  ];
  
  console.log('\n=== 修改系统管理英文菜单名称 ===');
  for (const update of systemMenuUpdates) {
    try {
      await connection.execute(
        'UPDATE permissions SET chinese_name = ?, name = ?, updated_at = NOW() WHERE id = ?',
        [update.chinese_name, update.name, update.id]
      );
      console.log(`✅ [${update.id}] 已更新为: ${update.chinese_name}`);
    } catch (error) {
      console.error(`❌ 更新失败 [${update.id}]: ${error.message}`);
    }
  }
  
  // 3. 重新排序招生管理菜单（按功能逻辑排序）
  const enrollmentSortOrder = [
    // 招生计划相关 (1-10)
    { id: 1095, sort: 1 },  // 招生计划
    { id: 1263, sort: 2 },  // 制定招生计划
    { id: 1173, sort: 3 },  // 计划列表
    { id: 1257, sort: 4 },  // 招生计划管理
    { id: 1177, sort: 5 },  // AI预测
    { id: 1174, sort: 6 },  // 名额管理
    
    // 客户管理相关 (11-20)
    { id: 1148, sort: 11 }, // 客户概览
    { id: 1204, sort: 12 }, // 客户池总览
    { id: 1166, sort: 13 }, // 自动跟进
    { id: 1167, sort: 14 }, // 漏斗分析
    { id: 1169, sort: 15 }, // 个性化策略
    
    // 家长管理相关 (21-30)
    { id: 1201, sort: 21 }, // 家长概览
    { id: 1196, sort: 22 }, // 家长列表
    { id: 1261, sort: 23 }, // 家长信息审核
    
    // 申请管理相关 (31-40)
    { id: 1091, sort: 31 }, // 申请管理
    { id: 1128, sort: 32 }, // 申请列表
    { id: 1264, sort: 33 }, // 招生申请审核
    
    // 招生管理总入口 (41-50)
    { id: 1168, sort: 41 }, // 招生管理
  ];
  
  console.log('\n=== 重新排序招生管理菜单 ===');
  for (const sortItem of enrollmentSortOrder) {
    try {
      await connection.execute(
        'UPDATE permissions SET sort = ?, updated_at = NOW() WHERE id = ?',
        [sortItem.sort, sortItem.id]
      );
      console.log(`✅ [${sortItem.id}] 排序设置为: ${sortItem.sort}`);
    } catch (error) {
      console.error(`❌ 排序失败 [${sortItem.id}]: ${error.message}`);
    }
  }
  
  console.log('\n=== 修改完成，查看更新后的结果 ===');
  
  // 查看招生管理分类的菜单
  const [enrollmentMenus] = await connection.execute(`
    SELECT id, name, chinese_name, path, sort
    FROM permissions 
    WHERE parent_id = 2008 AND type = 'menu' AND status = 1
    ORDER BY sort, chinese_name
  `);
  
  console.log('\n📁 招生管理 (按功能排序):');
  enrollmentMenus.forEach((menu, index) => {
    console.log(`   ${index + 1}. [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path} (排序: ${menu.sort})`);
  });
  
  // 查看系统管理分类的菜单
  const [systemMenus] = await connection.execute(`
    SELECT id, name, chinese_name, path, sort
    FROM permissions 
    WHERE parent_id = 2013 AND type = 'menu' AND status = 1
    ORDER BY chinese_name
  `);
  
  console.log('\n📁 系统管理 (中文名称):');
  systemMenus.forEach((menu, index) => {
    console.log(`   ${index + 1}. [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path}`);
  });
  
  await connection.end();
})().catch(console.error);
